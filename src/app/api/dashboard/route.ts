import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FindingType, ContentStatus, FindingSeverity, ApprovalStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    const contentFilter: any = {};
    if (userId && (role === "AGENCY_CREATOR" || role === "EXTERNAL_CREATOR")) {
      contentFilter.submitterId = userId;
    }

    // 1. Total content items (Unique campaigns/drafts)
    const totalContent = await prisma.contentItem.count({ where: contentFilter });
    const approvedContent = await prisma.contentItem.count({
      where: { ...contentFilter, status: ContentStatus.APPROVED },
    });
    const pendingReviews = await prisma.contentItem.count({
      where: { ...contentFilter, status: { in: [ContentStatus.SUBMITTED, ContentStatus.CHANGES_REQUESTED] } },
    });

    // 2. Non-duplicated findings from the latest analysis run of each active content item
    const latestContentRuns = await prisma.contentItem.findMany({
      where: contentFilter,
      select: {
        id: true,
        status: true,
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          select: {
            id: true,
            versionNumber: true,
            analysisRuns: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                findings: {
                  select: {
                    id: true,
                    type: true,
                    severity: true,
                    resolutionStatus: true,
                    requiresHumanReview: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Flatten findings strictly from current latest versions to prevent cross-version duplication
    const activeFindings = latestContentRuns.flatMap(
      (item) => item.versions[0]?.analysisRuns[0]?.findings || []
    );

    // Lifetime historical audit count
    const totalLifetimeFindings = await prisma.finding.count();

    const findingsByType = {
      verifiedContradictions: activeFindings.filter((f) => f.type === FindingType.VERIFIED_CONTRADICTION).length,
      unsupportedClaims: activeFindings.filter((f) => f.type === FindingType.UNSUPPORTED_CLAIM).length,
      insufficientEvidence: activeFindings.filter((f) => f.type === FindingType.INSUFFICIENT_EVIDENCE).length,
      possibleRisks: activeFindings.filter((f) => f.type === FindingType.POSSIBLE_RISK).length,
      styleSuggestions: activeFindings.filter((f) => f.type === FindingType.STYLE_SUGGESTION).length,
      totalFindings: activeFindings.length,
      openFindings: activeFindings.filter((f) => f.resolutionStatus === "OPEN").length,
      resolvedFindings: activeFindings.filter((f) => f.resolutionStatus !== "OPEN").length,
      highSeverity: activeFindings.filter((f) => f.severity === FindingSeverity.HIGH).length,
      totalLifetimeFindings,
    };

    // 3. Knowledge items count (Single Source of Truth)
    const totalKnowledge = await prisma.knowledgeItem.count();
    const approvedTruthItems = await prisma.knowledgeItem.count({
      where: { approvalStatus: ApprovalStatus.APPROVED },
    });
    const activeApprovedKnowledge = await prisma.knowledgeItem.count({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        OR: [{ expiryDate: null }, { expiryDate: { gte: new Date() } }],
      },
    });
    const expiredKnowledge = await prisma.knowledgeItem.count({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        expiryDate: { lt: new Date() },
      },
    });

    // 4. Creator briefs & submissions
    const totalBriefs = await prisma.creatorBrief.count();
    const totalCreatorSubmissions = await prisma.creatorSubmission.count();

    // 5. Recent audit events stream (last 10)
    const recentAuditEvents = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 6. Recent content items (last 5)
    const recentContent = await prisma.contentItem.findMany({
      where: contentFilter,
      include: {
        brand: true,
        submitter: true,
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          include: {
            analysisRuns: {
              take: 1,
              orderBy: { createdAt: "desc" },
              include: { findings: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      metrics: {
        totalContent,
        approvedContent,
        pendingReviews,
        approvedTruthItems,
        activeApprovedKnowledge,
        totalKnowledge,
        expiredKnowledge,
        totalBriefs,
        totalCreatorSubmissions,
      },
      findingsByType,
      recentAuditEvents,
      recentContent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
