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
  MessageSquare,
  FileText,
  AlertCircle,
  ExternalLink,
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

  const fetchContentDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/content/${id}`);
      const json = await res.json();
      if (res.ok) {
        setContent(json);
        const latest = json.versions?.[0];
        if (latest) {
          setEditedText(latest.textContent);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contentId) {
      fetchContentDetails(contentId);
    } else {
      // Fetch default sample content if none selected
      fetch("/api/content")
        .then((r) => r.json())
        .then((items) => {
          if (items && items.length > 0) {
            fetchContentDetails(items[0].id);
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [contentId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium">Opening Correction Studio & Verification Trace...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
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

    // Replace affected text in draft editor
    let newDraft = editedText;
    if (newDraft.includes(finding.affectedText)) {
      newDraft = newDraft.replace(finding.affectedText, finding.suggestedCorrection);
    } else {
      // Append correction if affectedText was end of text or not found verbatim
      newDraft = `${newDraft.trim()} ${finding.suggestedCorrection}`;
    }
    setEditedText(newDraft);

    // Update finding resolution status to ACCEPTED_CORRECTION
    try {
      await fetch(`/api/findings/${finding.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolutionStatus: "ACCEPTED_CORRECTION",
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
        }),
      });

      // Update local state
      finding.resolutionStatus = "ACCEPTED_CORRECTION";
      setStatusMessage({
        type: "success",
        text: `Applied correction: &ldquo;${finding.suggestedCorrection}&rdquo;. Re-run verification to lock into new version.`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Dismiss finding with recorded justification
  const handleDismissFinding = async () => {
    if (!dismissingFindingId || !dismissReason.trim()) return;

    try {
      await fetch(`/api/findings/${dismissingFindingId}`, {
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
    } catch (e) {
      console.error(e);
    }
  };

  // Re-run verification: creates next version (v2, v3, etc.) and preserves prior analysis!
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

      // Re-fetch entire content item
      await fetchContentDetails(content.id);
      setSelectedVersionIndex(0); // Switch to newly created version
      setChangeNotes("");
      setStatusMessage({
        type: "success",
        text: `New Version ${data.version.versionNumber} created and verified! Prior versions and analysis history preserved.`,
      });
      if (onRefreshList) onRefreshList();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  // Review decision (Approve, Request Changes, Override, Reject)
  const handleReviewDecision = async (decision: "APPROVED" | "CHANGES_REQUESTED" | "OVERRIDE" | "REJECTED", notes?: string) => {
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
      <div className="space-y-4 font-mono text-xs leading-relaxed">
        <div>
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">
            Original Text (v1):
          </span>
          <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 text-slate-800">
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
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-slate-800">
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

  const getFindingIcon = (type: string) => {
    switch (type) {
      case "VERIFIED_CONTRADICTION":
        return <AlertOctagon className="w-4 h-4 text-red-600" />;
      case "UNSUPPORTED_CLAIM":
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case "INSUFFICIENT_EVIDENCE":
        return <ShieldAlert className="w-4 h-4 text-purple-600" />;
      case "POSSIBLE_RISK":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Studio Header & Version Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              STUDIO
            </span>
            <h1 className="text-lg font-bold text-slate-900">{content.title}</h1>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                activeVersion.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : activeVersion.status === "CHANGES_REQUESTED"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-blue-100 text-blue-800 border-blue-200"
              }`}
            >
              {activeVersion.status}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Campaign: <strong className="text-slate-700">{content.campaignName}</strong></span>
            <span>•</span>
            <span>Brand: {content.brand?.name}</span>
            <span>•</span>
            <span>Original Submitter: {content.submitter?.name} ({content.submitter?.role})</span>
          </div>
        </div>

        {/* Version Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-[10px] text-slate-400 font-semibold px-2 uppercase tracking-wider">
            History:
          </span>
          {versions.map((ver: any, idx: number) => (
            <button
              key={ver.id}
              onClick={() => {
                setSelectedVersionIndex(idx);
                setEditedText(ver.textContent);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedVersionIndex === idx
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
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
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span dangerouslySetInnerHTML={{ __html: statusMessage.text }} />
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Content Editor & Diff View (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Editor Header Bar */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <FileEdit className="w-4 h-4 text-indigo-600" />
              <span>Draft Content Editor (v{activeVersion.versionNumber})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDiff(!showDiff)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  showDiff
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>{showDiff ? "Hide Diff" : "Compare v1 Diff"}</span>
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="p-5 flex-1 space-y-4">
            {showDiff ? (
              renderSimpleDiff(versions[versions.length - 1]?.textContent || editedText, editedText)
            ) : (
              <div>
                <textarea
                  rows={8}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-3.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-indigo-500 bg-slate-50/30 focus:bg-white leading-relaxed resize-y"
                  placeholder="Marketing copy..."
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span>Tip: Apply suggested corrections from the findings cards on the right.</span>
                  <span>{editedText.length} characters</span>
                </div>
              </div>
            )}

            {/* Re-verify & Versioning Panel */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Revision Change Notes (Preserved in Audit Log)
                </label>
                <input
                  type="text"
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="e.g. Corrected protein claim to 11g/100g and added mandatory disclosure."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Re-verifying creates <strong className="text-slate-800">Version {content.currentVersionNumber + 1}</strong> without erasing prior runs.
                </span>

                <button
                  onClick={handleReRunVerification}
                  disabled={isVerifying}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                  <span>{isVerifying ? "Verifying..." : "Re-Run Verification"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Findings & Verified Evidence (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden max-h-[800px]">
          {/* Findings Header */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span>Evidence-Backed Findings</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                {findings.length}
              </span>
            </div>

            <select
              value={activeFindingFilter}
              onChange={(e) => setActiveFindingFilter(e.target.value)}
              className="text-[11px] border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-hidden"
            >
              <option value="ALL">All Types ({findings.length})</option>
              <option value="HIGH">High Severity Only</option>
              <option value="UNRESOLVED">Open / Unresolved</option>
              <option value="VERIFIED_CONTRADICTION">Contradictions</option>
              <option value="UNSUPPORTED_CLAIM">Unsupported Claims</option>
              <option value="INSUFFICIENT_EVIDENCE">Insufficient Evidence</option>
              <option value="POSSIBLE_RISK">Possible Risk</option>
              <option value="STYLE_SUGGESTION">Style Suggestion</option>
            </select>
          </div>

          {/* Findings Cards List */}
          <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
            {filteredFindings.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <div className="font-semibold text-slate-700">No Policy Violations Found</div>
                <div>This version satisfies verified brand truth specifications.</div>
              </div>
            ) : (
              filteredFindings.map((finding: any) => {
                const isSelected = selectedFindingId === finding.id;
                const isDismissed = finding.resolutionStatus === "DISMISSED";
                const isCorrected = finding.resolutionStatus === "ACCEPTED_CORRECTION";

                return (
                  <div
                    key={finding.id}
                    onClick={() => setSelectedFindingId(finding.id)}
                    className={`p-4 rounded-xl border transition-all text-xs space-y-2.5 ${
                      isCorrected
                        ? "border-emerald-200 bg-emerald-50/30 opacity-75"
                        : isDismissed
                        ? "border-slate-200 bg-slate-50/50 opacity-60 line-through"
                        : finding.severity === "HIGH"
                        ? "border-red-200 bg-red-50/20 hover:border-red-300"
                        : "border-slate-200 bg-white hover:border-indigo-300"
                    } ${isSelected ? "ring-2 ring-indigo-500 shadow-xs" : ""}`}
                  >
                    {/* Finding Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-900">
                        {getFindingIcon(finding.type)}
                        <span>{finding.type.replace(/_/g, " ")}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                            finding.severity === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : finding.severity === "MEDIUM"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {finding.severity}
                        </span>

                        {isCorrected && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                            CORRECTED
                          </span>
                        )}
                        {isDismissed && (
                          <span className="text-[9px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-sm">
                            DISMISSED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Affected Snippet */}
                    <div className="p-2 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-800 border border-slate-200/80">
                      <span className="text-[9px] text-slate-400 block font-sans font-semibold uppercase tracking-wider mb-0.5">
                        Flagged in draft:
                      </span>
                      &ldquo;{finding.affectedText}&rdquo;
                    </div>

                    {/* Explanation */}
                    <p className="text-slate-600 text-[11px] leading-relaxed">{finding.explanation}</p>

                    {/* Evidence Citation Block (Crucial Verification Feature) */}
                    {finding.sourceReferenceId && (
                      <div className="p-2.5 rounded-lg border text-[11px] space-y-1.5 bg-slate-50/80 border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-700">
                            Citing: {finding.sourceReferenceId}
                          </span>

                          {/* Non-negotiable Application-Side Citation Verification Badge */}
                          {finding.citationValid ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified Citation</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-sm">
                              <AlertCircle className="w-3 h-3" />
                              <span>
                                {finding.evidenceStatus === "EXPIRED_EVIDENCE"
                                  ? "Expired Evidence"
                                  : "Unverified Citation"}
                              </span>
                            </span>
                          )}
                        </div>

                        {finding.quotedExcerpt && (
                          <p className="font-mono text-[10px] text-slate-600 italic bg-white p-1.5 rounded-md border border-slate-100">
                            &ldquo;{finding.quotedExcerpt}&rdquo;
                          </p>
                        )}

                        {finding.citationFailureReason && (
                          <p className="text-[10px] text-red-600 font-medium">
                            Warning: {finding.citationFailureReason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Suggested Correction */}
                    {finding.suggestedCorrection && !isCorrected && !isDismissed && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>Supported Correction:</span>
                          </span>
                          {!finding.suggestedCorrectionSupported && (
                            <span className="text-[9px] text-amber-600 font-medium">Neutralize phrasing</span>
                          )}
                        </div>
                        <div className="p-2 rounded-lg bg-indigo-50/50 border border-indigo-200 text-indigo-900 font-mono text-[11px] mb-2">
                          &ldquo;{finding.suggestedCorrection}&rdquo;
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleApplyCorrection(finding)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Apply to Draft</span>
                          </button>

                          <button
                            onClick={() => {
                              setDismissingFindingId(finding.id);
                              setDismissReason("");
                            }}
                            className="text-[11px] text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
                          >
                            Dismiss with reason
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show dismissal rationale if dismissed */}
                    {isDismissed && finding.dismissReason && (
                      <div className="text-[10px] text-slate-500 bg-slate-100 p-2 rounded-md">
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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Governance Gate & Approval Sign-off
            </h3>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600">
              Active User: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})
            </span>
          </div>

          {/* RBAC Notice */}
          {currentUser.role === "AGENCY_CREATOR" || currentUser.role === "EXTERNAL_CREATOR" ? (
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              Policy Rule: Creators cannot approve their own content. Hand off to an authorized Brand Admin/Reviewer.
            </p>
          ) : currentUser.role === "AUDITOR" ? (
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Auditor role has read-only assurance permissions.
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Brand Admin authority active. Approvals require zero open high-risk findings, or explicit recorded override.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Creator Brief Generation Button (available if approved) */}
          {activeVersion.status === "APPROVED" && (
            <button
              onClick={onOpenBriefsTab}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Generate Creator Brief</span>
            </button>
          )}

          {/* Request Changes */}
          <button
            onClick={() => handleReviewDecision("CHANGES_REQUESTED", "Revisions requested via Correction Studio.")}
            disabled={currentUser.role !== "BRAND_ADMIN"}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition-colors disabled:opacity-40"
          >
            Request Changes
          </button>

          {/* Override Findings (Brand Admin only) */}
          <button
            onClick={() => setShowOverrideModal(true)}
            disabled={currentUser.role !== "BRAND_ADMIN"}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold rounded-xl border border-purple-200 transition-colors disabled:opacity-40"
          >
            Override Findings & Approve
          </button>

          {/* Approve Content */}
          <button
            onClick={() => handleReviewDecision("APPROVED", "Verified against approved brand knowledge items.")}
            disabled={
              currentUser.role !== "BRAND_ADMIN" ||
              findings.some((f: any) => f.severity === "HIGH" && f.resolutionStatus === "OPEN")
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-40"
          >
            <Check className="w-4 h-4" />
            <span>Approve for Publication</span>
          </button>
        </div>
      </div>

      {/* Dismiss Finding Reason Modal */}
      {dismissingFindingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Dismiss Compliance Finding</h3>
              <button onClick={() => setDismissingFindingId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Every finding dismissal must be accompanied by a recorded business reason and is committed to the immutable audit log.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Justification / Resolution Reason:
              </label>
              <textarea
                required
                rows={3}
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="e.g. Legal exception granted for retail packaging; or wording adjusted in preceding sentence."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDismissingFindingId(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDismissFinding}
                disabled={!dismissReason.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Findings Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Brand Reviewer Policy Override</h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              As an authorized Brand Admin/Reviewer, you may override flagged findings. You must document an explicit written rationale for why this content is approved despite open findings.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Executive Override Rationale (Required):
              </label>
              <textarea
                required
                rows={4}
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="e.g. Marketing board approved limited-run co-promotional campaign with retailer exception; claims substantiated by separate lab memo 2026-B."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewDecision("OVERRIDE", overrideNotes)}
                disabled={overrideNotes.trim().length < 5}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
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
