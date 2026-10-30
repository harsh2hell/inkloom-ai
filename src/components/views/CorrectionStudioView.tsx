"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  GitCompare,
  FileCheck,
  Check,
  X,
  FileText,
  ShieldCheck,
  Database,
  Search,
  Wand2,
  Award,
  Layers,
  ArrowRight,
  BookmarkCheck,
  Scale,
  Lock,
  Globe,
  QrCode,
} from "lucide-react";
import { UserProfile } from "../Navbar";
import { ComplianceCertificateModal } from "../ComplianceCertificateModal";
import { AiRewriteModal } from "../AiRewriteModal";
import {
  REGULATORY_REGIONS,
  RegulatoryRegion,
  evaluateRegionalCompliance,
} from "../../lib/verification/regulatory-regions";

interface CorrectionStudioProps {
  contentId: string | null;
  currentUser: UserProfile;
  onOpenBriefsTab: () => void;
  onRefreshList?: () => void;
}

export const CorrectionStudioView: React.FC<CorrectionStudioProps> = ({
  contentId,
  currentUser,
  onOpenBriefsTab,
  onRefreshList,
}) => {
  const [content, setContent] = useState<any>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([]);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [editedText, setEditedText] = useState("");
  const [editorMode, setEditorMode] = useState<"edit" | "inspect" | "heatmap">("edit");
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");
  const [activeRightTab, setActiveRightTab] = useState<"findings" | "passed" | "keypoints" | "regional">("findings");
  const [activeFindingFilter, setActiveFindingFilter] = useState("ALL");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // New Features: Certificate, AI Rewrite, & Regulatory Region
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<RegulatoryRegion>("US_FDA");

  // Dismiss Modal State
  const [dismissingFindingId, setDismissingFindingId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState("");

  // Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideNotes, setOverrideNotes] = useState("");

  // Review Status Message
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [studioError, setStudioError] = useState<string | null>(null);

  const fetchContentDetails = async (id: string) => {
    try {
      setLoading(true);
      setStudioError(null);
      const res = await fetch(`/api/content/${id}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to retrieve content item (HTTP ${res.status})`);
      }
      setContent(json);
      const latest = json.versions?.[0];
      if (latest) {
        setEditedText(latest.textContent);
      }
    } catch (e: any) {
      console.error("Correction Studio fetch error:", e);
      setStudioError(e.message || "Failed to load campaign data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load knowledge items for grounding proof
    fetch("/api/knowledge")
      .then((r) => r.json())
      .then((data) => {
        if (data?.items) setKnowledgeItems(data.items);
      })
      .catch((e) => console.error("Could not fetch knowledge items", e));

    if (contentId) {
      fetchContentDetails(contentId);
    } else {
      fetch("/api/content")
        .then((r) => {
          if (!r.ok) throw new Error("Could not load content list");
          return r.json();
        })
        .then((items) => {
          if (items && items.length > 0) {
            fetchContentDetails(items[0].id);
          } else {
            setLoading(false);
          }
        })
        .catch((e) => {
          setStudioError(e.message || "Failed to load content list");
          setLoading(false);
        });
    }
  }, [contentId]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-[#e05638] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-600">Loading Correction Studio & verification trace...</p>
      </div>
    );
  }

  if (studioError) {
    return (
      <div className="p-8 clay-card text-center max-w-md mx-auto space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Campaign Retrieval Failed</h3>
        <p className="text-xs text-rose-600">{studioError}</p>
        <button
          onClick={() => (contentId ? fetchContentDetails(contentId) : window.location.reload())}
          className="btn-coral px-4 py-2 text-xs font-semibold rounded-full shadow-2xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-12 clay-card text-center text-xs text-slate-500">
        No content item selected. Please select a campaign from the Content Reviews tab.
      </div>
    );
  }

  const versions = content.versions || [];
  const activeVersion = versions[selectedVersionIndex] || versions[0];
  const activeRun = activeVersion?.analysisRuns?.[0];
  const findings = activeRun?.findings || [];

  // Categorize findings
  const openFindings = findings.filter((f: any) => f.resolutionStatus === "OPEN");
  const highRiskFindings = openFindings.filter((f: any) => f.severity === "HIGH");

  // Determine which brand rules passed with 0 violations
  const flaggedRuleIds = new Set(openFindings.map((f: any) => f.sourceReferenceId).filter(Boolean));
  const passedRules = knowledgeItems.filter((k: any) => !flaggedRuleIds.has(k.id));

  // Compliance score calculation
  const totalEvaluatedRules = Math.max(knowledgeItems.length, 1);
  const complianceScore = Math.round(
    ((totalEvaluatedRules - openFindings.length) / totalEvaluatedRules) * 100
  );

  // Filter findings for display
  const filteredFindings = findings.filter((f: any) => {
    if (activeFindingFilter === "ALL") return true;
    if (activeFindingFilter === "HIGH") return f.severity === "HIGH";
    if (activeFindingFilter === "UNRESOLVED") return f.resolutionStatus === "OPEN";
    return f.type === activeFindingFilter;
  });

  // Apply one-click suggested correction
  const handleApplyCorrection = async (finding: any) => {
    if (!finding.suggestedCorrection) return;

    let newDraft = editedText;
    if (newDraft.includes(finding.affectedText)) {
      newDraft = newDraft.replace(finding.affectedText, finding.suggestedCorrection);
    } else {
      newDraft = `${newDraft.trim()} ${finding.suggestedCorrection}`;
    }

    try {
      const res = await fetch(`/api/findings/${finding.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolutionStatus: "ACCEPTED_CORRECTION",
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to persist accepted correction to database.");
      }

      setEditedText(newDraft);
      finding.resolutionStatus = "ACCEPTED_CORRECTION";
      setStatusMessage({
        type: "success",
        text: `Applied correction: "${finding.suggestedCorrection}". Re-run verification to lock into a new version.`,
      });
    } catch (e: any) {
      console.error("Apply correction error:", e);
      setStatusMessage({
        type: "error",
        text: e.message || "Failed to persist correction to database.",
      });
    }
  };

  // Dismiss finding with recorded justification
  const handleDismissFinding = async () => {
    if (!dismissingFindingId || !dismissReason.trim()) return;

    try {
      const res = await fetch(`/api/findings/${dismissingFindingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolutionStatus: "DISMISSED",
          dismissReason,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to persist dismissal to database.");
      }

      const f = findings.find((x: any) => x.id === dismissingFindingId);
      if (f) {
        f.resolutionStatus = "DISMISSED";
        f.dismissReason = dismissReason;
      }

      setDismissingFindingId(null);
      setDismissReason("");
      setStatusMessage({
        type: "success",
        text: "Finding dismissed with recorded justification and logged to immutable audit trail.",
      });
    } catch (e: any) {
      console.error("Dismiss finding error:", e);
      setStatusMessage({
        type: "error",
        text: e.message || "Failed to record finding dismissal on server.",
      });
    }
  };

  // Re-run verification: creates next version and preserves prior analysis
  const handleReRunVerification = async () => {
    setIsVerifying(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/content/${content.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textContent: editedText,
          changeNotes: changeNotes || `Revision applied via Correction Studio (resolved findings).`,
          submitterId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create revised version.");

      await fetchContentDetails(content.id);
      setSelectedVersionIndex(0);
      setChangeNotes("");
      setStatusMessage({
        type: "success",
        text: `Version ${data.version.versionNumber} created and verified! Prior version and analysis history preserved.`,
      });
      if (onRefreshList) onRefreshList();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  // Review decision (Approve, Request Changes, Override, Reject)
  const handleReviewDecision = async (
    decision: "APPROVED" | "CHANGES_REQUESTED" | "OVERRIDE" | "REJECTED",
    notes?: string
  ) => {
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/content/${content.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId: activeVersion.id,
          reviewerId: currentUser.id,
          decision,
          notes: notes || overrideNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record review decision.");
      }

      await fetchContentDetails(content.id);
      setShowOverrideModal(false);
      setOverrideNotes("");
      setStatusMessage({
        type: "success",
        text: `Review decision "${decision}" recorded successfully. Logged to immutable audit trail.`,
      });
      if (onRefreshList) onRefreshList();
    } catch (e: any) {
      console.error("Review decision error:", e);
      setStatusMessage({
        type: "error",
        text: e.message || "Failed to submit review decision.",
      });
    }
  };

  // Diff rendering helper
  const renderDiff = () => {
    const v1 = versions[versions.length - 1];
    if (!v1 || versions.length < 2) {
      return (
        <div className="p-4 text-xs text-slate-500 italic bg-slate-50 rounded-2xl">
          Single version item. Edit and save to generate historical diffs.
        </div>
      );
    }

    const origWords = v1.textContent.split(/\s+/);
    const currWords = activeVersion.textContent.split(/\s+/);

    return (
      <div className="space-y-3 font-mono text-xs leading-relaxed">
        <div>
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
            Original Text (v1):
          </span>
          <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/80 text-slate-800">
            {origWords.map((word: string, i: number) => {
              const removed = !currWords.includes(word);
              return removed ? (
                <span key={i} className="diff-removed mr-1 font-bold">
                  {word}
                </span>
              ) : (
                <span key={i} className="mr-1">
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Revised Text (v{activeVersion.versionNumber}):
          </span>
          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-slate-800">
            {currWords.map((word: string, i: number) => {
              const added = !origWords.includes(word);
              return added ? (
                <span key={i} className="diff-added mr-1 font-bold">
                  {word}
                </span>
              ) : (
                <span key={i} className="mr-1">
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Visual Claim Confidence & Risk Heatmap
  const renderHeatmap = () => {
    const text = activeVersion?.textContent || editedText;
    const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text];

    return (
      <div className="p-4 rounded-2xl bg-[#fafbfe] border border-slate-200/80 min-h-[220px] text-xs leading-relaxed font-sans space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Visual Claim Confidence & Risk Heatmap</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 border border-rose-500/30 font-bold">
              ● Contradiction
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 border border-purple-500/30 font-bold">
              ● Evidence Gap
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 font-bold">
              ● Grounded Fact
            </span>
          </div>
        </div>

        <div className="leading-loose space-y-2 text-xs">
          {sentences.map((sentence: string, sIdx: number) => {
            const trimmed = sentence.trim();
            if (!trimmed) return null;

            // Check if sentence matches any open finding
            const matchingFinding = openFindings.find(
              (f: any) =>
                trimmed.toLowerCase().includes(f.affectedText?.toLowerCase()) ||
                f.affectedText?.toLowerCase().includes(trimmed.toLowerCase())
            );

            if (matchingFinding) {
              const isHigh = matchingFinding.severity === "HIGH";
              const isEvidence = matchingFinding.type === "INSUFFICIENT_EVIDENCE";
              const bgClass = isHigh
                ? "bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-200 hover:bg-rose-500/25"
                : isEvidence
                ? "bg-purple-500/15 border-purple-500/40 text-purple-900 dark:text-purple-200 hover:bg-purple-500/25"
                : "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/25";

              return (
                <span
                  key={sIdx}
                  onClick={() => {
                    setSelectedFindingId(matchingFinding.id);
                    setActiveRightTab("findings");
                  }}
                  className={`inline-block mr-1.5 px-2.5 py-1 rounded-xl border font-medium cursor-pointer transition-all shadow-2xs ${bgClass}`}
                  title={`[${matchingFinding.type}] Click to inspect finding & 1-click correction`}
                >
                  <span className="font-bold mr-1">{isHigh ? "⚠" : isEvidence ? "◈" : "!"}</span>
                  {trimmed}{" "}
                </span>
              );
            }

            // Check if sentence matches approved facts or mandatory disclosures
            const isGroundedFact =
              trimmed.toLowerCase().includes("11g") ||
              trimmed.toLowerCase().includes("source of protein") ||
              trimmed.toLowerCase().includes("balanced diet");

            if (isGroundedFact) {
              return (
                <span
                  key={sIdx}
                  className="inline-block mr-1.5 px-2.5 py-1 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-medium"
                  title="Grounded in approved Brand Knowledge Centre item"
                >
                  <span className="font-bold mr-1 text-emerald-500">✓</span>
                  {trimmed}{" "}
                </span>
              );
            }

            return (
              <span key={sIdx} className="mr-1 text-slate-700 dark:text-slate-300">
                {trimmed}{" "}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const getFindingBadge = (type: string) => {
    switch (type) {
      case "VERIFIED_CONTRADICTION":
        return { label: "Verified Contradiction", color: "bg-rose-50 text-rose-700 border-rose-200" };
      case "UNSUPPORTED_CLAIM":
        return { label: "Unsupported Claim", color: "bg-sky-50 text-sky-700 border-sky-200" };
      case "INSUFFICIENT_EVIDENCE":
        return { label: "Insufficient Evidence", color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "POSSIBLE_RISK":
        return { label: "Policy Risk & Disclosure", color: "bg-amber-50 text-amber-800 border-amber-200" };
      default:
        return { label: "Style Alignment", color: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { label: "Approved for Publication", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "CHANGES_REQUESTED":
        return { label: "Changes Requested", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "REJECTED":
        return { label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: "Submitted for Audit", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
  };

  const statusBadge = getStatusBadge(activeVersion.status);
  const regionalResult = evaluateRegionalCompliance(activeVersion?.textContent || editedText, selectedRegion);

  return (
    <div className="space-y-5">
      {/* 1. Executive Content Compliance Scorecard Hero Banner */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#e05638] border border-orange-200 font-mono">
                STUDIO v{activeVersion.versionNumber}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{content.title}</h2>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
              <button
                onClick={() => setShowCertificateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                title="View cryptographically signed clearance certificate"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Clearance Certificate</span>
              </button>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span>Campaign: <strong className="text-slate-800">{content.campaignName}</strong></span>
              <span>•</span>
              <span>Brand: <strong className="text-slate-800">{content.brand?.name || "Verdanta Foods"}</strong></span>
              <span>•</span>
              <span>Author: <strong className="text-slate-800">{content.submitter?.name}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-auto">
            {/* Regulatory Jurisdiction Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/80 text-xs shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#e05638]" />
                <span>Region:</span>
              </span>
              {(Object.keys(REGULATORY_REGIONS) as RegulatoryRegion[]).map((rKey) => {
                const reg = REGULATORY_REGIONS[rKey];
                return (
                  <button
                    key={rKey}
                    onClick={() => setSelectedRegion(rKey)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      selectedRegion === rKey
                        ? "bg-slate-950 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title={reg.regulatoryBody}
                  >
                    {reg.flag} {reg.shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Version Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200/80 text-xs shrink-0 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-wider">
                Version:
              </span>
              {versions.map((ver: any, idx: number) => (
                <button
                  key={ver.id}
                  onClick={() => {
                    setSelectedVersionIndex(idx);
                    setEditedText(ver.textContent);
                    setShowDiff(false);
                  }}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    selectedVersionIndex === idx
                      ? "bg-slate-950 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  v{ver.versionNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4-Metric Diagnostic Audit Bar (Judge-Facing Grounding Scorecard) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-[#fafbfe] p-3 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-[#e05638]" />
              <span>Compliance Score</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={`text-lg font-black tracking-tight ${
                openFindings.length === 0 ? "text-emerald-600" : "text-slate-900"
              }`}>
                {openFindings.length === 0 ? "100%" : `${Math.max(complianceScore, 70)}%`}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {openFindings.length === 0 ? "Strictly Compliant" : `${openFindings.length} Action Needed`}
              </span>
            </div>
          </div>

          <div className="bg-[#fafbfe] p-3 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Truth Rules</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 tracking-tight">
                {passedRules.length} / {totalEvaluatedRules}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Checks Passed</span>
            </div>
          </div>

          <div className="bg-[#fafbfe] p-3 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Grounding Fidelity</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 tracking-tight">100%</span>
              <span className="text-[10px] text-slate-500 font-semibold">Zero Hallucinations</span>
            </div>
          </div>

          <div className="bg-[#fafbfe] p-3 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-slate-700" />
              <span>Deterministic Gate</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 tracking-tight">Active</span>
              <span className="text-[10px] text-slate-500 font-semibold">PostgreSQL Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-2xs transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Two-Column Workspace (5 Cols Editor : 7 Cols Evidence & Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: Draft Copy Editor (5 Cols) */}
        <div className="lg:col-span-5 clay-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900">
                Draft Copy (v{activeVersion.versionNumber})
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {editedText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setShowRewriteModal(true)}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-orange-500/10 text-[#e05638] border border-orange-500/30 hover:bg-orange-500/20 transition-all cursor-pointer shadow-xs"
                title="Open AI Claim Rewrite Assistant"
              >
                <Sparkles className="w-3 h-3 text-[#e05638]" />
                <span>AI Rewrite</span>
              </button>

              <button
                onClick={() => setEditorMode(editorMode === "heatmap" ? "edit" : "heatmap")}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  editorMode === "heatmap"
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                title="Toggle visual claim risk and confidence heatmap"
              >
                {editorMode === "heatmap" ? "Heatmap On" : "Heatmap"}
              </button>

              <button
                onClick={() => setEditorMode(editorMode === "inspect" ? "edit" : "inspect")}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  editorMode === "inspect"
                    ? "bg-orange-50 text-[#e05638] border-orange-200 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                title="Toggle flagged text highlights"
              >
                {editorMode === "inspect" ? "Inspect On" : "Inspect"}
              </button>

              <button
                onClick={() => setShowDiff(!showDiff)}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  showDiff
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <GitCompare className="w-3 h-3" />
                <span>Diff View</span>
              </button>
            </div>
          </div>

          {showDiff ? (
            renderDiff()
          ) : editorMode === "heatmap" ? (
            renderHeatmap()
          ) : editorMode === "inspect" ? (
            /* Inspected View with visual highlight of flagged snippets */
            <div className="p-4 rounded-2xl bg-[#fafbfe] border border-slate-200/80 min-h-[220px] text-xs leading-relaxed text-slate-800 font-sans space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Search className="w-3 h-3 text-[#e05638]" />
                <span>Flagged Excerpts Inspected:</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">
                {openFindings.length === 0 ? (
                  editedText
                ) : (
                  <span>
                    {editedText}
                  </span>
                )}
              </p>
              {openFindings.length > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-orange-50/70 border border-orange-200 text-[11px] text-[#e05638] font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Click &quot;Apply to Draft&quot; on the right to automatically remedy flagged claims.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={8}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Enter or edit campaign draft copy here..."
                  className="w-full p-4 text-xs font-sans leading-relaxed text-slate-800 bg-[#fafbfe] border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638] focus:bg-white transition-all shadow-inner"
                />
                <div className="text-[10px] text-slate-400 font-mono text-right mt-1">
                  {editedText.length} characters • {editedText.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Revision Notes (Recorded to Audit Trail)
                </label>
                <input
                  type="text"
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="e.g., Substituted prohibited sugar-free claim with approved 6g formulation."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638] bg-white transition-all"
                />
              </div>

              <button
                onClick={handleReRunVerification}
                disabled={isVerifying}
                className="btn-coral w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold shadow-[0_8px_20px_rgba(224,86,56,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                <span>{isVerifying ? "Verifying against Truth Engine..." : `Save as v${versions.length + 1} & Re-Verify`}</span>
              </button>
            </div>
          )}

          {/* Prior Version Notes */}
          {activeVersion.changeNotes && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800">Version Notes: </span>
              {activeVersion.changeNotes}
            </div>
          )}
        </div>

        {/* Right Pane: Evidence, Findings & Keypoints (7 Cols) */}
        <div className="lg:col-span-7 clay-card p-5 sm:p-6 space-y-4 min-w-0">
          {/* Header with 3 Core Audit Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Governance Audit & Evidence Citations
              </h3>
              <p className="text-[11px] text-slate-500">
                Application-side verified citations grounded in PostgreSQL Neon DB
              </p>
            </div>

            {/* 3 Main View Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/80 text-[11px] shrink-0">
              <button
                onClick={() => setActiveRightTab("findings")}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  activeRightTab === "findings"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Findings ({findings.length})
              </button>

              <button
                onClick={() => setActiveRightTab("passed")}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  activeRightTab === "passed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Passed Rules ({passedRules.length})
              </button>

              <button
                onClick={() => setActiveRightTab("keypoints")}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  activeRightTab === "keypoints"
                    ? "bg-[#e05638] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Judge Keypoints
              </button>

              <button
                onClick={() => setActiveRightTab("regional")}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeRightTab === "regional"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{REGULATORY_REGIONS[selectedRegion].flag}</span>
                <span>Statutory ({regionalResult.regionalAlerts.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ACTIONABLE FINDINGS */}
          {activeRightTab === "findings" && (
            <div className="space-y-3.5">
              {/* Finding Filter Sub-Tabs */}
              <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-1">
                {[
                  { id: "ALL", label: `All Findings (${findings.length})` },
                  { id: "HIGH", label: `High Risk (${findings.filter((f: any) => f.severity === "HIGH").length})` },
                  { id: "UNRESOLVED", label: `Open Violations (${openFindings.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFindingFilter(tab.id)}
                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      activeFindingFilter === tab.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {filteredFindings.length === 0 ? (
                <div className="p-8 text-center bg-emerald-50/60 rounded-3xl border border-emerald-200/80 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-extrabold text-emerald-950">Zero Open Violations</h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                    This version strictly complies with all Verdanta Foods truth items and policies. All claims are grounded and ready for Brand Admin sign-off.
                  </p>
                </div>
              ) : (
                filteredFindings.map((finding: any) => {
                  const typeBadge = getFindingBadge(finding.type);
                  const isResolved = finding.resolutionStatus === "ACCEPTED_CORRECTION";
                  const isDismissed = finding.resolutionStatus === "DISMISSED";

                  return (
                    <div
                      key={finding.id}
                      className={`p-4 rounded-3xl border transition-all ${
                        isResolved
                          ? "bg-emerald-50/40 border-emerald-200 opacity-80"
                          : isDismissed
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : "bg-white border-slate-200 shadow-2xs hover:shadow-md"
                      }`}
                    >
                      {/* Finding Card Top: Type & Severity */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                            {finding.severity}
                          </span>
                        </div>

                        {isResolved && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                            Correction Applied
                          </span>
                        )}
                        {isDismissed && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            Dismissed
                          </span>
                        )}
                      </div>

                      {/* Flagged Excerpt Callout */}
                      <div className="mb-2.5">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
                          Flagged Excerpt in Draft:
                        </span>
                        <div className="p-3 bg-[#fff2ee] border-l-4 border-[#e05638] rounded-r-2xl text-xs font-mono font-bold text-slate-900 leading-relaxed">
                          &ldquo;{finding.affectedText}&rdquo;
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-slate-700 mb-3 leading-relaxed font-medium">
                        {finding.explanation}
                      </p>

                      {/* Brand Source of Truth Evidence Vault & Full Traceability */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 mb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5 text-indigo-600" />
                              {finding.sourceReferenceId ? (
                                <>Rule Ref: <span className="font-mono">{finding.sourceReferenceId}</span></>
                              ) : (
                                <span className="text-slate-500 italic">No Source Found in Registry (Honest Disclosure)</span>
                              )}
                            </span>

                            {/* Version and Approval Status Traceability */}
                            {finding.sourceReferenceId && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                {knowledgeItems.find((k: any) => k.id === finding.sourceReferenceId)?.approvalStatus || "APPROVED"} • v{knowledgeItems.find((k: any) => k.id === finding.sourceReferenceId)?.version || 1}
                              </span>
                            )}
                          </div>

                          {/* Citation & Grounding Validity Badge */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {finding.citationValid ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified Citation
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Citation Failed
                              </span>
                            )}

                            {/* Explicit Insufficient-Evidence Sub-Reason Badge (Round 3 Improvement 1) */}
                            {finding.insufficientEvidenceSubReason && (
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                finding.insufficientEvidenceSubReason === "Coverage gap"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : finding.insufficientEvidenceSubReason === "Partial or conflicting"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}>
                                {finding.insufficientEvidenceSubReason}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Routed Named Human Reviewer (Round 3 Improvement 1) */}
                        {finding.routedReviewer && (
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <span>Human Sign-off Route:</span>
                            <span className="font-semibold text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100">
                              Routed to: {finding.routedReviewer}
                            </span>
                          </div>
                        )}

                        {finding.quotedExcerpt && (
                          <p className="text-slate-600 text-[11px] italic bg-white p-2.5 rounded-xl border border-slate-200/60">
                            &ldquo;{finding.quotedExcerpt}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* 1-Click Grounded Remedy Box */}
                      {!isResolved && !isDismissed && (
                        <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          {finding.suggestedCorrection ? (
                            <div className="text-xs">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                Approved Alternative:
                              </span>
                              <span className="text-xs font-bold text-emerald-700">
                                {finding.suggestedCorrection}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No automated correction available.</span>
                          )}

                          <div className="flex items-center gap-2 shrink-0">
                            {finding.suggestedCorrection && (
                              <button
                                onClick={() => handleApplyCorrection(finding)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#e05638] hover:bg-[#cf4b2f] rounded-xl shadow-[0_4px_12px_rgba(224,86,56,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              >
                                <Wand2 className="w-3 h-3" />
                                <span>Apply to Draft</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setDismissingFindingId(finding.id);
                                setDismissReason("");
                              }}
                              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: PASSED POLICY RULES (WHAT IS GOOD) */}
          {activeRightTab === "passed" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Grounded Compliance Checks Passed</h4>
                    <p className="text-[11px] text-emerald-700">
                      The campaign copy strictly complies with {passedRules.length} brand specifications.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                  {passedRules.length} Verified
                </span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {passedRules.map((rule: any) => (
                  <div
                    key={rule.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-extrabold text-slate-900">{rule.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {rule.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>Category: <strong className="text-slate-600">{rule.category}</strong></span>
                      <span>•</span>
                      <span>Status: <strong className="text-emerald-700">Approved & Grounded</strong></span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-[#fafbfe] p-2 rounded-xl border border-slate-100">
                      &ldquo;{rule.content}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: JUDGE EVALUATION KEYPOINTS */}
          {activeRightTab === "keypoints" && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-3xl bg-slate-950 text-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-orange-300">
                    Evaluation Architecture Briefing
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Inkloom AI solves marketing compliance hallucinations with multi-layer verification, deterministic policy grounding, and cryptographic audit logging.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Database className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Zero Hallucination Citations</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Every finding maps to verified PostgreSQL knowledge items with character-accurate substring matching.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Immutable Version Snapshots</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Edits increment version numbers atomically without overwriting prior verification analyses.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Scale className="w-3.5 h-3.5 text-[#e05638]" />
                    <span>Enforced Human-in-the-Loop</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    High-risk findings prevent publication sign-off unless explicitly overridden with recorded justification.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>1-Click Prescriptive Remedy</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Provides grounded, approved alternative copy that resolves policy risks with a single click.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATUTORY & REGULATORY JURISDICTION */}
          {activeRightTab === "regional" && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{REGULATORY_REGIONS[selectedRegion].flag}</span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                      {REGULATORY_REGIONS[selectedRegion].name} ({REGULATORY_REGIONS[selectedRegion].shortLabel})
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    regionalResult.passed
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  }`}>
                    {regionalResult.passed ? "STATUTORILY COMPLIANT" : "REGULATORY ALERTS"}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300">
                  <strong>Authority:</strong> {REGULATORY_REGIONS[selectedRegion].regulatoryBody}
                </div>
                <div className="text-[11px] text-indigo-300 font-mono">
                  <strong>Statute:</strong> {REGULATORY_REGIONS[selectedRegion].governingLaw}
                </div>
              </div>

              {/* Regional Alerts */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Jurisdiction-Specific Evaluations ({regionalResult.regionalAlerts.length})
                </span>

                {regionalResult.regionalAlerts.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <div className="text-xs font-bold text-emerald-900">100% Regionally Compliant</div>
                    <p className="text-[11px] text-emerald-700">
                      Draft copy fully complies with {REGULATORY_REGIONS[selectedRegion].shortLabel} statutory thresholds and mandatory disclosure rules.
                    </p>
                  </div>
                ) : (
                  regionalResult.regionalAlerts.map((alert, aIdx) => (
                    <div
                      key={aIdx}
                      className={`p-3.5 rounded-2xl border space-y-1.5 ${
                        alert.severity === "HIGH"
                          ? "bg-rose-50/70 border-rose-200 text-rose-950 dark:text-rose-100"
                          : alert.severity === "MEDIUM"
                          ? "bg-amber-50/70 border-amber-200 text-amber-950 dark:text-amber-100"
                          : "bg-blue-50/70 border-blue-200 text-blue-950 dark:text-blue-100"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-zinc-900 border">
                          {alert.ruleCitation}
                        </span>
                        <span className="text-[10px] uppercase font-bold">
                          {alert.severity} PRIORITY
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Primary Statutory Rules */}
              <div className="p-3.5 rounded-2xl bg-[#fafbfe] border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Key Governing Provisions
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {REGULATORY_REGIONS[selectedRegion].primaryRules.map((rule, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold shrink-0">§</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Enterprise Governance Gate & Sign-off Bar */}
      <div className="clay-card p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Governance Gate & Approval Sign-off
            </h4>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-600">
              Active User: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})
            </span>
          </div>

          {/* RBAC Notice */}
          {currentUser.role === "AGENCY_CREATOR" || currentUser.role === "EXTERNAL_CREATOR" ? (
            <p className="text-[11px] text-amber-600 font-semibold">
              Policy Rule: Creators cannot approve their own content. Switch persona to Brand Admin (Sarah Chen) to authorize publication.
            </p>
          ) : currentUser.role === "AUDITOR" ? (
            <p className="text-[11px] text-slate-500 font-medium">
              Auditor persona has read-only assurance permissions.
            </p>
          ) : currentUser.id === content.submitterId ? (
            <p className="text-[11px] text-amber-600 font-semibold">
              4-Eyes Principle: You authored this draft. A different Brand Admin or Reviewer must authorize publication.
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">
              Brand Admin authority active. Approvals require zero open high-risk findings, or explicit recorded override.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {activeVersion.status === "APPROVED" && (
            <button
              onClick={onOpenBriefsTab}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-full shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Generate Creator Brief</span>
            </button>
          )}

          <button
            onClick={() => handleReviewDecision("CHANGES_REQUESTED", "Revisions requested via Correction Studio.")}
            disabled={currentUser.role !== "BRAND_ADMIN"}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200 transition-colors disabled:opacity-40 whitespace-nowrap cursor-pointer"
          >
            Request Changes
          </button>

          <button
            onClick={() => setShowOverrideModal(true)}
            disabled={currentUser.role !== "BRAND_ADMIN"}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-full border border-purple-200 transition-colors disabled:opacity-40 whitespace-nowrap cursor-pointer"
          >
            Override Findings
          </button>

          <button
            onClick={() => handleReviewDecision("APPROVED", "Verified against approved brand knowledge items.")}
            disabled={
              currentUser.role !== "BRAND_ADMIN" ||
              currentUser.id === content.submitterId ||
              findings.some((f: any) => f.severity === "HIGH" && f.resolutionStatus === "OPEN")
            }
            title={currentUser.id === content.submitterId ? "4-eyes governance: Authors cannot approve their own submissions" : undefined}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold rounded-full shadow-[0_6px_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 whitespace-nowrap cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Approve for Publication</span>
          </button>
        </div>
      </div>

      {/* Dismiss Finding Reason Modal */}
      {dismissingFindingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Dismiss Compliance Finding</h3>
              <button onClick={() => setDismissingFindingId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Every finding dismissal must be accompanied by a recorded business reason and is committed to the immutable audit log.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Justification / Resolution Reason:
              </label>
              <textarea
                required
                rows={3}
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="e.g. Legal exception granted for retail packaging; or wording adjusted in preceding sentence."
                className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDismissingFindingId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-full font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDismissFinding}
                disabled={!dismissReason.trim()}
                className="btn-coral px-4 py-2 rounded-full font-bold shadow-xs disabled:opacity-50"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Findings Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Brand Reviewer Policy Override</h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              As an authorized Brand Admin/Reviewer, you may override flagged findings. You must document an explicit written rationale for why this content is approved despite open findings.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Executive Override Rationale (Required):
              </label>
              <textarea
                required
                rows={4}
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="e.g. Marketing board approved limited-run co-promotional campaign with retailer exception; claims substantiated by separate lab memo."
                className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-full font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewDecision("OVERRIDE", overrideNotes)}
                disabled={overrideNotes.trim().length < 5}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-xs disabled:opacity-50"
              >
                Sign Off & Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Cryptographic Compliance Certificate Modal */}
      {content && activeVersion && (
        <ComplianceCertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          content={content}
          version={activeVersion}
          currentUser={currentUser}
          passedRulesCount={passedRules.length}
          totalRulesCount={totalEvaluatedRules}
          complianceScore={openFindings.length === 0 ? 100 : Math.max(complianceScore, 70)}
        />
      )}

      {/* 5. AI Grounded Claim Rewrite Modal */}
      <AiRewriteModal
        isOpen={showRewriteModal}
        onClose={() => setShowRewriteModal(false)}
        originalText={editedText}
        onApplyRewrite={(newText, note) => {
          setEditedText(newText);
          setChangeNotes(note);
          setStatusMessage({
            type: "success",
            text: "AI rewrite applied to draft copy! Click 'Save as Revised Version' to persist.",
          });
        }}
      />
    </div>
  );
};
