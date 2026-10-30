import { prisma } from "../prisma";
import { runDeterministicChecks } from "./deterministic";
import { GeminiAIProvider, AIProvider } from "../ai/provider";
import { validateFindingCitation, KnowledgeItemData, ValidatedFindingResult, RawFindingInput } from "./citation";
import { runVisualChecks, VisualCheckInput } from "../intake/visual";
import { FindingType, FindingSeverity, EvidenceStatus, ResolutionStatus } from "@prisma/client";

export interface VerificationOptions {
  contentVersionId: string;
  textContent: string;
  brandId: string;
  brandName?: string;
  userId: string;
  userName?: string;
  userRole?: string;
  forceDeterministicOnly?: boolean;
  visualInput?: VisualCheckInput;
}

export interface VerificationResult {
  analysisRunId: string;
  provider: string;
  mode: "DETERMINISTIC" | "AI_ASSISTED";
  status: "COMPLETED" | "FAILED";
  summary: string;
  findings: ValidatedFindingResult[];
  counts: {
    total: number;
    verifiedContradictions: number;
    unsupportedClaims: number;
    insufficientEvidence: number;
    possibleRisks: number;
    styleSuggestions: number;
    highSeverity: number;
    requiresHumanReview: number;
  };
}

let activeAIProvider: AIProvider = new GeminiAIProvider();

export function setAIProvider(provider: AIProvider) {
  activeAIProvider = provider;
}

/**
 * Main Content Verification Engine.
 * Combines Layer 1 Deterministic Policy Scan, Layer 2 AI semantic analysis,
 * and Application-Side Citation Verification.
 */
