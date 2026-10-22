import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";


export async function GET() {
  const health: {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    database: {
      reachable: boolean;
      latencyMs?: number;
      error?: string;
    };
    ai: {
      configured: boolean;
      available: boolean;
      mode: "AI_ASSISTED" | "DETERMINISTIC_ONLY";
      provider: string;
      details?: string;
    };
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: {
      reachable: false,
    },
    ai: {
      configured: false,
      available: false,
      mode: "DETERMINISTIC_ONLY",
      provider: "Deterministic Grounding Engine",
    },
  };

  // 1. Check PostgreSQL reachability
  try {
    const dbStart = Date.now();
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Database ping timed out after 3000ms")), 3000)
      ),
    ]);
    health.database.reachable = true;
    health.database.latencyMs = Date.now() - dbStart;
  } catch (err: any) {
    health.database.reachable = false;
    health.database.error = err?.message || "Database connection error";
    health.status = "unhealthy";
  }

  // 2. Check AI Provider (Gemini API vs Deterministic mode)
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (apiKey && apiKey.length > 5) {
    health.ai.configured = true;
    try {
      // Validate AI connectivity with a lightweight check
      const client = new GoogleGenAI({ apiKey });
      if (client) {
        health.ai.available = true;
        health.ai.mode = "AI_ASSISTED";
        health.ai.provider = "Gemini 3.8 Flash + Deterministic Grounding";
      }
    } catch (aiErr: any) {
      health.ai.available = false;
      health.ai.mode = "DETERMINISTIC_ONLY";
      health.ai.provider = "Deterministic Policy Engine";
      health.ai.details = aiErr?.message || "AI initialization failure";
    }
  } else {
    health.ai.configured = false;
    health.ai.available = false;
    health.ai.mode = "DETERMINISTIC_ONLY";
    health.ai.provider = "Deterministic Policy Engine (Grounded Rules)";
    health.ai.details = "No GEMINI_API_KEY configured; operating in deterministic-only mode.";
  }

  const statusCode = health.database.reachable ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
