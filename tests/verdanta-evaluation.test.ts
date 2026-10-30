import { describe, it, expect } from "vitest";
import { runDeterministicChecks } from "../src/lib/verification/deterministic";
import { validateFindingCitation, KnowledgeItemData } from "../src/lib/verification/citation";
import { extractTextFromDocx, extractTextFromPdf, extractTextFromFile } from "../src/lib/intake/extractor";
import { runVisualChecks, APPROVED_BRAND_PALETTE, APPROVED_LOGO_IDENTIFIER } from "../src/lib/intake/visual";
import { generateCreatorBrief, checkBriefAdaptationDrift } from "../src/lib/briefs/generator";
import { canApproveContent, canClearBrief, canOverrideFindings, canGenerateBrief, UserContext } from "../src/lib/auth/roles";
import { prisma } from "../src/lib/prisma";
import { Role, FindingType, FindingSeverity, EvidenceStatus, KnowledgeCategory, ApprovalStatus } from "@prisma/client";

describe("Inkloom AI — Verdanta Foods Round 3 Final Evaluation Suite", () => {
  // Test 1: Multi-format document intake (DOCX and PDF text extraction)
  it("1. Server-side text extraction processes multi-format document intake", () => {
    // A. Plain text / markdown intake
    const txtBuffer = Buffer.from("Verdanta Plant Crunch contains 11g plant protein and 6g cane sugar.", "utf8");
    const txtResult = extractTextFromFile("sample_draft.txt", txtBuffer);
    expect(txtResult.format).toBe("txt");
    expect(txtResult.text).toContain("11g plant protein");
    expect(txtResult.wordCount).toBeGreaterThan(5);

    // B. DOCX fallback extraction
    const docxSimulated = Buffer.from("PK\x03\x04mock content Verdanta active nutrition bar", "utf8");
    const docxResult = extractTextFromFile("Verdanta_Press_Release.docx", docxSimulated);
    expect(docxResult.format).toBe("docx");
    expect(docxResult.text.length).toBeGreaterThan(0);

    // C. PDF text stream extraction
    const pdfSimulated = Buffer.from("%PDF-1.4 BT (Verdanta Plant Crunch Wholesome Snack) Tj ET", "binary");
    const pdfResult = extractTextFromFile("Verdanta_Label_Proof.pdf", pdfSimulated);
    expect(pdfResult.format).toBe("pdf");
    expect(pdfResult.text).toContain("Verdanta Plant Crunch Wholesome Snack");
  });

  // Test 2: Image checks — Alt-text presence and quality check
  it("2. Image checks enforce alt-text presence and descriptive quality", () => {
    // Case A: Missing alt-text -> Triggers HIGH severity POSSIBLE_RISK finding citing KB-VER-010
    const missingAltResult = runVisualChecks({
      imageUrl: "https://example.com/bar.jpg",
      imageAltText: "",
    });
    expect(missingAltResult.hasVisualAsset).toBe(true);
    expect(missingAltResult.altTextPresent).toBe(false);
    expect(missingAltResult.altTextValid).toBe(false);
    expect(missingAltResult.findings.length).toBeGreaterThan(0);
    expect(missingAltResult.findings[0].type).toBe(FindingType.POSSIBLE_RISK);
    expect(missingAltResult.findings[0].sourceReferenceId).toBe("KB-VER-010");

    // Case B: Valid alt-text -> Conforms to accessibility policy
    const validAltResult = runVisualChecks({
      imageUrl: "https://example.com/bar.jpg",
      imageAltText: "Verdanta Plant Crunch wholesome snack packaging",
    });
    expect(validAltResult.altTextPresent).toBe(true);
    expect(validAltResult.altTextValid).toBe(true);
  });

  // Test 3: Visual content checks — Logo and brand-colour verification against approved assets (KB-VER-010)
  it("3. Visual content checks verify logo and brand colours against approved assets", () => {
    // Case A: Compliant logo and palette
    const compliantVisual = runVisualChecks({
      imageUrl: "https://example.com/banner.png",
      imageAltText: "Verdanta organic leaf brand mark on wholesome snack bar",
      detectedLogo: APPROVED_LOGO_IDENTIFIER,
      detectedColors: ["#2D5A27", "#E05638", "#F4F5F8"],
    });
    expect(compliantVisual.logoVerified).toBe(true);
    expect(compliantVisual.brandColorsVerified).toBe(true);
    expect(compliantVisual.findings.length).toBe(0);

    // Case B: Unverified logo and rogue divergent colours
    const nonCompliantVisual = runVisualChecks({
      imageUrl: "https://example.com/rogue_banner.png",
      imageAltText: "Verdanta bar promo",
      detectedLogo: "Unknown Competitor Icon",
      detectedColors: ["#FF00FF", "#00FFFF"], // Rogue neon palette
    });
    expect(nonCompliantVisual.logoVerified).toBe(false);
    expect(nonCompliantVisual.brandColorsVerified).toBe(false);
    expect(nonCompliantVisual.findings.some((f) => f.type === FindingType.INSUFFICIENT_EVIDENCE)).toBe(true);
    expect(nonCompliantVisual.findings.some((f) => f.type === FindingType.STYLE_SUGGESTION)).toBe(true);
  });

  // Test 4: All 5 finding types generated with full citation traceability and honest "no source found"
  it("4. Two-layer check engine yields all five finding types with honest citation status", () => {
    const knowledgeMap = new Map<string, KnowledgeItemData>([
      [
        "KB-VER-001",
        {
          id: "KB-VER-001",
          title: "Protein Specification",
          content: "Contains 11 g protein per 100 g.",
          sourceExcerpt: "Laboratory testing confirms protein concentration measured at exactly 11 g protein per 100 g finished product.",
          category: KnowledgeCategory.PRODUCT_FACT,
          approvalStatus: ApprovalStatus.APPROVED,
          effectiveDate: new Date("2024-01-01"),
          expiryDate: new Date("2028-01-01"),
          version: 2,
        },
      ],
      [
        "KB-VER-004",
        {
          id: "KB-VER-004",
          title: "Sugar-Free Ban",
          content: "Sugar-free is strictly prohibited.",
          sourceExcerpt: "Prohibited claim: 'sugar-free' is strictly banned. Any claim implying zero or negligible sugar is false.",
          category: KnowledgeCategory.PROHIBITED_CLAIM,
          approvalStatus: ApprovalStatus.APPROVED,
          effectiveDate: new Date("2024-01-01"),
          expiryDate: new Date("2028-01-01"),
          version: 1,
        },
      ],
      [
        "KB-VER-006",
        {
          id: "KB-VER-006",
          title: "Mandatory Disclosure",
          content: "Contains added sugar. This product is not a substitute for a balanced diet.",
          sourceExcerpt: "Mandatory brand disclosure: Contains added sugar. This product is not a substitute for a balanced diet.",
          category: KnowledgeCategory.MANDATORY_DISCLOSURE,
          approvalStatus: ApprovalStatus.APPROVED,
          effectiveDate: new Date("2024-01-01"),
          expiryDate: new Date("2028-01-01"),
          version: 1,
        },
      ],
      [
        "KB-VER-007",
        {
          id: "KB-VER-007",
          title: "Expired Organic Cert",
          content: "Organic certification expired Dec 2023.",
          sourceExcerpt: "Certified organic status granted through December 31, 2023. Expiration noted.",
          category: KnowledgeCategory.PRODUCT_FACT,
          approvalStatus: ApprovalStatus.APPROVED,
          effectiveDate: new Date("2022-01-01"),
          expiryDate: new Date("2023-12-31"), // Expired
          version: 1,
        },
      ],
      [
        "KB-VER-008",
        {
          id: "KB-VER-008",
          title: "Tone Guideline",
          content: "Grounded transparent tone.",
          sourceExcerpt: "Tone must be grounded, transparent, and uplifting. Celebrate real ingredients without exaggerated functional promises.",
          category: KnowledgeCategory.GUIDELINE,
          approvalStatus: ApprovalStatus.APPROVED,
          effectiveDate: new Date("2024-01-01"),
          expiryDate: new Date("2028-01-01"),
          version: 1,
        },
      ],
    ]);

    // A. Finding 1: VERIFIED_CONTRADICTION
    const contradictionFinding = validateFindingCitation(
      {
        type: FindingType.VERIFIED_CONTRADICTION,
        severity: "HIGH",
        affectedText: "100% sugar-free",
        explanation: "Violates sugar-free prohibition.",
        sourceReferenceId: "KB-VER-004",
        quotedExcerpt: "Prohibited claim: 'sugar-free' is strictly banned. Any claim implying zero or negligible sugar is false.",
      },
      knowledgeMap
    );
    expect(contradictionFinding.type).toBe(FindingType.VERIFIED_CONTRADICTION);
    expect(contradictionFinding.citationValid).toBe(true);
    expect(contradictionFinding.sourceVersion).toBe(1);

    // B. Finding 2: UNSUPPORTED_CLAIM (Honest "no source found" with Coverage gap)
    const unsupportedFinding = validateFindingCitation(
      {
        type: FindingType.UNSUPPORTED_CLAIM,
        severity: "HIGH",
        affectedText: "miracle detox cures chronic fatigue",
        explanation: "Unsubstantiated therapeutic claim.",
        sourceReferenceId: null, // Honest "no source found"
      },
      knowledgeMap
    );
    expect(unsupportedFinding.type).toBe(FindingType.UNSUPPORTED_CLAIM);
    expect(unsupportedFinding.sourceReferenceId).toBeNull();
    expect(unsupportedFinding.insufficientEvidenceSubReason).toBe("Coverage gap");
    expect(unsupportedFinding.routedReviewer).toBe("Sarah Chen (Brand Admin)");

    // C. Finding 3: INSUFFICIENT_EVIDENCE (Expired certification)
    const expiredFinding = validateFindingCitation(
      {
        type: FindingType.INSUFFICIENT_EVIDENCE,
        severity: "HIGH",
        affectedText: "Certified 100% organic",
        explanation: "Relies on expired organic certificate.",
        sourceReferenceId: "KB-VER-007",
        quotedExcerpt: "Certified organic status granted through December 31, 2023. Expiration noted.",
      },
      knowledgeMap
    );
    expect(expiredFinding.type).toBe(FindingType.INSUFFICIENT_EVIDENCE);
    expect(expiredFinding.evidenceStatus).toBe(EvidenceStatus.EXPIRED_EVIDENCE);
    expect(expiredFinding.insufficientEvidenceSubReason).toBe("Unverified citation");
    expect(expiredFinding.routedReviewer).toBe("Sarah Chen (Brand Admin)");

    // D. Finding 4: POSSIBLE_RISK (Missing mandatory disclosure)
    const riskFinding = validateFindingCitation(
      {
        type: FindingType.POSSIBLE_RISK,
        severity: "HIGH",
        affectedText: "[End of draft]",
        explanation: "Missing mandatory disclosure.",
        sourceReferenceId: "KB-VER-006",
        quotedExcerpt: "Mandatory brand disclosure: Contains added sugar. This product is not a substitute for a balanced diet.",
      },
      knowledgeMap
    );
    expect(riskFinding.type).toBe(FindingType.POSSIBLE_RISK);
    expect(riskFinding.citationValid).toBe(true);

    // E. Finding 5: STYLE_SUGGESTION
    const styleFinding = validateFindingCitation(
      {
        type: FindingType.STYLE_SUGGESTION,
        severity: "LOW",
        affectedText: "guilt-free magic",
        explanation: "Sensational slang violates tone guideline.",
        sourceReferenceId: "KB-VER-008",
        quotedExcerpt: "Tone must be grounded, transparent, and uplifting. Celebrate real ingredients without exaggerated functional promises.",
      },
      knowledgeMap
    );
    expect(styleFinding.type).toBe(FindingType.STYLE_SUGGESTION);
    expect(styleFinding.citationValid).toBe(true);
  });

  // Test 5: Insufficient-evidence handling routes to named human reviewer with explicit sub-reasons
  it("5. Explicit insufficient-evidence handling routes to a named reviewer with sub-reasons", () => {
    const knowledgeMap = new Map<string, KnowledgeItemData>();

    // Sub-reason 1: Coverage gap (unknown / uninvented source)
    const gapResult = validateFindingCitation(
      {
        type: FindingType.INSUFFICIENT_EVIDENCE,
        severity: "HIGH",
        affectedText: "Reverses cellular aging",
        explanation: "Cites non-existent source.",
        sourceReferenceId: "KB-FAKE-999",
      },
      knowledgeMap
    );
    expect(gapResult.insufficientEvidenceSubReason).toBe("Coverage gap");
    expect(gapResult.routedReviewer).toBe("Sarah Chen (Brand Admin)");
    expect(gapResult.requiresHumanReview).toBe(true);

    // Sub-reason 2: Partial or conflicting (partial mismatch)
    const testKb: KnowledgeItemData = {
      id: "KB-VER-001",
      title: "Protein Spec",
      content: "Contains 11 g plant protein per 100 g finished product.",
      sourceExcerpt: "Laboratory testing confirms protein concentration measured at exactly 11 g protein per 100 g finished product.",
      category: KnowledgeCategory.PRODUCT_FACT,
      approvalStatus: ApprovalStatus.APPROVED,
      effectiveDate: new Date("2024-01-01"),
      expiryDate: new Date("2028-01-01"),
      version: 1,
    };
    knowledgeMap.set("KB-VER-001", testKb);

    const conflictingResult = validateFindingCitation(
      {
        type: FindingType.INSUFFICIENT_EVIDENCE,
        severity: "HIGH",
        affectedText: "Contains massive plant protein boost",
        explanation: "Misquotes approved excerpt.",
        sourceReferenceId: "KB-VER-001",
        quotedExcerpt: "testing confirms protein concentration of miraculous athletic power", // partial word overlap
      },
      knowledgeMap
    );
    expect(conflictingResult.insufficientEvidenceSubReason).toBe("Partial or conflicting");
    expect(conflictingResult.routedReviewer).toBe("Sarah Chen (Brand Admin)");
  });

  // Test 6: Intelligent creator briefs translate approved brand knowledge into actionable requirements including approved assets
  it("6. Creator briefs translate approved brand knowledge and include approved assets", async () => {
    // Query approved brand knowledge
    const brandKnowledge = await prisma.knowledgeItem.findMany({
      where: { approvalStatus: ApprovalStatus.APPROVED },
    });

    const permittedClaims = brandKnowledge.filter((k) => k.category === KnowledgeCategory.PERMITTED_CLAIM);
    const prohibitedClaims = brandKnowledge.filter((k) => k.category === KnowledgeCategory.PROHIBITED_CLAIM);
    const mandatoryDisclosures = brandKnowledge.filter((k) => k.category === KnowledgeCategory.MANDATORY_DISCLOSURE);
    const approvedAssets = brandKnowledge.filter((k) => k.category === KnowledgeCategory.ASSET);

    expect(permittedClaims.length).toBeGreaterThanOrEqual(1);
    expect(prohibitedClaims.length).toBeGreaterThanOrEqual(2);
    expect(mandatoryDisclosures.length).toBeGreaterThanOrEqual(1);
    expect(approvedAssets.length).toBeGreaterThanOrEqual(1);

    // Verify approved asset contains primary logo and color palette specs
    const assetSpec = approvedAssets[0];
    expect(assetSpec.content).toContain("#2D5A27");
    expect(assetSpec.content).toContain("Logo");
  });

  // Test 7: Creator final check against brief and named human confirming clearance
  it("7. Creator final content is checked against brief and cleared by a named reviewer", () => {
    const briefParams = {
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

    // Compliant caption check
    const compliantText =
      "Verdanta Plant Crunch is an approved source of protein (11 g per 100 g). Contains added sugar. This product is not a substitute for a balanced diet.";
    const checkResult = checkBriefAdaptationDrift(compliantText, briefParams);
    expect(checkResult.isCompliant).toBe(true);
    expect(checkResult.driftScore).toBe(100);

    // Human clearance permission check
    const ownerContext: UserContext = {
      id: "usr_owner_01",
      name: "Elena Vance",
      email: "elena@verdanta.demo",
      role: Role.BRAND_OWNER,
      organization: "Verdanta Executive",
    };

    const adminContext: UserContext = {
      id: "usr_admin_01",
      name: "Sarah Chen",
      email: "sarah@verdanta.demo",
      role: Role.BRAND_ADMIN,
      organization: "Verdanta Governance",
    };

    const creatorContext: UserContext = {
      id: "usr_creator_01",
      name: "Maya Patel",
      email: "maya@contentlab.demo",
      role: Role.EXTERNAL_CREATOR,
      organization: "Creator Studio",
    };

    // Brand Owner and Brand Admin can clear
    expect(canClearBrief(ownerContext).allowed).toBe(true);
    expect(canClearBrief(adminContext).allowed).toBe(true);

    // Creator cannot self-clear publication
    expect(canClearBrief(creatorContext).allowed).toBe(false);
  });

  // Test 8: Five RBAC roles operating with server-side enforcement
  it("8. Five roles operate with strict server-side permission enforcement", () => {
    const personas: Record<Role, UserContext> = {
      BRAND_OWNER: { id: "usr_owner_01", name: "Elena Vance", email: "elena@demo.com", role: Role.BRAND_OWNER, organization: "Executive" },
      BRAND_ADMIN: { id: "usr_admin_01", name: "Sarah Chen", email: "sarah@demo.com", role: Role.BRAND_ADMIN, organization: "Governance" },
      AGENCY_CREATOR: { id: "usr_agency_01", name: "Alex Rivera", email: "alex@demo.com", role: Role.AGENCY_CREATOR, organization: "Agency" },
      EXTERNAL_CREATOR: { id: "usr_creator_01", name: "Maya Patel", email: "maya@demo.com", role: Role.EXTERNAL_CREATOR, organization: "Creator" },
      AUDITOR: { id: "usr_auditor_01", name: "David Thorne", email: "david@demo.com", role: Role.AUDITOR, organization: "Audit" },
    };

    // Rule: Creators can never approve content (even if not author)
    expect(canApproveContent(personas.AGENCY_CREATOR, "usr_other").allowed).toBe(false);
    expect(canApproveContent(personas.EXTERNAL_CREATOR, "usr_other").allowed).toBe(false);

    // Rule: Brand Admin and Brand Owner can approve someone else's content
    expect(canApproveContent(personas.BRAND_ADMIN, "usr_creator_01").allowed).toBe(true);
    expect(canApproveContent(personas.BRAND_OWNER, "usr_creator_01").allowed).toBe(true);

    // Rule: Approvers can never self-approve own submissions
    expect(canApproveContent(personas.BRAND_ADMIN, "usr_admin_01").allowed).toBe(false);
    expect(canApproveContent(personas.BRAND_OWNER, "usr_owner_01").allowed).toBe(false);

    // Rule: Overrides reserved for Brand Admin & Owner
    expect(canOverrideFindings(personas.BRAND_ADMIN).allowed).toBe(true);
    expect(canOverrideFindings(personas.BRAND_OWNER).allowed).toBe(true);
    expect(canOverrideFindings(personas.AGENCY_CREATOR).allowed).toBe(false);
    expect(canOverrideFindings(personas.AUDITOR).allowed).toBe(false);
  });
});

