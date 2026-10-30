import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface RewriteOption {
  tone: "LEGAL_SAFE" | "GROWTH_MARKETING" | "CREATOR_VIRAL";
  title: string;
  badge: string;
  rewrittenText: string;
  rationale: string;
  complianceConfidence: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { textContent, findingExplanation, approvedFacts } = body;

    if (!textContent || typeof textContent !== "string") {
      return NextResponse.json({ error: "Draft copy textContent is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const isAiAvailable = Boolean(apiKey && apiKey.length > 5);

    // If Gemini API is available, generate grounded variations using Gemini 3.5/3.8 Flash
    if (isAiAvailable) {
      try {
        const client = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are the Inkloom AI Brand Copy Rewrite Engine.
Your task is to take a marketing draft that has compliance violations or risks and generate THREE strictly compliant alternative rewrites.

BRAND SOURCE FACTS & CONSTRAINTS:
${JSON.stringify(approvedFacts || [
  "Verdanta Plant Crunch contains 11g of plant protein per 100g.",
  "Contains 6g added organic cane sugar. NEVER claim sugar-free or zero sugar.",
  "Permitted claim: 'A delicious source of protein to power your day.'",
  "Prohibited claims: 'sugar-free', 'diabetes-friendly', 'cures fatigue'.",
  "Mandatory disclosure: 'This product is not a substitute for a balanced diet.'"
], null, 2)}

VIOLATIONS TO FIX:
${findingExplanation || "Eliminate prohibited claims (sugar-free, diabetes), ensure protein is stated accurately as 11g or 'source of protein', and include mandatory balanced diet disclosure."}

OUTPUT FORMAT:
Respond ONLY with a valid JSON array of 3 objects with these exact keys:
[
  {
    "tone": "LEGAL_SAFE",
    "title": "Legal-First & Conservative",
    "badge": "Zero Liability",
    "rewrittenText": "strictly compliant text",
    "rationale": "why this is 100% compliant",
    "complianceConfidence": 100
  },
  {
    "tone": "GROWTH_MARKETING",
    "title": "Conversion & Growth",
    "badge": "High Engagement",
    "rewrittenText": "persuasive yet compliant text",
    "rationale": "retains marketing punch with full compliance",
    "complianceConfidence": 98
  },
  {
    "tone": "CREATOR_VIRAL",
    "title": "Creator & Social Hook",
    "badge": "Punchy & Modern",
    "rewrittenText": "social media hook with emojis and disclaimers",
    "rationale": "viral tone with mandatory disclosures retained",
    "complianceConfidence": 96
  }
]`;

        const userPrompt = `ORIGINAL DRAFT COPY TO REWRITE COMPLIANTLY:
<untrusted_draft>
${textContent}
</untrusted_draft>

Provide 3 grounded rewrite alternatives now as JSON array only.`;

        const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];
        let rawJson = "";

        for (const m of candidateModels) {
          try {
            const resp = await Promise.race([
              client.models.generateContent({
                model: m,
                contents: userPrompt,
                config: {
                  systemInstruction: systemPrompt,
                  responseMimeType: "application/json",
                },
              }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 7000)),
            ]);
            rawJson = resp.text?.trim() || "";
            if (rawJson) break;
          } catch {
            // try next
          }
        }

        if (rawJson) {
          const match = rawJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          const clean = match ? match[1].trim() : rawJson.trim();
          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            return NextResponse.json({
              success: true,
              mode: "AI_GENERATED",
              model: "Gemini 3.5/3.8 Flash",
              options: parsed,
            });
          }
        }
      } catch (err: any) {
        console.warn("AI Rewrite generation failed, falling back to deterministic templates:", err?.message || err);
      }
    }

    // Deterministic Rule-Based Fallback Rewrites
    const deterministicOptions: RewriteOption[] = [
      {
        tone: "LEGAL_SAFE",
        title: "Legal-First & Conservative",
        badge: "Zero Liability",
        rewrittenText:
          "Fuel up with Verdanta Plant Crunch! A delicious source of protein to power your day. Contains 6g added sugar. This product is not a substitute for a balanced diet.",
        rationale: "Uses exact pre-approved product specifications from KB-VER-001 and includes the mandatory dietary disclosure (KB-VER-006).",
        complianceConfidence: 100,
      },
      {
        tone: "GROWTH_MARKETING",
        title: "Conversion & Growth",
        badge: "High Engagement",
        rewrittenText:
          "Ready to crush your wellness goals? Grab Verdanta Plant Crunch! Packed with wholesome plant energy and a proven source of protein to power every workout. Contains added sugar. This product is not a substitute for a balanced diet.",
        rationale: "Retains high-converting athletic positioning while stripping out prohibited diabetes and sugar-free claims.",
        complianceConfidence: 98,
      },
      {
        tone: "CREATOR_VIRAL",
        title: "Creator & Social Hook",
        badge: "Punchy & Modern",
        rewrittenText:
          "Your new afternoon snack obsession is here 🌱 Meet Verdanta Plant Crunch! Delicious plant protein energy when that 3 PM slump hits. Contains added sugar. This product is not a substitute for a balanced diet.",
        rationale: "Optimized for Instagram and TikTok creator captions with conversational language and required statutory disclaimers.",
        complianceConfidence: 96,
      },
    ];

    return NextResponse.json({
      success: true,
      mode: "DETERMINISTIC_TEMPLATES",
      model: "Inkloom Grounded Policy Rules",
      options: deterministicOptions,
    });
  } catch (error: any) {
    console.error("Rewrite API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate compliance rewrites." },
      { status: 500 }
    );
  }
}

