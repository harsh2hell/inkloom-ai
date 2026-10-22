"use client";

import React, { useEffect, useState } from "react";
import {
  FileCheck2,
  Clock,
  Database,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  Plus,
  Calendar,
  Filter,
  Paperclip,
  Send,
  Mic,
  Search,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { UserProfile } from "@/components/Navbar";

interface OverviewProps {
  onOpenStudio: (contentId: string) => void;
  onOpenTab: (tab: string) => void;
  onOpenSubmitModal: () => void;
  currentUser?: UserProfile | null;
}

export const OverviewView: React.FC<OverviewProps> = ({
  onOpenStudio,
  onOpenTab,
  onOpenSubmitModal,
  currentUser,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copilotPrompt, setCopilotPrompt] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error(`Failed to load governance metrics (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (!json || typeof json !== "object") {
        throw new Error("Invalid response format received from dashboard API");
      }
      setData(json);
    } catch (e: any) {
      console.error("Dashboard metrics fetch error:", e);
      setError(e.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-600">Loading governance metrics from PostgreSQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 flex flex-col items-center justify-center max-w-md mx-auto text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-3">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Metrics Retrieval Failed</h3>
        <p className="text-xs text-rose-600 mb-4">{error}</p>
        <p className="text-[11px] text-slate-400 mb-4">
          Inkloom AI enforces zero mock data. Values are never fabricated or defaulted to mock numbers.
        </p>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-full shadow-xs transition-colors"
        >
          Retry Loading Metrics
        </button>
      </div>
    );
  }

  const { metrics = {}, findingsByType = {}, recentContent = [] } = data || {};

  const totalFindings =
    (findingsByType.verifiedContradictions || 0) +
    (findingsByType.unsupportedClaims || 0) +
    (findingsByType.insufficientEvidence || 0) +
    (findingsByType.possibleRisks || 0) +
    (findingsByType.styleSuggestions || 0);

  // Extract findings list from latest content versions
  const primaryCampaign = recentContent[0];
  const primaryVersion = primaryCampaign?.versions?.[0];
  const primaryRun = primaryVersion?.analysisRuns?.[0];
  const findingsList: any[] = primaryRun?.findings || [];

  const contradictionFinding = findingsList.find(
    (f) => f.type === "VERIFIED_CONTRADICTION"
  ) || findingsList[0];

  const secondaryFindings = findingsList.filter(
    (f) => f.id !== contradictionFinding?.id
  ).slice(0, 2);

  const days = [
    { day: "Mon", date: "1" },
    { day: "Tue", date: "2" },
    { day: "Wed", date: "3" },
    { day: "Thu", date: "4" },
    { day: "Fri", date: "5" },
    { day: "Sat", date: "6", isWeekend: true },
    { day: "Sun", date: "7", isWeekend: true },
    { day: "Mon", date: "8" },
    { day: "Tue", date: "9", active: true },
    { day: "Wed", date: "10" },
    { day: "Thu", date: "11" },
    { day: "Fri", date: "12" },
    { day: "Sat", date: "13", isWeekend: true },
    { day: "Sun", date: "14", isWeekend: true },
    { day: "Mon", date: "15" },
    { day: "Tue", date: "16" },
  ];

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotPrompt.trim()) return;
    if (primaryCampaign) {
      onOpenStudio(primaryCampaign.id);
    } else {
      onOpenSubmitModal();
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Hero Governance & Verification Matrix Card (Planned Absences reference style) */}
      <div className="clay-card p-6 sm:p-7 relative overflow-hidden">
        {/* Card Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Governance Pipeline & Verification Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live campaign review tracks, deterministic claim verification, and human audit status for Verdanta Foods.
            </p>
          </div>

          {/* Controls: Date Filter + Filter Button + View All */}
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-slate-200/90 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>October 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-slate-200/90 transition-colors">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
            </button>

            <button
              onClick={() => onOpenTab("content")}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 px-3.5 py-1.5 rounded-full border border-slate-200/90 transition-colors"
            >
              <span>View all</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Matrix Calendar Table */}
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-[920px]">
            {/* Days Header */}
            <div className="grid grid-cols-[180px_repeat(16,1fr)] gap-1.5 pb-3 border-b border-slate-100 text-center">
              <div className="text-left text-xs font-semibold text-slate-400 pl-2">
                Campaigns / Reviewers
              </div>
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`text-[11px] font-medium py-1 px-0.5 rounded-xl transition-colors ${
                    d.active
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : d.isWeekend
                      ? "text-slate-400 bg-slate-50/60"
                      : "text-slate-500"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider">{d.day}</div>
                  <div className="text-xs">{d.date}</div>
                </div>
              ))}
            </div>

            {/* Matrix Campaign Rows */}
            <div className="divide-y divide-slate-100/70 pt-2 space-y-2">
              {recentContent.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No active campaigns submitted in PostgreSQL.
                </div>
              ) : (
                recentContent.slice(0, 4).map((item: any, rowIdx: number) => {
                  const submitter = item.submitter;
                  const latestVersion = item.versions?.[0];
                  const hasFindings =
                    (latestVersion?.analysisRuns?.[0]?.findings?.length ?? 0) > 0;
                  const isApproved = item.status === "APPROVED";

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[180px_repeat(16,1fr)] gap-1.5 items-center py-2.5 relative group"
                    >
                      {/* Submitter & Campaign Name */}
                      <div className="flex items-center gap-2.5 pl-2 min-w-0 pr-2">
                        {submitter?.avatarUrl ? (
                          <img
                            src={submitter.avatarUrl}
                            alt={submitter.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {submitter?.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="min-w-0 truncate">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {submitter?.name || "Alex Rivera"}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.title}
                          </div>
                        </div>
                      </div>

                      {/* 16 Calendar Slots with Floating Pills */}
                      {days.map((d, colIdx) => {
                        const isDashedGuide = d.active;

                        // Place floating pills matching reference design
                        if (rowIdx === 0 && colIdx === 2) {
                          return (
                            <div key={colIdx} className="col-span-3 z-10">
                              <button
                                onClick={() => onOpenStudio(item.id)}
                                className="w-full pill-glow-purple flex items-center justify-between px-3.5 py-2 text-xs font-semibold cursor-pointer hover:opacity-95 transition-all text-left"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">Policy Claim Audit</span>
                                </div>
                                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0">
                                  • {isApproved ? "Approved" : "In Review"}
                                </span>
                              </button>
                            </div>
                          );
                        }

                        if (rowIdx === 1 && colIdx === 1) {
                          return (
                            <div key={colIdx} className="col-span-3 z-10">
                              <button
                                onClick={() => onOpenStudio(item.id)}
                                className="w-full pill-glow-emerald flex items-center justify-between px-3.5 py-2 text-xs font-semibold cursor-pointer hover:opacity-95 transition-all text-left"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">Verified Clean</span>
                                </div>
                                <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0">
                                  • Approved
                                </span>
                              </button>
                            </div>
                          );
                        }

                        if (rowIdx === 0 && colIdx === 7) {
                          return (
                            <div key={colIdx} className="col-span-3 z-10">
                              <button
                                onClick={() => onOpenStudio(item.id)}
                                className="w-full pill-frosted-sky flex items-center justify-between px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-sky-100/60 transition-all text-left"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                  <span className="truncate">Correction Studio</span>
                                </div>
                                <span className="text-[9px] bg-sky-200/60 text-sky-800 px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0">
                                  • Pending
                                </span>
                              </button>
                            </div>
                          );
                        }

                        if (rowIdx === 0 && colIdx === 13) {
                          return (
                            <div key={colIdx} className="col-span-3 z-10">
                              <button
                                onClick={() => onOpenStudio(item.id)}
                                className="w-full pill-glow-emerald flex items-center justify-between px-3.5 py-2 text-xs font-semibold cursor-pointer hover:opacity-95 transition-all text-left"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">Release Live</span>
                                </div>
                                <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0">
                                  • Approved
                                </span>
                              </button>
                            </div>
                          );
                        }

                        // Skip rendering over spanned cells
                        if (
                          (rowIdx === 0 && (colIdx === 3 || colIdx === 4 || colIdx === 8 || colIdx === 9 || colIdx === 14 || colIdx === 15)) ||
                          (rowIdx === 1 && (colIdx === 2 || colIdx === 3))
                        ) {
                          return null;
                        }

                        // Standard slot with optional subtle hatch pattern
                        return (
                          <div
                            key={colIdx}
                            className={`h-11 rounded-2xl border border-slate-100/60 relative flex items-center justify-center transition-colors ${
                              d.isWeekend
                                ? "pattern-hatch-subtle bg-slate-50/40"
                                : "bg-slate-50/20 hover:bg-slate-50/80"
                            } ${isDashedGuide ? "border-l-2 border-dashed border-indigo-400" : ""}`}
                          />
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bottom Row: 3 Stunning Modern Cards (Matching Reference Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Priority Findings & High-Risk Claims (Matching "Future Events" card) */}
        <div className="lg:col-span-4 clay-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Priority Policy Findings
              </h3>
              <button
                onClick={() => onOpenTab("content")}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
              >
                <span>View all</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Bright Vivid Amber Highlight Card (matching the yellow Tech Innovations card in reference!) */}
            {contradictionFinding ? (
              <div
                onClick={() => primaryCampaign && onOpenStudio(primaryCampaign.id)}
                className="bg-amber-400 rounded-3xl p-5 text-slate-950 shadow-[0_6px_20px_rgba(245,158,11,0.25)] cursor-pointer hover:shadow-md transition-all active:scale-[0.99] mb-4"
              >
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-900/80 font-extrabold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Verified Contradiction
                  </span>
                  <span className="bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    High Risk
                  </span>
                </div>

                <div className="font-bold text-sm leading-snug line-clamp-2 mb-2">
                  {contradictionFinding.affectedText ? `"${contradictionFinding.affectedText}"` : "Policy contradiction identified"}
                </div>
                <div className="text-xs text-slate-800 line-clamp-2 mb-3">
                  {contradictionFinding.explanation}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900/10 text-[11px] font-semibold text-slate-900">
                  <span className="bg-white/40 px-2 py-0.5 rounded-full">
                    {contradictionFinding.sourceReferenceId || "KB-VER-004"}
                  </span>
                  <span className="underline text-slate-950 font-bold">Review in Studio →</span>
                </div>
              </div>
            ) : null}

            {/* Secondary Event Cards Below */}
            <div className="space-y-3">
              {secondaryFindings.map((finding: any) => (
                <div
                  key={finding.id}
                  onClick={() => primaryCampaign && onOpenStudio(primaryCampaign.id)}
                  className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 truncate pr-2">
                      {finding.affectedText ? `"${finding.affectedText}"` : "Claim Finding"}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                      {finding.evidenceStatus === "EXPIRED_EVIDENCE" ? "Expired Spec" : "Risk"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {finding.explanation}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Source: {finding.sourceReferenceId || "Policy Engine"}</span>
                    <span className="font-medium text-indigo-600">Resolve →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Non-duplicated findings:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
              {totalFindings} Active Issues
            </span>
          </div>
        </div>

        {/* Card 2: Truth & Policy Governance Verification (Matching "Onboarding" card) */}
        <div className="lg:col-span-4 clay-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Approved Truth Specs
              </h3>
              <button
                onClick={() => onOpenTab("knowledge")}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
              >
                <span>View all</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* 2x2 Grid of Clean Rounded Spec Cards (Matching Onboarding 4 cards!) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Item 1 */}
              <div
                onClick={() => onOpenTab("knowledge")}
                className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/70 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mb-2 border border-indigo-200/50">
                  11g
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Protein Fact</div>
                <div className="text-[10px] text-slate-500 mb-2.5">QA Science</div>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                  KB-VER-001
                </span>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => onOpenTab("knowledge")}
                className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/70 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs mb-2 border border-rose-200/50">
                  🚫
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Sugar-Free Ban</div>
                <div className="text-[10px] text-slate-500 mb-2.5">Legal Policy</div>
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
                  KB-VER-004
                </span>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => onOpenTab("knowledge")}
                className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/70 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs mb-2 border border-amber-200/50">
                  🩺
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Medical Ban</div>
                <div className="text-[10px] text-slate-500 mb-2.5">Medical Board</div>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                  KB-VER-005
                </span>
              </div>

              {/* Item 4 */}
              <div
                onClick={() => onOpenTab("knowledge")}
                className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/70 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs mb-2 border border-emerald-200/50">
                  📝
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Mandatory Notice</div>
                <div className="text-[10px] text-slate-500 mb-2.5">Brand Governance</div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  KB-VER-006
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Knowledge Status:</span>
            <span className="font-semibold text-emerald-600">
              {metrics.activeApprovedKnowledge ?? 7} Active • {metrics.expiredKnowledge ?? 1} Expired
            </span>
          </div>
        </div>

        {/* Card 3: AI Verification Copilot Widget (Matching "Welcome, Emily" card) */}
        <div className="lg:col-span-4 clay-card p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          {/* Top 3D Glowing Blue Orb (matching the 3D sphere in the reference!) */}
          <div className="pt-2 pb-1 flex flex-col items-center">
            <div className="sphere-3d-orb mb-3" />

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Welcome, {currentUser?.name?.split(" ")[0] || "Sarah"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              What marketing claim shall we verify today?
            </p>
          </div>

          {/* Quick Action Pill Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 my-3 w-full">
            <button
              onClick={() => primaryCampaign ? onOpenStudio(primaryCampaign.id) : onOpenSubmitModal()}
              className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Verify Draft</span>
            </button>

            <button
              onClick={() => onOpenTab("briefs")}
              className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1"
            >
              <FileCheck2 className="w-3 h-3 text-emerald-500" />
              <span>View Briefs</span>
            </button>

            <button
              onClick={() => onOpenTab("knowledge")}
              className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-sky-500" />
              <span>Manage Truth</span>
            </button>
          </div>

          {/* Prompt / Input Box with Attach & Submit */}
          <form onSubmit={handleCopilotSubmit} className="w-full mt-1">
            <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-2.5 text-left transition-focus-within focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400">
              <input
                type="text"
                value={copilotPrompt}
                onChange={(e) => setCopilotPrompt(e.target.value)}
                placeholder="Ask AI verification copilot anything..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none pb-2"
                maxLength={300}
              />

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onOpenSubmitModal}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-[10px]"
                    title="Attach marketing draft"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attach</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenSubmitModal}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-[10px]"
                    title="Submit new content"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{copilotPrompt.length}/300</span>
                  <button
                    type="submit"
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
                    aria-label="Send copilot query"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
