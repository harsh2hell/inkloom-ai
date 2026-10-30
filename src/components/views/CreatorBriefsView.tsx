"use client";

import React, { useEffect, useState } from "react";
import {
  FileCheck,
  Send,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  User,
  ShieldCheck,
  Clock,
  ArrowRight,
  Plus,
  X,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { UserProfile } from "../Navbar";

interface CreatorBriefsProps {
  currentUser: UserProfile;
}

export const CreatorBriefsView: React.FC<CreatorBriefsProps> = ({ currentUser }) => {
  const [briefs, setBriefs] = useState<any[]>([]);
  const [approvedVersions, setApprovedVersions] = useState<any[]>([]);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [briefsError, setBriefsError] = useState<string | null>(null);

  // External Creator Adaptation Form State
  const [creatorCaption, setCreatorCaption] = useState("");
  const [creatorTitle, setCreatorTitle] = useState("TikTok Video Caption Adaptation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Generate Brief Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [modalCreatorHandle, setModalCreatorHandle] = useState("@verdanta_creator");
  const [modalCreatorPlatform, setModalCreatorPlatform] = useState("INSTAGRAM");
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [clearingSubmissionId, setClearingSubmissionId] = useState<string | null>(null);

  const parseBriefItems = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleClearance = async (submissionId: string, decision: "CLEARED" | "CHANGES_REQUESTED") => {
    if (!selectedBriefId) return;
    setClearingSubmissionId(submissionId);
    try {
      const res = await fetch(`/api/briefs/${selectedBriefId}/submissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          reviewerId: currentUser.id,
          decision,
          notes:
            decision === "CLEARED"
              ? "Final publication clearance confirmed by authorized brand reviewer."
              : "Revisions requested by brand reviewer prior to release.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm clearance");
      await fetchBriefs();
      if (lastSubmissionResult?.submission?.id === submissionId) {
        setLastSubmissionResult((prev: any) => ({
          ...prev,
          submission: data.submission,
        }));
      }
    } catch (err: any) {
      alert(err.message || "Clearance update failed");
    } finally {
      setClearingSubmissionId(null);
    }
  };

  const fetchBriefs = async () => {
    try {
      setLoading(true);
      setBriefsError(null);
      const res = await fetch("/api/briefs");
      if (!res.ok) {
        throw new Error(`Failed to load creator briefs (HTTP ${res.status})`);
      }
      const json = await res.json();
      setBriefs(json || []);
      if (json && json.length > 0 && !selectedBriefId) {
        setSelectedBriefId(json[0].id);
      }
    } catch (e: any) {
      console.error("Fetch briefs error:", e);
      setBriefsError(e.message || "Failed to load creator briefs");
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedContent = async () => {
    try {
      const res = await fetch("/api/content");
      if (!res.ok) return;
      const json = await res.json();
      const approved: any[] = [];
      json.forEach((item: any) => {
        item.versions?.forEach((ver: any) => {
          if (ver.status === "APPROVED") {
            approved.push({
              versionId: ver.id,
              contentId: item.id,
              title: `${item.title} (v${ver.versionNumber})`,
              campaignName: item.campaignName,
            });
          }
        });
      });
      setApprovedVersions(approved);
      if (approved.length > 0 && !selectedVersionId) {
        setSelectedVersionId(approved[0].versionId);
      }
    } catch (e) {
      console.error("Fetch approved content error:", e);
    }
  };

  useEffect(() => {
    fetchBriefs();
    fetchApprovedContent();
  }, []);

  const handleGenerateBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVersionId) return;
    setGenerateError(null);

    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvedContentVersionId: selectedVersionId,
          creatorHandle: modalCreatorHandle,
          creatorPlatform: modalCreatorPlatform,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate brief from approved copy.");
      }
      setShowGenerateModal(false);
      await fetchBriefs();
      if (data.brief?.id) {
        setSelectedBriefId(data.brief.id);
      }
    } catch (e: any) {
      console.error("Generate brief error:", e);
      setGenerateError(e.message || "Failed to generate brief");
    }
  };

  const handleCreatorCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBriefId || !creatorCaption.trim()) return;

    setIsSubmitting(true);
    setLastSubmissionResult(null);
    setSubmissionError(null);

    try {
      const res = await fetch(`/api/briefs/${selectedBriefId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: currentUser.id,
          title: creatorTitle,
          caption: creatorCaption,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify caption drift.");
      }
      setLastSubmissionResult(data);
    } catch (e: any) {
      console.error("Creator check error:", e);
      setSubmissionError(e.message || "Failed to verify caption drift");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBrief = briefs.find((b) => b.id === selectedBriefId) || briefs[0];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Creator Governance & Adaptation Briefs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Derive structured creator briefs directly from approved marketing copy and verify social adaptations against claim drift.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Derive New Brief from Approved Copy</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading Creator Briefs...</div>
      ) : briefsError ? (
        <div className="py-16 text-center text-xs saas-card max-w-md mx-auto p-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Failed to Retrieve Creator Briefs</h3>
          <p className="text-xs text-rose-600">{briefsError}</p>
          <button
            onClick={fetchBriefs}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
          >
            Retry
          </button>
        </div>
      ) : briefs.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 saas-card">
          No creator briefs generated yet. Approve a marketing draft in the Correction Studio to derive a brief.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Brief Selection List (4 Cols) */}
          <div className="lg:col-span-4 clay-card p-5 space-y-3">
            <div className="px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Available Briefs ({briefs.length})
            </div>
            <div className="space-y-1.5">
              {briefs.map((brief) => {
                const isSelected = brief.id === selectedBrief?.id;
                return (
                  <button
                    key={brief.id}
                    onClick={() => {
                      setSelectedBriefId(brief.id);
                      setLastSubmissionResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-indigo-50/60 border-indigo-200 shadow-2xs"
                        : "bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-mono">{brief.id}</span>
                      <span>{new Date(brief.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{brief.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Target: {brief.creatorPlatform} • {brief.creatorHandle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Brief Document & Live Drift Check (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            {selectedBrief && (
              <>
                {/* Brief Document Container */}
                <div className="clay-card p-6 sm:p-7 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                          APPROVED BRIEF
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{selectedBrief.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        Target Influencer: <strong className="text-slate-700">{selectedBrief.creatorHandle}</strong> ({selectedBrief.creatorPlatform})
                      </p>
                    </div>

                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
                      ✓ Single Source of Truth Grounded
                    </span>
                  </div>

                  {/* Objective & Key Message */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-800 block mb-1">Core Campaign Objective:</span>
                    <p className="text-slate-600 leading-relaxed">{selectedBrief.keyMessage}</p>
                  </div>

                  {/* Document Grid: Permitted, Prohibited, Mandatory, Facts, Assets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {/* Permitted Claims */}
                    <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Permitted Claims
                      </span>
                      <ul className="space-y-1 text-slate-700 text-[11px]">
                        {parseBriefItems(selectedBrief.permittedClaims).map((item: any, i: number) => {
                          const text = typeof item === "string" ? item : item.claim || item.text || JSON.stringify(item);
                          return (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>{text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Prohibited Claims */}
                    <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-200">
                      <span className="font-bold text-rose-800 flex items-center gap-1.5 mb-2 text-xs">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                        Strictly Prohibited Claims
                      </span>
                      <ul className="space-y-1 text-slate-700 text-[11px]">
                        {parseBriefItems(selectedBrief.prohibitedClaims).map((item: any, i: number) => {
                          const text = typeof item === "string" ? item : item.claim || item.rule || JSON.stringify(item);
                          return (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-500 mt-0.5">•</span>
                              <span>{text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Mandatory Disclosures */}
                    <div className="p-3 rounded-lg bg-purple-50/40 border border-purple-200">
                      <span className="font-bold text-purple-800 flex items-center gap-1.5 mb-2 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        Mandatory Disclosures
                      </span>
                      <ul className="space-y-1 text-slate-700 text-[11px]">
                        {parseBriefItems(selectedBrief.mandatoryDisclosures).map((item: any, i: number) => {
                          const text = typeof item === "string" ? item : item.disclosure || item.text || JSON.stringify(item);
                          return (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-purple-500 mt-0.5">•</span>
                              <span>{text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Approved Technical Facts */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-2 text-xs">
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        Approved Product Facts
                      </span>
                      <ul className="space-y-1 text-slate-700 text-[11px]">
                        {parseBriefItems(selectedBrief.approvedFacts).map((item: any, i: number) => {
                          const text = typeof item === "string" ? item : item.fact ? `${item.fact}: ${item.detail || ''}` : JSON.stringify(item);
                          return (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-slate-400 mt-0.5">•</span>
                              <span>{text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Approved Brand Assets (Round 3) */}
                    <div className="p-3 rounded-lg bg-indigo-50/40 border border-indigo-200 md:col-span-2">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5 mb-2 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Approved Brand Assets & Palette (KB-VER-010)
                      </span>
                      <div className="space-y-1.5 text-[11px] text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">Logo Specification:</span>
                          <span>Verdanta Leaf Icon & Wordmark in #2D5A27 on light backgrounds</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-900">Brand Color Swatches:</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-[#2D5A27] inline-block border border-slate-300"></span>
                            <span>#2D5A27 (Forest)</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-[#E05638] inline-block border border-slate-300"></span>
                            <span>#E05638 (Terracotta)</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-[#F4F5F8] inline-block border border-slate-300"></span>
                            <span>#F4F5F8 (Canvas)</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>Required alt-text on social visual assets:</span>
                          <em className="text-indigo-800">&quot;Verdanta Foods organic leaf brand mark&quot;</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Creator Final Adaptation Drift Check */}
                <div className="clay-card p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Closed-Loop Adaptation Drift Checker
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Creators paste their adapted social media copy before publishing to verify alignment with brief rules
                      </p>
                    </div>

                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Policy Rule 13
                    </span>
                  </div>

                  <form onSubmit={handleCreatorCheck} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Adapted Creator Caption Draft:
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={creatorCaption}
                        onChange={(e) => setCreatorCaption(e.target.value)}
                        placeholder="e.g., Loving this new Verdanta bar! Totally sugar-free and will cure low blood sugar instantly!"
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-slate-500">
                        Submitting as: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !creatorCaption.trim()}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? "Checking Drift..." : "Run Adaptation Drift Check"}</span>
                      </button>
                    </div>
                  </form>

                  {submissionError && (
                    <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{submissionError}</span>
                    </div>
                  )}

                  {/* Drift Check Result */}
                  {lastSubmissionResult && (
                    <div
                      className={`p-4 rounded-lg border text-xs space-y-2.5 animate-in fade-in duration-150 ${
                        lastSubmissionResult.driftResult.isCompliant
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                          : "bg-rose-50/50 border-rose-200 text-rose-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {lastSubmissionResult.driftResult.isCompliant ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertOctagon className="w-4 h-4 text-rose-600" />
                          )}
                          <span className="font-bold text-sm">
                            {lastSubmissionResult.driftResult.isCompliant
                              ? "Compliant Adaptation (Approved)"
                              : "Adaptation Drift Detected (Changes Requested)"}
                          </span>
                        </div>

                        <span className="font-bold text-sm">
                          Alignment Score: {lastSubmissionResult.driftResult.driftScore}/100
                        </span>
                      </div>

                      {/* Drift Issues Breakdown */}
                      {!lastSubmissionResult.driftResult.isCompliant && (
                        <div className="space-y-1.5 pt-1 text-slate-700">
                          {lastSubmissionResult.driftResult.prohibitedClaimsDetected?.length > 0 && (
                            <div className="p-2 bg-white/80 rounded border border-rose-100 text-[11px]">
                              <strong className="text-rose-700">Prohibited Wording Found: </strong>
                              {lastSubmissionResult.driftResult.prohibitedClaimsDetected.join(", ")}
                            </div>
                          )}

                          {lastSubmissionResult.driftResult.missingDisclosuresDetected?.length > 0 && (
                            <div className="p-2 bg-white/80 rounded border border-rose-100 text-[11px]">
                              <strong className="text-rose-700">Missing Mandatory Disclosure: </strong>
                              {lastSubmissionResult.driftResult.missingDisclosuresDetected.join("; ")}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Named Human Clearance Action (Round 3 Improvement 2) */}
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Named Human Publication Clearance Gate</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {lastSubmissionResult.submission?.clearanceStatus === "CLEARED" ? (
                              <span className="text-emerald-700 font-semibold">
                                ✓ Publication cleared by {lastSubmissionResult.submission.clearedByName || "Brand Admin"}
                                {lastSubmissionResult.submission.clearedAt && ` on ${new Date(lastSubmissionResult.submission.clearedAt).toLocaleDateString()}`}
                              </span>
                            ) : (
                              <span>Awaiting authorized human confirmation before social media publishing.</span>
                            )}
                          </p>
                        </div>

                        {(currentUser.role === "BRAND_ADMIN" || currentUser.role === "BRAND_OWNER") ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={clearingSubmissionId === lastSubmissionResult.submission?.id}
                              onClick={() => handleClearance(lastSubmissionResult.submission?.id, "CHANGES_REQUESTED")}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Request Changes
                            </button>
                            <button
                              type="button"
                              disabled={clearingSubmissionId === lastSubmissionResult.submission?.id}
                              onClick={() => handleClearance(lastSubmissionResult.submission?.id, "CLEARED")}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                            >
                              {clearingSubmissionId === lastSubmissionResult.submission?.id ? "Confirming..." : "Confirm Publication Clearance"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                            Clearance sign-off reserved for Brand Reviewers
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submission Clearance Log on this brief */}
                  {selectedBrief.creatorSubmissions?.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Creator Submission & Clearance Log ({selectedBrief.creatorSubmissions.length})
                      </div>
                      <div className="space-y-2">
                        {selectedBrief.creatorSubmissions.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-900">{sub.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  by {sub.creator?.name || "Creator"} • {new Date(sub.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 font-mono italic truncate max-w-md">
                                &quot;{sub.caption}&quot;
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  sub.clearanceStatus === "CLEARED" || sub.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {sub.clearanceStatus === "CLEARED" || sub.status === "APPROVED"
                                  ? `Cleared (${sub.clearedByName || "Reviewer"})`
                                  : "Pending Clearance"}
                              </span>

                              {(currentUser.role === "BRAND_ADMIN" || currentUser.role === "BRAND_OWNER") &&
                                sub.clearanceStatus !== "CLEARED" &&
                                sub.status !== "APPROVED" && (
                                  <button
                                    onClick={() => handleClearance(sub.id, "CLEARED")}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow-2xs"
                                  >
                                    Clear
                                  </button>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Generate Brief Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Derive Creator Brief</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {generateError && (
              <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{generateError}</span>
              </div>
            )}

            <p className="text-slate-600 leading-relaxed">
              Creator briefs can only be derived from approved marketing versions. Select an approved version below:
            </p>

            <form onSubmit={handleGenerateBrief} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approved Content Version</label>
                {approvedVersions.length === 0 ? (
                  <p className="text-rose-600 text-[11px]">
                    No approved content versions exist yet. Please approve a draft in Correction Studio first.
                  </p>
                ) : (
                  <select
                    value={selectedVersionId}
                    onChange={(e) => setSelectedVersionId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {approvedVersions.map((v) => (
                      <option key={v.versionId} value={v.versionId}>
                        {v.title} ({v.campaignName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Handle</label>
                  <input
                    type="text"
                    required
                    value={modalCreatorHandle}
                    onChange={(e) => setModalCreatorHandle(e.target.value)}
                    placeholder="@creator_handle"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Platform</label>
                  <select
                    value={modalCreatorPlatform}
                    onChange={(e) => setModalCreatorPlatform(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="LINKEDIN">LinkedIn</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approvedVersions.length === 0}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs disabled:opacity-50"
                >
                  Generate Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
