"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  AlertOctagon,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  GitCompare,
  FileEdit,
  FileCheck,
  Check,
  X,
  FileText,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Info,
  Database,
} from "lucide-react";
import { UserProfile } from "../Navbar";

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
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");
  const [activeFindingFilter, setActiveFindingFilter] = useState("ALL");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

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
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium text-slate-500">Loading Correction Studio & verification trace...</p>
      </div>
    );
  }

  if (studioError) {
    return (
      <div className="p-8 saas-card text-center max-w-md mx-auto space-y-3">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Campaign Retrieval Failed</h3>
        <p className="text-xs text-rose-600">{studioError}</p>
        <button
          onClick={() => contentId ? fetchContentDetails(contentId) : window.location.reload()}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-12 saas-card text-center text-xs text-slate-500">
        No content item selected. Please select a campaign from the Content Reviews tab.
      </div>
    );
  }

  const versions = content.versions || [];
  const activeVersion = versions[selectedVersionIndex] || versions[0];
  const activeRun = activeVersion?.analysisRuns?.[0];
  const findings = activeRun?.findings || [];

  // Filter findings
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
        text: `Applied correction: "${finding.suggestedCorrection}". Re-run verification to lock into new version.`,
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

  // Re-run verification: creates next version (v2, v3, etc.) and preserves prior analysis
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
        throw new Error(data.error || "Decision rejected by server authorization check.");
      }

      await fetchContentDetails(content.id);
      setShowOverrideModal(false);
      setOverrideNotes("");
      setStatusMessage({
        type: "success",
        text: `Content ${decision} successfully recorded! Audit log updated.`,
      });
      if (onRefreshList) onRefreshList();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  // Visual diff renderer between version 1 and current edited text
  const renderSimpleDiff = (orig: string, curr: string) => {
    const origWords = orig.split(/\s+/);
    const currWords = curr.split(/\s+/);

    return (
      <div className="space-y-3 font-mono text-xs leading-relaxed">
        <div>
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
            Original Text (v1):
          </span>
          <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-200 text-slate-800">
            {origWords.map((word, i) => {
              const removed = !currWords.includes(word);
              return removed ? (
                <span key={i} className="diff-removed mr-1">
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
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 text-slate-800">
            {currWords.map((word, i) => {
              const added = !origWords.includes(word);
              return added ? (
                <span key={i} className="diff-added mr-1">
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

  const getFindingBadge = (type: string) => {
    switch (type) {
      case "VERIFIED_CONTRADICTION":
        return { label: "Verified Contradiction", color: "bg-rose-50 text-rose-700 border-rose-200" };
      case "UNSUPPORTED_CLAIM":
        return { label: "Unsupported Claim", color: "bg-sky-50 text-sky-700 border-sky-200" };
      case "INSUFFICIENT_EVIDENCE":
        return { label: "Insufficient Evidence", color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "POSSIBLE_RISK":
        return { label: "Policy Risk / Disclosure", color: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { label: "Style Alignment", color: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "CHANGES_REQUESTED":
        return { label: "Changes Requested", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "REJECTED":
        return { label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: "Submitted", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
  };

  const statusBadge = getStatusBadge(activeVersion.status);

  return (
    <div className="space-y-5">
      {/* Top Workspace Header */}
      <div className="saas-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              STUDIO
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{content.title}</h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
            <span>Campaign: <strong className="text-slate-700">{content.campaignName}</strong></span>
            <span>•</span>
            <span>Brand: {content.brand?.name || "Verdanta Foods"}</span>
            <span>•</span>
            <span>Author: {content.submitter?.name}</span>
          </div>
        </div>

        {/* Version Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-lg border border-slate-200 text-xs self-start md:self-auto">
          <span className="text-[10px] text-slate-400 font-semibold px-2 uppercase tracking-wider">
            Version:
          </span>
          {versions.map((ver: any, idx: number) => (
            <button
              key={ver.id}
              onClick={() => {
                setSelectedVersionIndex(idx);
                setEditedText(ver.textContent);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedVersionIndex === idx
                  ? "bg-white text-indigo-700 shadow-2xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              v{ver.versionNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Split-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: Content Editor & Visual Diff (5 Cols) */}
        <div className="lg:col-span-5 saas-card p-4 sm:p-5 space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900">
                Draft Copy (v{activeVersion.versionNumber})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDiff(!showDiff)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  showDiff
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>{showDiff ? "Editor" : "Diff View"}</span>
              </button>
            </div>
          </div>

          {/* Editor Body */}
          {showDiff ? (
            <div className="p-1">
              {renderSimpleDiff(versions[versions.length - 1]?.textContent || "", editedText)}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={8}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-3 text-xs leading-relaxed text-slate-900 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  placeholder="Enter marketing caption draft..."
                />
                <div className="text-[10px] text-slate-400 text-right mt-1">
                  {editedText.length} characters • {editedText.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Revision Notes (Recorded to Audit Trail)
                </label>
                <input
                  type="text"
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="e.g., Substituted prohibited sugar-free claim with approved 6g formulation."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleReRunVerification}
                disabled={isVerifying || editedText === activeVersion.textContent}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                <span>{isVerifying ? "Verifying..." : `Save as v${versions.length + 1} & Re-Verify`}</span>
              </button>
            </div>
          )}

          {/* Prior Version Notes */}
          {activeVersion.changeNotes && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Version Notes: </span>
              {activeVersion.changeNotes}
            </div>
          )}
        </div>

        {/* Right Pane: Evidence & Findings Workspace (7 Cols) */}
        <div className="lg:col-span-7 saas-card p-4 sm:p-5 space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Verification Findings & Evidence Citations
              </h3>
              <p className="text-[11px] text-slate-500">
                Application-side verified citations from brand source of truth
              </p>
            </div>

            {/* Finding Filter Tabs */}
            <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "ALL", label: `All (${findings.length})` },
                { id: "HIGH", label: `High Risk (${findings.filter((f: any) => f.severity === "HIGH").length})` },
                { id: "UNRESOLVED", label: `Open (${findings.filter((f: any) => f.resolutionStatus === "OPEN").length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFindingFilter(tab.id)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    activeFindingFilter === tab.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Finding Cards List */}
          <div className="space-y-3">
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-emerald-900">Zero Open Violations</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  This version strictly complies with all Verdanta Foods truth items and policies.
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
                    className={`p-3.5 rounded-lg border transition-all ${
                      isResolved
                        ? "bg-emerald-50/40 border-emerald-200 opacity-75"
                        : isDismissed
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
                    }`}
                  >
                    {/* Header: Type, Severity, Resolution Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${typeBadge.color}`}>
                          {typeBadge.label}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          {finding.severity}
                        </span>
                      </div>

                      {isResolved && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Correction Applied
                        </span>
                      )}
                      {isDismissed && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Dismissed
                        </span>
                      )}
                    </div>

                    {/* Affected Quote */}
                    <div className="mb-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                        Flagged Excerpt:
                      </span>
                      <p className="text-xs font-semibold text-slate-900 bg-rose-50/60 text-rose-950 px-2.5 py-1.5 rounded border border-rose-100">
                        &ldquo;{finding.affectedText}&rdquo;
                      </p>
                    </div>

                    {/* Explanation */}
                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">{finding.explanation}</p>

                    {/* Citation & Ground Truth Box */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5 mb-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-indigo-600" />
                          Source: {finding.sourceReferenceId}
                        </span>

                        {/* Citation Validity Badge (STRICT APPLICATION-SIDE CHECK) */}
                        {finding.citationValid ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Evidence
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Citation Invalid / Expired
                          </span>
                        )}
                      </div>

                      {finding.quotedExcerpt && (
                        <p className="text-slate-600 text-[11px] italic">
                          &ldquo;{finding.quotedExcerpt}&rdquo;
                        </p>
                      )}

                      {!finding.citationValid && finding.citationFailureReason && (
                        <div className="text-[10px] text-rose-700 font-medium pt-0.5">
                          Warning: {finding.citationFailureReason}
                        </div>
                      )}
                    </div>

                    {/* Suggested Correction & Action Controls */}
                    {!isResolved && !isDismissed && (
                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {finding.suggestedCorrection ? (
                          <div className="text-xs">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                              Approved Alternative:
                            </span>
                            <span className="text-xs font-semibold text-emerald-700">
                              {finding.suggestedCorrection}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No automated correction available.</span>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                          {finding.suggestedCorrection && (
                            <button
                              onClick={() => handleApplyCorrection(finding)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-2xs transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Apply to Draft</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setDismissingFindingId(finding.id);
                              setDismissReason("");
                            }}
                            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}

                    {isDismissed && finding.dismissReason && (
                      <div className="text-[11px] text-slate-500 bg-slate-100 p-2 rounded">
                        <strong>Dismissal Reason:</strong> {finding.dismissReason}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Human Review & Approval Action Bar */}
      <div className="saas-card p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Governance Gate & Approval Sign-off
            </h4>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-600">
              Active User: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})
            </span>
          </div>

          {/* RBAC Notice */}
          {currentUser.role === "AGENCY_CREATOR" || currentUser.role === "EXTERNAL_CREATOR" ? (
            <p className="text-[11px] text-amber-600 font-medium">
              Policy Rule: Creators cannot approve their own content. Switch role to Brand Admin (Sarah Chen) to approve.
            </p>
          ) : currentUser.role === "AUDITOR" ? (
            <p className="text-[11px] text-slate-500 font-medium">
              Auditor role has read-only assurance permissions.
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
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Generate Creator Brief</span>
            </button>
          )}

          <button
            onClick={() => handleReviewDecision("CHANGES_REQUESTED", "Revisions requested via Correction Studio.")}
            disabled={currentUser.role !== "BRAND_ADMIN"}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            Request Changes
          </button>

          <button
            onClick={() => setShowOverrideModal(true)}
            disabled={currentUser.role !== "BRAND_ADMIN"}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold rounded-lg border border-purple-200 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            Override Findings
          </button>

          <button
            onClick={() => handleReviewDecision("APPROVED", "Verified against approved brand knowledge items.")}
            disabled={
              currentUser.role !== "BRAND_ADMIN" ||
              findings.some((f: any) => f.severity === "HIGH" && f.resolutionStatus === "OPEN")
            }
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve for Publication</span>
          </button>
        </div>
      </div>

      {/* Dismiss Finding Reason Modal */}
      {dismissingFindingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-5 space-y-3 text-xs">
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
              <label className="block font-semibold text-slate-700 mb-1">
                Justification / Resolution Reason:
              </label>
              <textarea
                required
                rows={3}
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="e.g. Legal exception granted for retail packaging; or wording adjusted in preceding sentence."
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDismissingFindingId(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDismissFinding}
                disabled={!dismissReason.trim()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs disabled:opacity-50"
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-5 space-y-3 text-xs">
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
              <label className="block font-semibold text-slate-700 mb-1">
                Executive Override Rationale (Required):
              </label>
              <textarea
                required
                rows={4}
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="e.g. Marketing board approved limited-run co-promotional campaign with retailer exception; claims substantiated by separate lab memo."
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewDecision("OVERRIDE", overrideNotes)}
                disabled={overrideNotes.trim().length < 5}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-2xs disabled:opacity-50"
              >
                Sign Off & Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
