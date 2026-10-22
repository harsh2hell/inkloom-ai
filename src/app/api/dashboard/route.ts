import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FindingType, ContentStatus, FindingSeverity } from "@prisma/client";

export async function GET() {
  try {
    // 1. Total content items
    const totalContent = await prisma.contentItem.count();
    const approvedContent = await prisma.contentItem.count({
      where: { status: ContentStatus.APPROVED },
    });
    const pendingReviews = await prisma.contentItem.count({
      where: { status: { in: [ContentStatus.SUBMITTED, ContentStatus.CHANGES_REQUESTED] } },
    });

    // 2. Findings by type across all completed analysis runs
    const findings = await prisma.finding.findMany({
      select: {
        type: true,
        severity: true,
        resolutionStatus: true,
        requiresHumanReview: true,
      },
    });

    const findingsByType = {
      verifiedContradictions: findings.filter((f) => f.type === FindingType.VERIFIED_CONTRADICTION).length,
      unsupportedClaims: findings.filter((f) => f.type === FindingType.UNSUPPORTED_CLAIM).length,
      insufficientEvidence: findings.filter((f) => f.type === FindingType.INSUFFICIENT_EVIDENCE).length,
      possibleRisks: findings.filter((f) => f.type === FindingType.POSSIBLE_RISK).length,
      styleSuggestions: findings.filter((f) => f.type === FindingType.STYLE_SUGGESTION).length,
      totalFindings: findings.length,
      openFindings: findings.filter((f) => f.resolutionStatus === "OPEN").length,
      resolvedFindings: findings.filter((f) => f.resolutionStatus !== "OPEN").length,
      highSeverity: findings.filter((f) => f.severity === FindingSeverity.HIGH).length,
    };

    // 3. Knowledge items count
    const totalKnowledge = await prisma.knowledgeItem.count();
    const expiredKnowledge = await prisma.knowledgeItem.count({
      where: { expiryDate: { lt: new Date() } },
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
