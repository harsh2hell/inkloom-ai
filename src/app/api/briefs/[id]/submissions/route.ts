import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBriefAdaptationDrift } from "@/lib/briefs/generator";
import { canSubmitCreatorContent, canClearBrief, UserContext } from "@/lib/auth/roles";
import { ContentStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: briefId } = params;
    const body = await req.json();
    const { creatorId, title, caption } = body;

    const brief = await prisma.creatorBrief.findUnique({
      where: { id: briefId },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found." }, { status: 404 });
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
    });

    if (!creator) throw new Error("Creator user not found.");

    const creatorContext: UserContext = {
      id: creator.id,
      name: creator.name,
      email: creator.email,
      role: creator.role,
      organization: creator.organization,
    };

    const perm = canSubmitCreatorContent(creatorContext);
    if (!perm.allowed) {
      return NextResponse.json({ error: perm.reason }, { status: 403 });
    }

    // 1. Check Adaptation Drift against Brief rules
    const driftResult = checkBriefAdaptationDrift(caption, {
      permittedClaims: brief.permittedClaims,
      prohibitedClaims: brief.prohibitedClaims,
      mandatoryDisclosures: brief.mandatoryDisclosures,
      approvedFacts: brief.approvedFacts,
    });

    // 2. Create CreatorSubmission record
    const submission = await prisma.creatorSubmission.create({
      data: {
        briefId: brief.id,
        creatorId: creator.id,
        title: title || `Creator Adaptation: ${creator.name}`,
        caption,
        status: driftResult.isCompliant ? ContentStatus.SUBMITTED : ContentStatus.CHANGES_REQUESTED,
        adaptationDriftFlags: JSON.stringify(driftResult),
      },
      include: {
        creator: true,
      },
    });

    // 3. Record Audit Log
    await prisma.auditLog.create({
      data: {
        action: "CREATOR_FINAL_SUBMITTED",
        userId: creator.id,
        userName: creator.name,
        userRole: creator.role,
        entityType: "CREATOR_SUBMISSION",
        entityId: submission.id,
        details: JSON.stringify({
          briefId: brief.id,
          isCompliant: driftResult.isCompliant,
          driftScore: driftResult.driftScore,
          prohibitedCount: driftResult.prohibitedClaimsDetected.length,
          missingDisclosuresCount: driftResult.missingDisclosuresDetected.length,
        }),
      },
    });

    return NextResponse.json({
      submission,
      driftResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: briefId } = params;
    const body = await req.json();
    const { submissionId, reviewerId, decision, notes } = body;

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

    const perm = canClearBrief(reviewerContext);
    if (!perm.allowed) {
      return NextResponse.json({ error: perm.reason }, { status: 403 });
    }

    const clearanceStatus = decision === "CLEARED" ? "CLEARED" : "CHANGES_REQUESTED";

    const updated = await prisma.creatorSubmission.update({
      where: { id: submissionId },
      data: {
        clearanceStatus,
        clearedById: reviewer.id,
        clearedByName: reviewer.name,
        clearedAt: new Date(),
        clearanceNotes:
          notes ||
          (decision === "CLEARED"
            ? "Final publication clearance approved by human reviewer."
            : "Revisions requested by human reviewer prior to publication."),
        status: decision === "CLEARED" ? ContentStatus.APPROVED : ContentStatus.CHANGES_REQUESTED,
      },
      include: { creator: true },
    });

    await prisma.auditLog.create({
      data: {
        action: decision === "CLEARED" ? "CREATOR_FINAL_CLEARED" : "CREATOR_CLEARANCE_REJECTED",
        userId: reviewer.id,
        userName: reviewer.name,
        userRole: reviewer.role,
        entityType: "CREATOR_SUBMISSION",
        entityId: submissionId,
        details: JSON.stringify({
          briefId,
          submissionId,
          reviewerName: reviewer.name,
          decision: clearanceStatus,
          notes,
        }),
      },
    });

    return NextResponse.json({ submission: updated, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
