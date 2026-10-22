import { FindingType, EvidenceStatus, ApprovalStatus, KnowledgeCategory } from "@prisma/client";

export interface KnowledgeItemData {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  sourceExcerpt: string;
  approvalStatus: ApprovalStatus;
  effectiveDate: Date;
  expiryDate: Date | null;
  version: number;
}

export interface RawFindingInput {
  type: FindingType;
  severity: "HIGH" | "MEDIUM" | "LOW" | "INFO";
  affectedText: string;
  explanation: string;
  sourceReferenceId?: string | null;
  quotedExcerpt?: string | null;
  suggestedCorrection?: string | null;
  suggestedCorrectionSupported?: boolean;
}

export interface ValidatedFindingResult {
  type: FindingType;
  severity: "HIGH" | "MEDIUM" | "LOW" | "INFO";
  affectedText: string;
  explanation: string;
  evidenceStatus: EvidenceStatus;
  sourceReferenceId?: string | null;
  quotedExcerpt?: string | null;
  citationValid: boolean;
  citationFailureReason?: string | null;
  suggestedCorrection?: string | null;
  suggestedCorrectionSupported: boolean;
  requiresHumanReview: boolean;
}

/**
 * Normalizes text safely for canonical comparison:
 * - Converts to lowercase
 * - Strips punctuation and symbols
 * - Collapses repeated whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/['’"“”]/g, "") // remove quotes
    .replace(/[^a-z0-9\s]/g, " ") // replace punctuation with spaces
    .replace(/\s+/g, " ") // collapse whitespaces
    .trim();
}

/**
 * Checks if normalized source text contains the normalized excerpt.
 * Handles slight tokenization variations.
 */
export function matchesSourceExcerpt(storedSource: string, quotedExcerpt: string): boolean {
  const normSource = normalizeText(storedSource);
  const normExcerpt = normalizeText(quotedExcerpt);

  if (!normExcerpt || normExcerpt.length < 3) return false;
  if (normSource.includes(normExcerpt)) return true;

  // Secondary word-sequence match for slight fuzziness
  const excerptWords = normExcerpt.split(" ").filter((w) => w.length > 2);
  if (excerptWords.length >= 3) {
    const matchedCount = excerptWords.filter((word) => normSource.includes(word)).length;
    if (matchedCount / excerptWords.length >= 0.85) {
      return true;
    }
  }

  return false;
}

/**
 * Strict Application-Side Citation Validator.
 * Never trusts the model or untrusted input to validate its own citations.
 */