export async function verifyContent(options: VerificationOptions): Promise<VerificationResult> {
  const { contentVersionId, textContent, brandId, userId } = options;

  // 1. Fetch approved and relevant brand knowledge items
  const dbKnowledge = await prisma.knowledgeItem.findMany({
    where: { brandId },
  });

  const knowledgeItems: KnowledgeItemData[] = dbKnowledge.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    content: item.content,
    sourceExcerpt: item.sourceExcerpt,
    approvalStatus: item.approvalStatus,
    effectiveDate: item.effectiveDate,
    expiryDate: item.expiryDate,
    version: item.version,
  }));

  const knowledgeMap = new Map<string, KnowledgeItemData>();
  for (const item of knowledgeItems) {
    knowledgeMap.set(item.id, item);
  }

  // 2. Layer 1: Deterministic Policy Check
  const deterministicRawFindings: RawFindingInput[] = runDeterministicChecks(textContent, {
    brandId,
    brandName: options.brandName || "Verdanta Foods",
    knowledgeItems,
  });

  // Visual Asset Check Layer (KB-VER-010 Brand Asset Compliance)
  let visualFindings: RawFindingInput[] = [];
  if (options.visualInput) {
    const visualResult = runVisualChecks(options.visualInput);
    visualFindings = visualResult.findings;

    // Persist visual check result on the content version
    if (contentVersionId) {
      await prisma.contentVersion
        .update({
          where: { id: contentVersionId },
          data: {
            imageUrl: options.visualInput.imageUrl || null,
            imageAltText: options.visualInput.imageAltText || null,
            imageAnalysis: JSON.stringify(visualResult),
          },
        })
        .catch((e) => console.warn("Could not update imageAnalysis on ContentVersion:", e));
    }
  }

  // 3. Layer 2: AI-Assisted Semantic Analysis (if available & enabled)
  let aiRawFindings: RawFindingInput[] = [];
  let providerUsed = "DETERMINISTIC_ONLY";
  let mode: "DETERMINISTIC" | "AI_ASSISTED" = "DETERMINISTIC";
  let aiMessage = "Deterministic engine analyzed draft against approved brand policies.";

  if (!options.forceDeterministicOnly && activeAIProvider.isAvailable()) {
    try {
      const aiResult = await activeAIProvider.analyzeContent(textContent, knowledgeItems);
      if (aiResult.success) {
        aiRawFindings = aiResult.findings;
        providerUsed = activeAIProvider.name;
        mode = "AI_ASSISTED";
        aiMessage = aiResult.providerMessage;
      } else {
        aiMessage = `${aiResult.providerMessage} Deterministic checks executed.`;
      }
    } catch (err: any) {
      aiMessage = `AI provider exception: ${err?.message || err}. Deterministic rules executed cleanly.`;
    }
  }

  // 4. Combine raw candidate findings (deduplicating overlapping affected text)
  const allRawFindings: RawFindingInput[] = [...deterministicRawFindings, ...visualFindings];

  for (const aiFinding of aiRawFindings) {
    // Avoid exact duplicate triggers already caught by deterministic rules
    const duplicate = allRawFindings.some(
      (f) =>
        f.sourceReferenceId === aiFinding.sourceReferenceId &&
        f.type === aiFinding.type &&
        f.affectedText.toLowerCase().includes(aiFinding.affectedText.toLowerCase().slice(0, 10))
    );
    if (!duplicate) {
      allRawFindings.push(aiFinding);
    }
  }

  // 5. Layer 3: Application-Side Citation & Evidence Validation (Non-negotiable)
  // Downgrades unverified citations, expired evidence, or fabricated IDs to INSUFFICIENT_EVIDENCE
  const validatedFindings: ValidatedFindingResult[] = allRawFindings.map((raw) =>
    validateFindingCitation(raw, knowledgeMap, new Date())
  );

  // 6. Compute aggregated metrics
  const counts = {
    total: validatedFindings.length,
    verifiedContradictions: validatedFindings.filter((f) => f.type === FindingType.VERIFIED_CONTRADICTION).length,
    unsupportedClaims: validatedFindings.filter((f) => f.type === FindingType.UNSUPPORTED_CLAIM).length,
    insufficientEvidence: validatedFindings.filter((f) => f.type === FindingType.INSUFFICIENT_EVIDENCE).length,
    possibleRisks: validatedFindings.filter((f) => f.type === FindingType.POSSIBLE_RISK).length,
    styleSuggestions: validatedFindings.filter((f) => f.type === FindingType.STYLE_SUGGESTION).length,
    highSeverity: validatedFindings.filter((f) => f.severity === "HIGH").length,
    requiresHumanReview: validatedFindings.filter((f) => f.requiresHumanReview).length,
  };

  const summary = `Verification complete: ${counts.total} findings identified (${counts.verifiedContradictions} contradictions, ${counts.insufficientEvidence} insufficient evidence, ${counts.possibleRisks} risks). Provider: ${providerUsed}.`;

  // 7. Persist AnalysisRun & Findings in Database
  const analysisRun = await prisma.analysisRun.create({
    data: {
      contentVersionId,
      provider: providerUsed,
      mode,
      status: "COMPLETED",
      triggeredById: userId,
      summary,
      findings: {
        create: validatedFindings.map((f) => ({
          type: f.type,
          severity: f.severity as FindingSeverity,
          affectedText: f.affectedText,
          explanation: f.explanation,
          evidenceStatus: f.evidenceStatus,
          sourceReferenceId: f.sourceReferenceId,
          quotedExcerpt: f.quotedExcerpt,
          citationValid: f.citationValid,
          citationFailureReason: f.citationFailureReason,
          insufficientEvidenceSubReason: f.insufficientEvidenceSubReason || null,
          routedReviewer: f.routedReviewer || null,
          suggestedCorrection: f.suggestedCorrection,
          suggestedCorrectionSupported: f.suggestedCorrectionSupported,
          resolutionStatus: ResolutionStatus.OPEN,
          requiresHumanReview: f.requiresHumanReview,
        })),
      },
    },
  });

  // 8. Record in Audit Log
  await prisma.auditLog.create({
    data: {
      action: "ANALYSIS_RUN_COMPLETED",
      userId,
      userName: options.userName || "Verified User",
      userRole: options.userRole || "USER",
      entityType: "ANALYSIS_RUN",
      entityId: analysisRun.id,
      details: JSON.stringify({
        contentVersionId,
        provider: providerUsed,
        mode,
        findingsCount: counts.total,
        highSeverity: counts.highSeverity,
        requiresHumanReview: counts.requiresHumanReview,
      }),
    },
  });

  return {
    analysisRunId: analysisRun.id,
    provider: providerUsed,
    mode,
    status: "COMPLETED",
    summary,
    findings: validatedFindings,
    counts,
  };
}
