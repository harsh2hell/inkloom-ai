import { FindingType, FindingSeverity, EvidenceStatus } from "@prisma/client";
import { RawFindingInput } from "../verification/citation";

export interface VisualCheckInput {
  imageUrl?: string | null;
  imageAltText?: string | null;
  imageFileName?: string | null;
  detectedColors?: string[]; // e.g. ["#2D5A27", "#E05638"]
  detectedLogo?: string | null; // e.g. "Verdanta Leaf Icon"
}

export interface VisualCheckResult {
  hasVisualAsset: boolean;
  altTextPresent: boolean;
  altTextValid: boolean;
  logoVerified: boolean;
  brandColorsVerified: boolean;
  detectedColors: string[];
  findings: RawFindingInput[];
  summary: string;
}

// Approved Brand Specifications from KB-VER-010
export const APPROVED_BRAND_PALETTE = [
  { name: "Forest Green", hex: "#2D5A27" },
  { name: "Terracotta Accent", hex: "#E05638" },
  { name: "Warm Off-White Canvas", hex: "#F4F5F8" },
  { name: "Slate Text", hex: "#0F172A" },
];

export const APPROVED_LOGO_IDENTIFIER = "Verdanta Leaf Icon & Wordmark";

/**
 * Runs visual content verification against approved Brand Asset specifications (KB-VER-010).
 */
export function runVisualChecks(input: VisualCheckInput): VisualCheckResult {
  const { imageUrl, imageAltText, detectedColors = [], detectedLogo } = input;
  const findings: RawFindingInput[] = [];

  const hasVisualAsset = Boolean(imageUrl || (input.imageFileName && input.imageFileName.length > 0));

  if (!hasVisualAsset) {
    return {
      hasVisualAsset: false,
      altTextPresent: false,
      altTextValid: false,
      logoVerified: false,
      brandColorsVerified: false,
      detectedColors: [],
      findings: [],
      summary: "No visual media assets attached to this content item.",
    };
  }

  // 1. Alt-Text Presence & Quality Check
  const trimmedAlt = (imageAltText || "").trim();
  const altTextPresent = trimmedAlt.length > 0;
  const isGenericAlt = ["image", "photo", "picture", "img", "banner"].includes(trimmedAlt.toLowerCase());
  const altTextValid = altTextPresent && trimmedAlt.length >= 8 && !isGenericAlt;

  if (!altTextPresent) {
    findings.push({
      type: FindingType.POSSIBLE_RISK,
      severity: FindingSeverity.HIGH,
      affectedText: "[Visual Asset: Missing Alt-Text]",
      explanation:
        "The attached marketing visual lacks descriptive alt-text. Mandatory accessibility guidelines and brand governance require alt-text describing product features.",
      sourceReferenceId: "KB-VER-010",
      quotedExcerpt: "Visual Identity Spec: Required alt-text: 'Verdanta Foods organic leaf brand mark'.",
      suggestedCorrection: "Add descriptive alt-text: 'Verdanta Plant Crunch nutrition bar packaging showing 11g plant protein certification'.",
      suggestedCorrectionSupported: true,
    });
  } else if (!altTextValid) {
    findings.push({
      type: FindingType.STYLE_SUGGESTION,
      severity: FindingSeverity.MEDIUM,
      affectedText: `[Alt-Text: "${trimmedAlt}"]`,
      explanation:
        "Alt-text is too brief or generic. Brand accessibility guidelines recommend describing both the product and approved messaging.",
      sourceReferenceId: "KB-VER-010",
      quotedExcerpt: "Visual Identity Spec: Required alt-text: 'Verdanta Foods organic leaf brand mark'.",
      suggestedCorrection: `Expand alt-text to provide meaningful context: '${trimmedAlt} - Verdanta Plant Crunch wholesome snack'.`,
      suggestedCorrectionSupported: true,
    });
  }

  // 2. Logo Verification against Approved Assets
  const logoVerified = Boolean(
    detectedLogo &&
      (detectedLogo.toLowerCase().includes("verdanta") ||
        detectedLogo.toLowerCase().includes("leaf icon") ||
        detectedLogo === APPROVED_LOGO_IDENTIFIER)
  );

  if (!logoVerified && detectedLogo !== undefined) {
    findings.push({
      type: FindingType.INSUFFICIENT_EVIDENCE,
      severity: FindingSeverity.HIGH,
      affectedText: "[Visual Asset: Unverified Logo Placement]",
      explanation:
        "Visual content does not include the verified 'Verdanta Leaf Icon & Wordmark' logo from approved brand asset KB-VER-010.",
      sourceReferenceId: "KB-VER-010",
      quotedExcerpt: "Visual Identity Spec: Primary logo must appear in #2D5A27 on light backgrounds.",
      subReason: "Unverified citation",
      suggestedCorrection: "Ensure the approved Verdanta Leaf Icon SVG brand asset is positioned with clear margin.",
      suggestedCorrectionSupported: true,
    });
  }

  // 3. Brand Color Palette Verification
  let brandColorsVerified = true;
  if (detectedColors.length > 0) {
    const approvedHexes = APPROVED_BRAND_PALETTE.map((c) => c.hex.toLowerCase());
    const rogueColors = detectedColors.filter(
      (hex) => !approvedHexes.includes(hex.toLowerCase())
    );

    if (rogueColors.length > 0) {
      brandColorsVerified = false;
      findings.push({
        type: FindingType.STYLE_SUGGESTION,
        severity: FindingSeverity.MEDIUM,
        affectedText: `[Unapproved Colors: ${rogueColors.join(", ")}]`,
        explanation: `Detected palette colors (${rogueColors.join(", ")}) diverge from the approved Verdanta brand palette (Forest Green #2D5A27, Terracotta #E05638, Warm Canvas #F4F5F8).`,
        sourceReferenceId: "KB-VER-010",
        quotedExcerpt: "Approved Brand Color Palette: Forest Green (#2D5A27), Earth Terracotta (#E05638), Warm Canvas (#F4F5F8).",
        suggestedCorrection: "Adjust artwork palette to utilize approved primary green (#2D5A27) and terracotta (#E05638).",
        suggestedCorrectionSupported: true,
      });
    }
  }

  const issuesCount = findings.length;
  const summary =
    issuesCount === 0
      ? "Visual asset checks passed: Alt-text, logo mark, and brand colors conform to KB-VER-010."
      : `Visual asset inspection identified ${issuesCount} issues (Alt-text: ${altTextValid ? "Valid" : "Needs Attention"}, Logo: ${logoVerified ? "Verified" : "Pending"}, Palette: ${brandColorsVerified ? "Compliant" : "Divergent"}).`;

  return {
    hasVisualAsset,
    altTextPresent,
    altTextValid,
    logoVerified,
    brandColorsVerified,
    detectedColors,
    findings,
    summary,
  };
}
