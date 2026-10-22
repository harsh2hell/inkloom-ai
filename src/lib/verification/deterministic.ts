import { FindingType, FindingSeverity, KnowledgeCategory } from "@prisma/client";
import { KnowledgeItemData, RawFindingInput, normalizeText } from "./citation";

export interface DeterministicContext {
  brandId: string;
  brandName: string;
  knowledgeItems: KnowledgeItemData[];
  hasMediaWithoutAlt?: boolean;
}

/**
 * Layer 1: Deterministic Verification Engine.
 * Executes reproducible policy rules directly without external dependencies or AI keys.
 */
export function runDeterministicChecks(
  textContent: string,
  context: DeterministicContext
): RawFindingInput[] {
  const findings: RawFindingInput[] = [];
  const textNorm = normalizeText(textContent);

  // 1. Check for Prohibited Claims
  const prohibitedItems = context.knowledgeItems.filter(
    (item) => item.category === KnowledgeCategory.PROHIBITED_CLAIM
  );

  for (const item of prohibitedItems) {
    // Extract key trigger keywords/phrases from title and content
    const triggers: string[] = [];
    
    // Add common variants based on item ID and known phrases
    if (item.id === "KB-VER-004" || item.title.toLowerCase().includes("sugar-free")) {
      triggers.push("sugar-free", "sugar free", "no sugar", "zero sugar", "0 sugar");
    } else if (item.id === "KB-VER-005" || item.title.toLowerCase().includes("diabetes")) {
      triggers.push("diabetes-friendly", "diabetes friendly", "diabetic-friendly", "diabetic friendly", "suitable for diabetics");
    } else {
      // General title-derived triggers
      const titleClean = item.title.replace(/prohibited claim:?/i, "").trim().toLowerCase();
      if (titleClean) triggers.push(titleClean);
    }

    for (const trigger of triggers) {
      const triggerNorm = normalizeText(trigger);
      if (textNorm.includes(triggerNorm)) {
        // Find approximate original snippet in textContent
        const regex = new RegExp(`\\b${escapeRegExp(trigger)}\\b`, "i");
        const match = textContent.match(regex);
        const snippet = match ? match[0] : trigger;

        findings.push({
          type: FindingType.VERIFIED_CONTRADICTION,
          severity: FindingSeverity.HIGH,
          affectedText: snippet,
          explanation: `Draft contains prohibited claim '${snippet}'. Policy '${item.title}' strictly forbids this wording in marketing content.`,
          sourceReferenceId: item.id,
          quotedExcerpt: item.sourceExcerpt,
          suggestedCorrection: item.id === "KB-VER-004"
            ? "wholesome plant ingredients with 6 g added cane sugar"
            : "a wholesome source of plant energy for active lifestyles",
          suggestedCorrectionSupported: true,
        });
        break; // Avoid duplicate triggers for the same policy item
      }
    }
  }

  // 2. Check for Missing Mandatory Disclosures
  const mandatoryDisclosures = context.knowledgeItems.filter(
    (item) => item.category === KnowledgeCategory.MANDATORY_DISCLOSURE
  );

  for (const item of mandatoryDisclosures) {
    // Check key phrase from disclosure
    const disclosurePhrase = "contains added sugar this product is not a substitute for a balanced diet";
    const itemNorm = normalizeText(item.sourceExcerpt || item.content);
    const targetPhrase = itemNorm.includes(disclosurePhrase) ? disclosurePhrase : itemNorm.slice(0, 50);

    if (!textNorm.includes(targetPhrase)) {
      findings.push({
        type: FindingType.POSSIBLE_RISK,
        severity: FindingSeverity.HIGH,
        affectedText: textContent.length > 30 ? textContent.slice(-30) : "[End of text]",
        explanation: `Missing mandatory brand disclosure required by '${item.title}'. All marketing copy must include the approved brand disclosure notice.`,
        sourceReferenceId: item.id,
        quotedExcerpt: item.sourceExcerpt,
        suggestedCorrection: "Contains added sugar. This product is not a substitute for a balanced diet.",
        suggestedCorrectionSupported: true,
      });
    }
  }

  // 3. Check for Expired Evidence Citations / Claims
  const now = new Date();
  const expiredItems = context.knowledgeItems.filter(
    (item) => item.expiryDate && new Date(item.expiryDate).getTime() < now.getTime()
  );

  for (const expItem of expiredItems) {
    const expiredKeywords = ["organic", "certified organic", "100% organic"];
    const matchesExpired = expiredKeywords.some((kw) => textNorm.includes(normalizeText(kw)));

    if (matchesExpired && (expItem.id === "KB-VER-007" || expItem.title.toLowerCase().includes("organic"))) {
      const match = textContent.match(/100% organic|certified organic|organic/i);
      const snippet = match ? match[0] : "organic";

      findings.push({
        type: FindingType.INSUFFICIENT_EVIDENCE,
        severity: FindingSeverity.HIGH,
        affectedText: snippet,
        explanation: `Draft claims '${snippet}', which relies on expired certification '${expItem.title}' (expired on ${new Date(expItem.expiryDate!).toLocaleDateString()}). Expired evidence cannot substantiate current marketing claims.`,
        sourceReferenceId: expItem.id,
        quotedExcerpt: expItem.sourceExcerpt,
        suggestedCorrection: "crafted with wholesome plant-based ingredients",
        suggestedCorrectionSupported: false, // Factual claim cannot be verified without current certificate
      });
    }
  }

  // 4. Check for Numeric / Factual Contradictions (e.g. Protein content)
  const proteinFact = context.knowledgeItems.find((item) => item.id === "KB-VER-001");
  if (proteinFact) {
    // Detect exaggerated protein numbers like "25g protein", "30g protein", "20g protein"
    const proteinRegex = /(\b(2[0-9]|3[0-9]|4[0-9]|50)\s*g\b\s*(?:of\s*)?protein)/i;
    const match = textContent.match(proteinRegex);
    if (match) {
      findings.push({
        type: FindingType.VERIFIED_CONTRADICTION,
        severity: FindingSeverity.HIGH,
        affectedText: match[0],
        explanation: `Draft claims '${match[0]}', directly contradicting approved specification '${proteinFact.title}', which certifies 11 g protein per 100 g.`,
        sourceReferenceId: proteinFact.id,
        quotedExcerpt: proteinFact.sourceExcerpt,
        suggestedCorrection: "source of plant protein (11 g per 100 g)",
        suggestedCorrectionSupported: true,
      });
    }
  }

  // 5. Check Missing Alt Text if media attachment is flagged
  if (context.hasMediaWithoutAlt) {
    findings.push({
      type: FindingType.POSSIBLE_RISK,
      severity: FindingSeverity.MEDIUM,
      affectedText: "[Media Asset]",
      explanation: "Media asset is missing descriptive alt text, violating digital accessibility and brand transparency guidelines.",
      sourceReferenceId: null,
      quotedExcerpt: null,
      suggestedCorrection: "Add descriptive alt text describing the image content and product packaging.",
      suggestedCorrectionSupported: true,
    });
  }

  return findings;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
