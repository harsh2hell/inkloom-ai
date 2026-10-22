import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResolutionStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const { resolutionStatus, dismissReason, userId, userName, userRole } = body;

    const finding = await prisma.finding.findUnique({
      where: { id },
      include: {
        analysisRun: {
          include: { contentVersion: true },
        },
      },
    });

    if (!finding) {
      return NextResponse.json({ error: "Finding not found." }, { status: 404 });
    }

    if (resolutionStatus === ResolutionStatus.DISMISSED && (!dismissReason || dismissReason.trim().length < 3)) {
      return NextResponse.json(
        { error: "A valid explanation reason is required to dismiss a compliance finding." },
        { status: 400 }
      );
    }

    const updated = await prisma.finding.update({
      where: { id },
      data: {
        resolutionStatus: resolutionStatus as ResolutionStatus,
        dismissReason: dismissReason || null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: `FINDING_${resolutionStatus}`,
        userId: userId || "usr_admin_01",
        userName: userName || "Sarah Chen",
        userRole: userRole || "BRAND_ADMIN",
        entityType: "FINDING",
        entityId: finding.id,
        details: JSON.stringify({
          type: finding.type,
          affectedText: finding.affectedText,
          resolutionStatus,
          dismissReason,
          contentVersionId: finding.analysisRun.contentVersionId,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
