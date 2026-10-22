import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (entityType && entityType !== "ALL") {
      where.entityType = entityType;
    }
    if (userId && (role === "AGENCY_CREATOR" || role === "EXTERNAL_CREATOR")) {
      where.userId = userId;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