export function validateFindingCitation(
  rawFinding: RawFindingInput,
  knowledgeMap: Map<string, KnowledgeItemData>,
  now: Date = new Date()
): ValidatedFindingResult {
  const sourceId = rawFinding.sourceReferenceId?.trim();
  const quotedExcerpt = rawFinding.quotedExcerpt?.trim();

  // If no source is referenced, handle based on finding type
  if (!sourceId) {
    // Unsupported claim or style suggestion without source
    const requiresReview =
      rawFinding.severity === "HIGH" ||
      rawFinding.type === FindingType.UNSUPPORTED_CLAIM ||
      rawFinding.type === FindingType.INSUFFICIENT_EVIDENCE;

    return {
      type: rawFinding.type,
      severity: rawFinding.severity,
      affectedText: rawFinding.affectedText,
      explanation: rawFinding.explanation,
      evidenceStatus: EvidenceStatus.NO_EVIDENCE,
      sourceReferenceId: null,
      quotedExcerpt: null,
      citationValid: false,
      citationFailureReason: null,
      suggestedCorrection: sanitizeOrNeutralizeCorrection(
        rawFinding.suggestedCorrection,
        rawFinding.suggestedCorrectionSupported ?? false
      ),
      suggestedCorrectionSupported: rawFinding.suggestedCorrectionSupported ?? false,
      requiresHumanReview: requiresReview,
    };
  }

  // 1. Check if referenced knowledge item exists
  const kbItem = knowledgeMap.get(sourceId);
  if (!kbItem) {
    return {
      type: FindingType.INSUFFICIENT_EVIDENCE,
      severity: "HIGH",
      affectedText: rawFinding.affectedText,
      explanation: `${rawFinding.explanation} [Citation validation failed: Referenced source ID '${sourceId}' does not exist in the approved knowledge base.]`,
      evidenceStatus: EvidenceStatus.UNVERIFIED_CITATION,
      sourceReferenceId: sourceId,
      quotedExcerpt: quotedExcerpt || null,
      citationValid: false,
      citationFailureReason: `Unknown or invented source ID: '${sourceId}' does not exist in approved brand repository.`,
      suggestedCorrection: sanitizeOrNeutralizeCorrection(rawFinding.suggestedCorrection, false),
      suggestedCorrectionSupported: false,
      requiresHumanReview: true, // Non-negotiable: downgraded citations require human review
    };
  }

  // 2. Check if knowledge item is APPROVED
  if (kbItem.approvalStatus !== ApprovalStatus.APPROVED) {
    return {
      type: FindingType.INSUFFICIENT_EVIDENCE,
      severity: "HIGH",
      affectedText: rawFinding.affectedText,
      explanation: `${rawFinding.explanation} [Citation validation failed: Knowledge item '${sourceId}' status is ${kbItem.approvalStatus}, not APPROVED.]`,
      evidenceStatus: EvidenceStatus.UNVERIFIED_CITATION,
      sourceReferenceId: sourceId,
      quotedExcerpt: quotedExcerpt || null,
      citationValid: false,
      citationFailureReason: `Referenced knowledge item '${sourceId}' is not approved (status: ${kbItem.approvalStatus}).`,
      suggestedCorrection: sanitizeOrNeutralizeCorrection(rawFinding.suggestedCorrection, false),
      suggestedCorrectionSupported: false,
      requiresHumanReview: true,
    };
  }

  // 3. Check if knowledge item is current and not expired
  if (kbItem.expiryDate && new Date(kbItem.expiryDate).getTime() < now.getTime()) {
    return {
      type: FindingType.INSUFFICIENT_EVIDENCE,
      severity: "HIGH",
      affectedText: rawFinding.affectedText,
      explanation: `${rawFinding.explanation} [Citation validation failed: Knowledge item '${sourceId}' expired on ${new Date(kbItem.expiryDate).toLocaleDateString()}. Expired evidence cannot support current marketing.]`,
      evidenceStatus: EvidenceStatus.EXPIRED_EVIDENCE,
      sourceReferenceId: sourceId,
      quotedExcerpt: quotedExcerpt || null,
      citationValid: false,
      citationFailureReason: `Referenced evidence in '${sourceId}' expired on ${new Date(kbItem.expiryDate).toISOString().split("T")[0]}.`,
      suggestedCorrection: sanitizeOrNeutralizeCorrection(rawFinding.suggestedCorrection, false),
      suggestedCorrectionSupported: false,
      requiresHumanReview: true,
    };
  }

  // 4. Safe text normalization match check on quoted excerpt
  if (quotedExcerpt) {
    const combinedStoredSource = `${kbItem.sourceExcerpt || ""} ${kbItem.content || ""}`;
    const matches = matchesSourceExcerpt(combinedStoredSource, quotedExcerpt);

    if (!matches) {
      return {
        type: FindingType.INSUFFICIENT_EVIDENCE,
        severity: "HIGH",
        affectedText: rawFinding.affectedText,
        explanation: `${rawFinding.explanation} [Citation validation failed: Quoted excerpt does not match the stored source text in '${sourceId}'.]`,
        evidenceStatus: EvidenceStatus.UNVERIFIED_CITATION,
        sourceReferenceId: sourceId,
        quotedExcerpt: quotedExcerpt,
        citationValid: false,
        citationFailureReason: `Quotation does not match stored approved source in '${sourceId}'.`,
        suggestedCorrection: sanitizeOrNeutralizeCorrection(rawFinding.suggestedCorrection, false),
        suggestedCorrectionSupported: false,
        requiresHumanReview: true,
      };
    }
  }

  // Citation is verified!
  const isHighRiskOrUncertain =
    rawFinding.severity === "HIGH" ||
    rawFinding.type === FindingType.VERIFIED_CONTRADICTION ||
    rawFinding.type === FindingType.INSUFFICIENT_EVIDENCE;

  return {
    type: rawFinding.type,
    severity: rawFinding.severity,
    affectedText: rawFinding.affectedText,
    explanation: rawFinding.explanation,
    evidenceStatus: EvidenceStatus.VERIFIED,
    sourceReferenceId: sourceId,
    quotedExcerpt: quotedExcerpt || kbItem.sourceExcerpt,
    citationValid: true,
    citationFailureReason: null,
    suggestedCorrection: rawFinding.suggestedCorrection || null,
    suggestedCorrectionSupported: rawFinding.suggestedCorrectionSupported ?? true,
    requiresHumanReview: isHighRiskOrUncertain,
  };
}

/**
 * Ensures factual corrections have approved evidence.
 * If unsupported, suggests neutralizing or removing the claim rather than inventing facts.
 */
function sanitizeOrNeutralizeCorrection(
  suggested: string | null | undefined,
  isSupported: boolean
): string | null {
  if (!suggested) return null;
  if (isSupported) return suggested;
  return "Remove or neutralize this claim until approved evidence is documented.";
}
