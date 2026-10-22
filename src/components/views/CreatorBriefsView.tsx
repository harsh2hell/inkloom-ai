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

  // External Creator Adaptation Form State
  const [creatorCaption, setCreatorCaption] = useState("");
  const [creatorTitle, setCreatorTitle] = useState("TikTok Video Caption Adaptation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<any>(null);

  // Generate Brief Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");

  const fetchBriefs = async () => {
    try {
      const res = await fetch("/api/briefs");
      const json = await res.json();
      setBriefs(json || []);
      if (json && json.length > 0 && !selectedBriefId) {
        setSelectedBriefId(json[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedContent = async () => {
    try {
      const res = await fetch("/api/content");
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
      if (approved.length > 0) {
        setSelectedVersionId(approved[0].versionId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBriefs();
    fetchApprovedContent();
  }, []);

  const handleGenerateBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVersionId) return;

    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentVersionId: selectedVersionId,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
        }),
      });

      if (res.ok) {
        setShowGenerateModal(false);
        await fetchBriefs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitAdaptation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBriefId || !creatorCaption.trim()) return;

    setIsSubmitting(true);
    setLastSubmissionResult(null);

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
      if (!res.ok) throw new Error(data.error || "Submission failed.");

      setLastSubmissionResult(data);
      setCreatorCaption("");
      await fetchBriefs();
    } catch (err: any) {
      alert(err.message || "Error submitting adaptation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBrief = briefs.find((b) => b.id === selectedBriefId) || briefs[0];

  const permittedList = selectedBrief ? JSON.parse(selectedBrief.permittedClaims || "[]") : [];
  const prohibitedList = selectedBrief ? JSON.parse(selectedBrief.prohibitedClaims || "[]") : [];
  const disclosureList = selectedBrief ? JSON.parse(selectedBrief.mandatoryDisclosures || "[]") : [];
  const factsList = selectedBrief ? JSON.parse(selectedBrief.approvedFacts || "[]") : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Creator Briefs & Final Verification Loop</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              Closed Loop Governance
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Generate formal creator briefs from approved content versions. External creators adapt content and submit final captions, automatically verified for adaptation drift prior to publication sign-off.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          disabled={approvedVersions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Brief from Approved Content</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading Creator Briefs...</div>
      ) : briefs.length === 0 ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-3">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="font-semibold text-slate-700">No Creator Briefs Generated Yet</div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Once a content version is approved by a Brand Admin in the Correction Studio, you can generate an official Creator Brief here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Brief Selection & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Brief Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {briefs.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBriefId(b.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition-all border shrink-0 ${
                    selectedBriefId === b.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="truncate max-w-xs">{b.title}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{b.versionReference}</div>
                </button>
              ))}
            </div>

            {selectedBrief && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-mono">
                    OFFICIAL CREATOR BRIEF
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedBrief.title}</h2>
                  <p className="text-xs text-slate-500">{selectedBrief.versionReference}</p>
                </div>

                {/* Permitted Claims */}
                <div>
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Permitted Claims (Approved for Use)</span>
                  </h3>
                  <div className="space-y-1.5">
                    {permittedList.map((item: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 font-medium">
                        &bull; &ldquo;{item.claim}&rdquo; — <span className="text-[11px] text-emerald-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prohibited Claims */}
                <div>
                  <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                    <span>Prohibited Claims (Strictly Banned)</span>
                  </h3>
                  <div className="space-y-1.5">
                    {prohibitedList.map((item: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-red-50/60 border border-red-200 text-xs text-red-950 font-medium">
                        &times; &ldquo;{item.claim}&rdquo; — <span className="text-[11px] text-red-700">{item.rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mandatory Disclosures */}
                <div>
                  <h3 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Mandatory Brand Disclosures (Must Include)</span>
                  </h3>
                  <div className="space-y-1.5">
                    {disclosureList.map((item: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-200 text-xs text-purple-950 font-mono">
                        &ldquo;{item.disclosure}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approved Facts */}
                <div>
                  <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">
                    Verified Product Facts
                  </h3>
                  <div className="space-y-1.5">
                    {factsList.map((item: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <strong>{item.fact}:</strong> {item.detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: External Creator Portal & Adaptation Drift Check (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                  EXTERNAL CREATOR PORTAL
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Submit Final Creator Content</h3>
                <p className="text-xs text-slate-500">
                  Submitting as: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
                </p>
              </div>

              {/* Creator Policy Reminder */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Policy Enforcement:</strong> External creators cannot approve their own adaptations. Your draft will be automatically evaluated for adaptation drift against the brief.
                </p>
              </div>

              {/* Quick Presets for Judge Evaluation */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Try Sample Creator Adaptations:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatorCaption(
                        "Morning workout complete! Loving the Verdanta Plant Crunch bar—it's an approved source of protein (11 g/100g) with 6 g cane sugar for real crunch. Contains added sugar. This product is not a substitute for a balanced diet."
                      );
                    }}
                    className="p-2 text-left rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs transition-colors"
                  >
                    <div className="font-semibold text-[11px]">Compliant Adaptation</div>
                    <div className="text-[10px] text-emerald-600">Preserves rules & disclosure</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatorCaption(
                        "Morning fuel with Verdanta Plant Crunch! It's completely sugar-free and diabetes-friendly! Grab yours today."
                      );
                    }}
                    className="p-2 text-left rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-900 text-xs transition-colors"
                  >
                    <div className="font-semibold text-[11px]">Drift Violation Sample</div>
                    <div className="text-[10px] text-red-600">Re-introduces sugar-free</div>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitAdaptation} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Asset Title</label>
                  <input
                    type="text"
                    required
                    value={creatorTitle}
                    onChange={(e) => setCreatorTitle(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Adapted Caption / Script</label>
                  <textarea
                    rows={5}
                    required
                    value={creatorCaption}
                    onChange={(e) => setCreatorCaption(e.target.value)}
                    placeholder="Write or paste your adapted marketing caption..."
                    className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !creatorCaption.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Evaluating Drift..." : "Submit for Verification & Sign-off"}</span>
                </button>
              </form>

              {/* Adaptation Drift Result Card */}
              {lastSubmissionResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                    lastSubmissionResult.driftResult?.isCompliant
                      ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                      : "border-red-200 bg-red-50/70 text-red-900"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {lastSubmissionResult.driftResult?.isCompliant
                        ? "Alignment Verified (100% Score)"
                        : "Adaptation Drift Flagged"}
                    </span>
                    <span className="font-mono text-xs">
                      Drift Score: {lastSubmissionResult.driftResult?.driftScore}/100
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    {lastSubmissionResult.driftResult?.driftSummary}
                  </p>

                  {lastSubmissionResult.driftResult?.prohibitedClaimsDetected?.length > 0 && (
                    <div className="text-[10px] text-red-700 font-semibold">
                      Violation: {lastSubmissionResult.driftResult.prohibitedClaimsDetected.join(", ")}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    Submission logged as ID: {lastSubmissionResult.submission?.id}. Awaiting brand reviewer approval.
                  </div>
                </div>
              )}
            </div>

            {/* Past Submissions for this Brief */}
            {selectedBrief?.creatorSubmissions?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900">
                  Past Creator Submissions ({selectedBrief.creatorSubmissions.length})
                </h4>
                <div className="space-y-2">
                  {selectedBrief.creatorSubmissions.map((sub: any) => {
                    const drift = sub.adaptationDriftFlags ? JSON.parse(sub.adaptationDriftFlags) : null;
                    return (
                      <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{sub.creator?.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                              sub.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : sub.status === "CHANGES_REQUESTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono italic">&ldquo;{sub.caption}&rdquo;</p>
                        {drift && (
                          <div className="text-[10px] text-slate-500">
                            Drift Score: {drift.driftScore}/100 • {drift.isCompliant ? "Compliant" : "Drift Flagged"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate Brief Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Generate Creator Brief from Approved Version</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select an approved content version. The brief will extract permitted claims, prohibited claims, mandatory disclosures, and verified facts.
            </p>

            <form onSubmit={handleGenerateBrief} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Approved Source Content</label>
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                >
                  {approvedVersions.map((v) => (
                    <option key={v.versionId} value={v.versionId}>
                      {v.campaignName} — {v.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700"
                >
                  Create Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
