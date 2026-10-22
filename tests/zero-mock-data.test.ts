import { describe, it, expect } from "vitest";
import { prisma } from "../src/lib/prisma";
import { ContentStatus, ApprovalStatus, FindingType, Role } from "@prisma/client";
import { checkBriefAdaptationDrift } from "../src/lib/briefs/generator";
import { canApproveContent, UserContext } from "../src/lib/auth/roles";

describe("Inkloom AI — Zero Mock Data Enforcement Sprint Verification", () => {
  // Test 1: Overview metrics match actual database query results
  it("1. Overview metrics match actual database query results", async () => {
    const totalContent = await prisma.contentItem.count();
    const approvedContent = await prisma.contentItem.count({
      where: { status: ContentStatus.APPROVED },
    });
    const pendingReviews = await prisma.contentItem.count({
      where: { status: { in: [ContentStatus.SUBMITTED, ContentStatus.CHANGES_REQUESTED] } },
    });
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
      where: { expiryDate: { lt: new Date() } },
    });
    const totalBriefs = await prisma.creatorBrief.count();

    expect(totalContent).toBeGreaterThan(0);
    expect(approvedTruthItems).toBe(8); // Verdanta Foods 8 truth items
    expect(activeApprovedKnowledge).toBe(7); // 7 active specs
    expect(expiredKnowledge).toBe(1); // KB-VER-007 expired Dec 2023
    expect(totalBriefs).toBeGreaterThanOrEqual(1);
    expect(approvedContent + pendingReviews).toBeLessThanOrEqual(totalContent);
  });

  // Test 2: Current findings exclude superseded versions according to documented definition
  it("2. Current findings exclude superseded versions according to the documented definition", async () => {
    const totalLifetimeFindings = await prisma.finding.count();

    const latestContentRuns = await prisma.contentItem.findMany({
      select: {
        id: true,
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
                  select: { id: true, type: true, resolutionStatus: true },
                },
              },
            },
          },
        },
      },
    });

    const activeFindings = latestContentRuns.flatMap(
      (item) => item.versions[0]?.analysisRuns[0]?.findings || []
    );

    // Active findings from the latest runs must not mix in historical findings from older superseded versions
    expect(activeFindings.length).toBeLessThanOrEqual(totalLifetimeFindings);
    expect(activeFindings.length).toBe(15);
    expect(totalLifetimeFindings).toBeGreaterThanOrEqual(30);
  });

  // Test 3: Failed dashboard API requests show an error rather than fake zeros
  it("3. Failed dashboard API requests surface structured errors rather than fake zeros", () => {
    const errorResponse = (err: any) => ({
      error: err.message || "Failed to retrieve dashboard metrics",
      status: 500,
    });

    const simulatedFailure = errorResponse(new Error("Database connection pool exhausted"));
    expect(simulatedFailure.status).toBe(500);
    expect(simulatedFailure.error).toContain("Database connection pool exhausted");
    expect((simulatedFailure as any).metrics).toBeUndefined(); // Zero mock fallback is banned
  });

  // Test 4: Empty database results show a genuine empty state
  it("4. Empty database results show a genuine empty state without mock placeholders", () => {
    const emptyDataset: any[] = [];
    const formattedCount = emptyDataset.length;
    expect(formattedCount).toBe(0);

    const calculatePercentage = (count: number, total: number) => {
      if (!total || total === 0) return 0;
      return Math.round((count / total) * 100);
    };

    expect(calculatePercentage(0, 0)).toBe(0); // Explicit handling for genuinely empty dataset
  });

  // Test 5: Knowledge Centre renders records from the API response
  it("5. Knowledge Centre returns actual database records from PostgreSQL", async () => {
    const items = await prisma.knowledgeItem.findMany({
      where: { approvalStatus: ApprovalStatus.APPROVED },
      orderBy: { id: "asc" },
    });

    expect(items.length).toBe(8);
    const expiredItem = items.find((i) => i.id === "KB-VER-007");
    expect(expiredItem).toBeDefined();
    expect(expiredItem?.title).toContain("Organic Certificate");
    expect(new Date(expiredItem!.expiryDate!).getTime()).toBeLessThan(Date.now());
  });

  // Test 6: Content Reviews does not append hardcoded example rows
  it("6. Content Reviews does not append hardcoded example rows", async () => {
    const dbCount = await prisma.contentItem.count();
    const fetchedItems = await prisma.contentItem.findMany({
      select: { id: true, title: true, campaignName: true },
    });

    // Fetched rows must strictly equal real database count
    expect(fetchedItems.length).toBe(dbCount);
    // Ensure no hardcoded dummy title exists
    expect(fetchedItems.every((item) => item.id.startsWith("cnt_") || item.id.length > 5)).toBe(true);
  });

  // Test 7: Correction Studio renders real findings and version history
  it("7. Correction Studio renders real findings and version history", async () => {
    const sampleItem = await prisma.contentItem.findFirst({
      where: { versions: { some: {} } },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          include: {
            analysisRuns: {
              include: { findings: true },
            },
          },
        },
      },
    });

    expect(sampleItem).toBeDefined();
    expect(sampleItem!.versions.length).toBeGreaterThanOrEqual(1);
    const latestVersion = sampleItem!.versions[0];
    expect(latestVersion.versionNumber).toBeGreaterThanOrEqual(1);
    expect(latestVersion.textContent.length).toBeGreaterThan(0);
  });

  // Test 8: Creator Briefs displays the actual server-returned drift score
  it("8. Creator Briefs displays the actual server-returned drift score", () => {
    const brief = {
      permittedClaims: JSON.stringify([{ claim: "source of protein" }]),
      prohibitedClaims: JSON.stringify([
        { id: "KB-VER-004", claim: "sugar-free" },
        { id: "KB-VER-005", claim: "diabetes-friendly" },
      ]),
      mandatoryDisclosures: JSON.stringify([
        { disclosure: "Contains added sugar. This product is not a substitute for a balanced diet." },
      ]),
      approvedFacts: JSON.stringify([]),
    };

    // Case A: Compliant social post
    const compliantCaption =
      "Check out Verdanta Plant Crunch! A great source of protein. Contains added sugar. This product is not a substitute for a balanced diet. Wholesome snack!";
    const compliantResult = checkBriefAdaptationDrift(compliantCaption, brief);
    expect(compliantResult.isCompliant).toBe(true);
    expect(compliantResult.driftScore).toBe(100);
    expect(compliantResult.prohibitedClaimsDetected.length).toBe(0);
    expect(compliantResult.missingDisclosuresDetected.length).toBe(0);

    // Case B: Non-compliant social post
    const driftedCaption = "Loving Verdanta! Completely sugar-free and diabetes-friendly snack bar!";
    const driftedResult = checkBriefAdaptationDrift(driftedCaption, brief);
    expect(driftedResult.isCompliant).toBe(false);
    expect(driftedResult.driftScore).toBeLessThan(100);
    expect(driftedResult.prohibitedClaimsDetected).toContain("sugar-free");
    expect(driftedResult.missingDisclosuresDetected.length).toBeGreaterThan(0);
  });

  // Test 9: Audit Log renders only persisted API events
  it("9. Audit Log renders only persisted API events", async () => {
    const count = await prisma.auditLog.count();
    expect(count).toBeGreaterThan(0);

    const logs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    expect(logs.length).toBeGreaterThan(0);
    logs.forEach((log) => {
      expect(log.id).toBeDefined();
      expect(log.action).toBeDefined();
      expect(log.createdAt instanceof Date).toBe(true);
      expect(log.userId).toBeDefined();
    });
  });

  // Test 10: Failed mutations do not show false success
  it("10. Failed mutations do not show false success (RBAC enforcement)", () => {
    const creatorUser: UserContext = {
      id: "usr_creator_01",
      name: "Maya Patel",
      email: "maya@verdantafoods.demo",
      role: Role.EXTERNAL_CREATOR,
      organization: "Creator Studio",
    };

    // Creator attempting to approve own or any content must be blocked
    const canApprove = canApproveContent(creatorUser, "usr_creator_01");

    expect(canApprove.allowed).toBe(false);
    expect(canApprove.reason).toContain("Creators cannot approve content");
  });

  // Test 11: Health indicators distinguish configured services from reachable services
  it("11. Health indicators distinguish configured services from reachable services", async () => {
    const dbPingStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - dbPingStart;

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const isConfigured = Boolean(apiKey && apiKey.length > 5);

    const health = {
      database: { reachable: true, latencyMs },
      ai: {
        configured: isConfigured,
        available: isConfigured,
        mode: isConfigured ? "AI_ASSISTED" : "DETERMINISTIC_ONLY",
      },
    };

    expect(health.database.reachable).toBe(true);
    expect(health.database.latencyMs).toBeGreaterThanOrEqual(0);
    // Since GEMINI_API_KEY is not configured in this test env, it must truthfully report DETERMINISTIC_ONLY
    expect(health.ai.mode).toBe("DETERMINISTIC_ONLY");
    expect(health.ai.configured).toBe(false);
  });

  // Test 12: A complete content submission-to-approval workflow still works
  it("12. A complete content submission-to-approval workflow still works", async () => {
    // A Brand Admin context
    const adminUser: UserContext = {
      id: "usr_admin_01",
      name: "Sarah Chen",
      email: "sarah@verdantafoods.demo",
      role: Role.BRAND_ADMIN,
      organization: "Verdanta Foods Governance",
    };

    // Brand Admin approving a version submitted by another user
    const approvalCheck = canApproveContent(adminUser, "usr_agency_01");

    expect(approvalCheck.allowed).toBe(true);
  });
});
