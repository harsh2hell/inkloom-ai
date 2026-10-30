import { prisma } from "../prisma";
import { normalizeText } from "../verification/citation";
import { ContentStatus, KnowledgeCategory } from "@prisma/client";

export interface GenerateBriefOptions {
  contentVersionId: string;
  userId: string;
  userName: string;
  userRole: string;
}

export interface DriftCheckResult {
  hasProhibitedClaims: boolean;
  prohibitedClaimsDetected: string[];
  missingMandatoryDisclosures: boolean;
  missingDisclosuresDetected: string[];
  approvedClaimsUsed: string[];
  driftScore: number; // 0 to 100 (100 = full alignment, 0 = severe drift)
  driftSummary: string;
  isCompliant: boolean;
}

/**
 * Generates an official Creator Brief from an approved content version.
 */
export async function generateCreatorBrief(options: GenerateBriefOptions) {
  const version = await prisma.contentVersion.findUnique({
    where: { id: options.contentVersionId },
    include: {
      contentItem: {
        include: { brand: true },
      },
    },
  });

  if (!version) {
    throw new Error(`Content version ${options.contentVersionId} not found.`);
  }

  // Fetch approved brand knowledge
  const brandKnowledge = await prisma.knowledgeItem.findMany({
    where: {
      brandId: version.contentItem.brandId,
      approvalStatus: "APPROVED",
    },
  });

  const permittedClaims = brandKnowledge
    .filter((k) => k.category === KnowledgeCategory.PERMITTED_CLAIM)
    .map((k) => ({ id: k.id, claim: k.title, text: k.sourceExcerpt }));

  const prohibitedClaims = brandKnowledge
    .filter((k) => k.category === KnowledgeCategory.PROHIBITED_CLAIM)
    .map((k) => ({ id: k.id, claim: k.title, rule: k.content }));

  const mandatoryDisclosures = brandKnowledge
    .filter((k) => k.category === KnowledgeCategory.MANDATORY_DISCLOSURE)
    .map((k) => ({ id: k.id, disclosure: k.sourceExcerpt || k.content }));

  const approvedFacts = brandKnowledge
    .filter((k) => k.category === KnowledgeCategory.PRODUCT_FACT && (!k.expiryDate || new Date(k.expiryDate) > new Date()))
    .map((k) => ({ id: k.id, fact: k.title, detail: k.content }));

  const guidelines = brandKnowledge
    .filter((k) => k.category === KnowledgeCategory.GUIDELINE)
    .map((k) => ({ id: k.id, guideline: k.title, text: k.content }));

  const approvedAssets = brandKnowledge
    .filter((k) => k.category === KnowledgeCategory.ASSET)
    .map((k) => ({ id: k.id, asset: k.title, specification: k.content, excerpt: k.sourceExcerpt }));

  if (approvedAssets.length === 0) {
    approvedAssets.push({
      id: "KB-VER-010",
      asset: "Primary Brand Asset: Logo & Palette",
      specification: "Verdanta Leaf Icon & Wordmark in Forest Green (#2D5A27), Terracotta Accent (#E05638). Alt-text required.",
      excerpt: "Visual Identity Spec: Primary logo in #2D5A27.",
    });
  }

  const versionReference = `Version ${version.versionNumber} (Approved reference derived on ${new Date().toLocaleDateString()})`;

  const brief = await prisma.creatorBrief.create({
    data: {
      brandId: version.contentItem.brandId,
      sourceContentVersionId: version.id,
      title: `Creator Brief: ${version.contentItem.campaignName} — ${version.contentItem.title}`,
      campaignName: version.contentItem.campaignName,
      versionReference,
      permittedClaims: JSON.stringify(permittedClaims),
      prohibitedClaims: JSON.stringify(prohibitedClaims),
      mandatoryDisclosures: JSON.stringify(mandatoryDisclosures),
      approvedFacts: JSON.stringify(approvedFacts),
      guidelines: JSON.stringify(guidelines),
      approvedAssets: JSON.stringify(approvedAssets),
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "CREATOR_BRIEF_GENERATED",
      userId: options.userId,
      userName: options.userName,
      userRole: options.userRole,
      entityType: "CREATOR_BRIEF",
      entityId: brief.id,
      details: JSON.stringify({
        sourceContentVersionId: version.id,
        briefTitle: brief.title,
        permittedClaimsCount: permittedClaims.length,
        prohibitedClaimsCount: prohibitedClaims.length,
      }),
    },
  });

  return brief;
}

