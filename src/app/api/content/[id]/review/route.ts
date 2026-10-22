import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canApproveContent, canOverrideFindings, UserContext } from "@/lib/auth/roles";
import { ReviewDecision, ContentStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const { versionId, reviewerId, decision, notes } = body;

    const contentItem = await prisma.contentItem.findUnique({
      where: { id },
      include: {
        versions: {
          where: { id: versionId },
          include: {
            analysisRuns: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { findings: true },
            },
          },
        },
      },
    });

    if (!contentItem || contentItem.versions.length === 0) {
      return NextResponse.json({ error: "Content item or version not found." }, { status: 404 });
    }

    const version = contentItem.versions[0];
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer) {
      return NextResponse.json({ error: "Reviewer user not found." }, { status: 400 });
    }

    const reviewerContext: UserContext = {
      id: reviewer.id,
      name: reviewer.name,
      email: reviewer.email,
      role: reviewer.role,
      organization: reviewer.organization,
    };

    // 1. Enforce RBAC Rules
    if (decision === ReviewDecision.APPROVED) {
      const check = canApproveContent(reviewerContext, version.submittedById);
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason }, { status: 403 });
      }

      // Check if unresolved high-severity or unverified findings exist without explicit override
      const latestRun = version.analysisRuns[0];
      const openHighRisk = latestRun?.findings.filter(
        (f) => f.requiresHumanReview && f.resolutionStatus === "OPEN"
      ) || [];

      if (openHighRisk.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot approve: Version contains ${openHighRisk.length} open high-risk or unverified findings requiring resolution or explicit override.`,
          },
          { status: 400 }
        );
      }
    }

    if (decision === ReviewDecision.OVERRIDE) {
      const check = canOverrideFindings(reviewerContext);
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason }, { status: 403 });
      }
      if (!notes || notes.trim().length < 5) {
        return NextResponse.json(
          { error: "Explicit written rationale is required to override policy findings." },
          { status: 400 }
        );
      }
    }

    // 2. Map ReviewDecision to ContentStatus
    let newStatus: ContentStatus = ContentStatus.SUBMITTED;
    if (decision === ReviewDecision.APPROVED || decision === ReviewDecision.OVERRIDE) {
      newStatus = ContentStatus.APPROVED;
    } else if (decision === ReviewDecision.REJECTED) {
      newStatus = ContentStatus.REJECTED;
    } else if (decision === ReviewDecision.CHANGES_REQUESTED) {
      newStatus = ContentStatus.CHANGES_REQUESTED;
    }

    // 3. Create HumanReview record
    const humanReview = await prisma.humanReview.create({
      data: {
        contentVersionId: version.id,
        reviewerId: reviewer.id,
        decision: decision as ReviewDecision,
        notes: notes || null,
      },
    });

    // 4. Update Version and ContentItem status
    await prisma.contentVersion.update({
      where: { id: version.id },
      data: { status: newStatus },
    });

    await prisma.contentItem.update({
      where: { id: contentItem.id },
      data: { status: newStatus },
    });

    // 5. Record immutable Audit Log
    await prisma.auditLog.create({
      data: {
        action: `CONTENT_${decision}`,
        userId: reviewer.id,
        userName: reviewer.name,
        userRole: reviewer.role,
        entityType: "CONTENT_REVIEW",
        entityId: humanReview.id,
        details: JSON.stringify({
          contentItemId: contentItem.id,
          versionNumber: version.versionNumber,
          decision,
          notes,
          newStatus,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      humanReview,
      newStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