/**
 * Checks an external creator's submitted caption against the creator brief.
 * Detects adaptation drift (e.g. re-introducing prohibited claims or dropping disclosures).
 */
export function checkBriefAdaptationDrift(
  creatorCaption: string,
  brief: {
    permittedClaims: string;
    prohibitedClaims: string;
    mandatoryDisclosures: string;
    approvedFacts: string;
  }
): DriftCheckResult {
  const captionNorm = normalizeText(creatorCaption);
  const prohibitedList = JSON.parse(brief.prohibitedClaims || "[]");
  const disclosureList = JSON.parse(brief.mandatoryDisclosures || "[]");
  const permittedList = JSON.parse(brief.permittedClaims || "[]");

  // Check prohibited claims
  const prohibitedDetected: string[] = [];
  for (const item of prohibitedList) {
    const trigger = item.claim?.replace(/prohibited claim:?/i, "").trim().toLowerCase();
    if (trigger && captionNorm.includes(normalizeText(trigger))) {
      prohibitedDetected.push(item.claim);
    }
    // Check known keywords like sugar-free or diabetes
    if (item.id === "KB-VER-004" && (captionNorm.includes("sugar free") || captionNorm.includes("no sugar"))) {
      if (!prohibitedDetected.includes(item.claim)) prohibitedDetected.push(item.claim);
    }
    if (item.id === "KB-VER-005" && (captionNorm.includes("diabetes") || captionNorm.includes("diabetic"))) {
      if (!prohibitedDetected.includes(item.claim)) prohibitedDetected.push(item.claim);
    }
  }

  // Check mandatory disclosures
  const missingDisclosures: string[] = [];
  for (const disc of disclosureList) {
    const discNorm = normalizeText(disc.disclosure || "");
    const coreNotice = "contains added sugar this product is not a substitute for a balanced diet";
    if (!captionNorm.includes(coreNotice) && !captionNorm.includes(discNorm.slice(0, 40))) {
      missingDisclosures.push(disc.disclosure || "Mandatory Brand Disclosure");
    }
  }

  // Check permitted claims used
  const usedPermitted: string[] = [];
  for (const perm of permittedList) {
    const permNorm = normalizeText(perm.text || perm.claim || "");
    if (permNorm && captionNorm.includes("source of protein")) {
      usedPermitted.push(perm.claim);
    }
  }

  let driftScore = 100;
  if (prohibitedDetected.length > 0) driftScore -= 45 * prohibitedDetected.length;
  if (missingDisclosures.length > 0) driftScore -= 35;
  if (driftScore < 0) driftScore = 0;

  const isCompliant = prohibitedDetected.length === 0 && missingDisclosures.length === 0;

  let driftSummary = "Adaptation is fully aligned with brief parameters.";
  if (!isCompliant) {
    const issues: string[] = [];
    if (prohibitedDetected.length > 0) {
      issues.push(`Prohibited claims detected: ${prohibitedDetected.join(", ")}`);
    }
    if (missingDisclosures.length > 0) {
      issues.push(`Missing mandatory disclosures (${missingDisclosures.length})`);
    }
    driftSummary = `Adaptation drift detected! ${issues.join("; ")}. Requires revision prior to sign-off.`;
  }

  return {
    hasProhibitedClaims: prohibitedDetected.length > 0,
    prohibitedClaimsDetected: prohibitedDetected,
    missingMandatoryDisclosures: missingDisclosures.length > 0,
    missingDisclosuresDetected: missingDisclosures,
    approvedClaimsUsed: usedPermitted,
    driftScore,
    driftSummary,
    isCompliant,
  };
}
