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
  Mic,
  Search,
  Lock,
  ChevronDown,
  Edit2,
  Share2,
  X,
  TrendingUp,
  BarChart2,
  Sun,
  ShieldAlert,
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
  const [copilotInput, setCopilotInput] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(4);
  const [activeBrandMode, setActiveBrandMode] = useState<"verified" | "audit">("verified");

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = currentUser
        ? `/api/dashboard?userId=${currentUser.id}&role=${currentUser.role}`
        : "/api/dashboard";
      const res = await fetch(url);
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
  }, [currentUser?.id]);

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-[#e05638] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-600">Loading governance metrics from PostgreSQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 flex flex-col items-center justify-center max-w-md mx-auto text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-3">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Metrics Retrieval Failed</h3>
        <p className="text-xs text-rose-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2.5 bg-[#e05638] hover:bg-[#c94529] text-white text-xs font-semibold rounded-full shadow-xs transition-colors"
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

  const primaryCampaign = recentContent[0];

  const now = new Date();
  const dayNumber = now.getDate();
  const dayName = now.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (primaryCampaign) {
      onOpenStudio(primaryCampaign.id);
    } else {
      onOpenSubmitModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Greeting & Task Action Row (matching reference top section) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
        {/* Left: Circular Day Badge + Date + Coral Task Pill + Calendar Alert */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Day Number Circle */}
          <div className="w-14 h-14 rounded-full bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-900 font-extrabold text-xl shrink-0">
            {dayNumber}
          </div>

          {/* Day & Month Text */}
          <div className="text-left pr-2">
            <div className="text-xs font-bold text-slate-900 leading-tight">{dayName},</div>
            <div className="text-xs font-medium text-slate-500 leading-none">{monthName}</div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Primary Warm Coral Action Button */}
          <button
            onClick={() => onOpenTab("content")}
            className="btn-coral flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold shrink-0 cursor-pointer"
          >
            <span>Review Pending Drafts</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Calendar Icon Button with Alert Dot */}
          <button
            onClick={() => onOpenTab("content")}
            className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 relative shrink-0 transition-colors"
            title="Campaign review deadlines"
            aria-label="View deadlines"
          >
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#e05638]" />
          </button>
        </div>

        {/* Right: Friendly Conversational Header + Microphone Button */}
        <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto">
          <form onSubmit={handleCopilotSubmit} className="text-left flex-1 lg:flex-initial">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Hey, Need help?</span>
              <span className="text-2xl">👋</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
              <span className="text-[#e05638] font-bold">|</span>
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                placeholder="Ask AI verification copilot anything!"
                className="bg-transparent outline-none text-slate-700 placeholder-slate-400 w-full sm:w-64 text-xs font-medium"
              />
            </div>
          </form>

          {/* Circular Microphone / Voice Action Button */}
          <button
            onClick={() => primaryCampaign ? onOpenStudio(primaryCampaign.id) : onOpenSubmitModal()}
            className="w-11 h-11 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 hover:text-slate-950 transition-colors shrink-0 cursor-pointer"
            title="AI Voice Prompt"
            aria-label="Voice action"
          >
            <Mic className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 2. Middle Cards Section (matching reference VISA / Totals / Gauge / Latency layout) */}
      <div className="flex flex-col xl:flex-row items-stretch gap-4">
        {/* Card 1: Brand & Campaign Truth Vault (VISA card equivalent in reference) */}
        <div className="clay-card p-6 flex-1 flex flex-col justify-between min-w-[280px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-extrabold text-sm tracking-widest text-slate-900 uppercase">
                Verdanta
              </span>
              <button
                onClick={() => onOpenTab("knowledge")}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full"
              >
                <span>Direct Specs</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-medium">Linked to Truth Engine</div>
            <div className="font-mono text-sm font-bold text-slate-800 tracking-wider mt-0.5">
              •••• 2026
            </div>

            {/* Toggle Pills: Verified Live / Audit Mode */}
            <div className="flex items-center bg-slate-100 p-1 rounded-full mt-4 w-fit">
              <button
                onClick={() => setActiveBrandMode("verified")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeBrandMode === "verified"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Verified Live
              </button>
              <button
                onClick={() => setActiveBrandMode("audit")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeBrandMode === "audit"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Audit Mode
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Active Specifications</div>
              <div className="font-extrabold text-slate-900 text-sm">
                {metrics.approvedTruthItems ?? 8} Truth Rules
              </div>
            </div>

            <button
              onClick={() => onOpenTab("knowledge")}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#e05638] hover:text-[#c94529] transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit specs</span>
            </button>
          </div>
        </div>

        {/* Card 2: Verification Activity Totals (Total income / Total paid equivalent) */}
        <div className="clay-card p-6 flex-1 flex flex-col justify-between min-w-[280px]">
          {/* Row 1: Total Content */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Total Governed Campaigns</span>
              </div>
              <button
                onClick={() => onOpenTab("content")}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full"
              >
                <span>Weekly</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {metrics.totalContent || 0}{" "}
              <span className="text-xs font-bold text-slate-400 uppercase">Submissions</span>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2" />

          {/* Row 2: Pending Reviews */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Pending Human Reviews</span>
              </div>
              <button
                onClick={() => onOpenTab("content")}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full"
              >
                <span>Weekly</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {metrics.pendingReviews || 0}{" "}
                <span className="text-xs font-bold text-slate-400 uppercase">In Queue</span>
              </div>

              <button
                onClick={() => onOpenTab("audit")}
                className="flex items-center gap-1 text-[11px] font-bold text-[#e05638] hover:text-[#c94529]"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>View on audit mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: System Security & Policy Lock / Circular Compliance Gauge */}
        <div className="flex flex-col gap-3 shrink-0 justify-between min-w-[150px]">
          {/* Top Mini Card: System Policy Lock */}
          <div className="clay-card p-4 flex flex-col items-center justify-center text-center">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center mb-1 text-slate-800">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-bold text-slate-900">System Lock</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">• RBAC Active</div>
          </div>

          {/* Bottom Card: Jet Black Circle with Glowing Coral Ring */}
          <div className="w-full h-28 rounded-3xl bg-slate-950 p-3 text-white flex flex-col items-center justify-center text-center relative overflow-hidden shadow-md">
            <div className="w-16 h-16 rounded-full circular-progress-ring p-1 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                <span className="text-xs font-black text-white">94%</span>
                <span className="text-[8px] text-[#e05638] font-bold leading-none">Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Verification Velocity & Dot Matrix (13 Days layout in reference) */}
        <div className="clay-card p-6 flex flex-col justify-between shrink-0 min-w-[170px]">
          <div>
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-2">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-extrabold text-slate-900 leading-tight">1ms</div>
            <div className="text-[10px] text-slate-400 font-medium">Deterministic Latency</div>
          </div>

          {/* Dot Grid Matrix (Coral and Gray Dots) */}
          <div className="space-y-1.5 pt-3">
            <div className="flex items-center gap-1.5">
              {[...Array(8)].map((_, i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#e05638]" />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < 3 ? "bg-[#e05638]/40" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 5: Compliance Trend ($16,073.49 layout in reference) */}
        <div className="clay-card p-6 flex flex-col justify-between flex-1 min-w-[220px]">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <span className="bg-[#e05638] text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                2026
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {metrics.approvedContent ? Math.round((metrics.approvedContent / (metrics.totalContent || 1)) * 100) : 98}%
                </div>
                <div className="text-[11px] font-bold text-slate-800">Clean Content Rate</div>
                <div className="text-[10px] text-slate-400">Verdanta Governance</div>
              </div>
              <span className="text-[11px] font-extrabold text-[#e05638]">+ 9.3%</span>
            </div>
          </div>

          {/* Smooth Coral Spline Waveform SVG */}
          <div className="pt-3">
            <svg viewBox="0 0 160 36" className="w-full h-9 stroke-[#e05638] fill-none">
              <path
                d="M 0 24 Q 20 8, 40 22 T 80 18 T 120 10 T 160 20"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Bottom Cards Section (Concentric Funnel / Activity Manager / Review Rating) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bottom Left: Policy Distribution Concentric Funnel ("Annual profits" in reference) */}
        <div className="lg:col-span-4 clay-card p-6 flex flex-col justify-between min-h-[360px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Policy Distribution</h3>
            <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full">
              <span>2026</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Concentric Layer Circles (matching the layered circles in reference!) */}
          <div className="relative flex items-center justify-center my-auto py-4">
            {/* Outer Circle */}
            <div className="w-56 h-56 rounded-full concentric-circle-outer border border-orange-100 flex flex-col items-center justify-start pt-3 relative shadow-inner">
              <span className="text-[11px] font-extrabold text-[#e05638]">
                {metrics.approvedTruthItems ?? 8} Approved Facts
              </span>

              {/* Mid Circle */}
              <div className="w-44 h-44 rounded-full concentric-circle-mid border border-orange-200 flex flex-col items-center justify-start pt-3 absolute bottom-2">
                <span className="text-[11px] font-extrabold text-[#e05638]">
                  {metrics.activeApprovedKnowledge ?? 7} Active Rules
                </span>

                {/* Inner Circle */}
                <div className="w-32 h-32 rounded-full concentric-circle-inner border border-orange-300 flex flex-col items-center justify-start pt-2.5 absolute bottom-1.5">
                  <span className="text-[10px] font-extrabold text-white">
                    {metrics.totalBriefs ?? 3} Briefs
                  </span>

                  {/* Center Deep Coral Circle */}
                  <div className="w-20 h-20 rounded-full concentric-circle-center text-white flex flex-col items-center justify-center text-center absolute bottom-1">
                    <span className="text-xs font-black leading-tight">
                      {metrics.expiredKnowledge ?? 1}
                    </span>
                    <span className="text-[9px] font-bold text-orange-100 leading-none">Expired</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Expired evidence flagged:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
              KB-VER-007 (Dec 2023)
            </span>
          </div>
        </div>

        {/* Bottom Center: Activity Manager ("Activity manager" in reference) */}
        <div className="lg:col-span-5 clay-card p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Activity manager</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <button
                  onClick={() => onOpenTab("content")}
                  className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full text-slate-600 font-semibold"
                >
                  <Filter className="w-3 h-3 text-slate-500" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Search input + filter tags */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-full px-3 py-1 flex-1 min-w-[150px]">
                <Search className="w-3 h-3 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search in activities ..."
                  className="text-xs bg-transparent outline-none w-full text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-800 flex items-center gap-1">
                  Team <span className="w-1.5 h-1.5 rounded-full bg-[#e05638]" />
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-slate-600 font-medium">
                  Insights ✕
                </span>
              </div>
            </div>

            {/* 3 Sub-Cards Inside */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Sub-card 1: Soundwave Bar Chart */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Reviewers</div>
                  <div className="text-lg font-black text-slate-900">4 Active</div>
                </div>

                {/* Soundwave Bars */}
                <div className="flex items-end justify-between h-10 gap-1 pt-2">
                  {[18, 28, 14, 34, 22, 38, 16, 26].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}px` }}
                      className={`w-1.5 rounded-full ${i % 2 === 0 ? "bg-[#e05638]" : "bg-slate-300"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Sub-card 2: Business Plans Categories */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Truth Rules</div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center">
                      F
                    </span>
                    <span className="text-[11px] font-semibold text-slate-800 truncate">Product Facts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold flex items-center justify-center">
                      P
                    </span>
                    <span className="text-[11px] font-semibold text-slate-800 truncate">Permitted Claims</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold flex items-center justify-center">
                      X
                    </span>
                    <span className="text-[11px] font-semibold text-slate-800 truncate">Prohibited</span>
                  </div>
                </div>
              </div>

              {/* Sub-card 3: Verification Engine Status */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-[#e05638] flex items-center justify-center mb-1">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">Policy Engine</div>
                  <div className="text-[9px] text-slate-400 leading-tight mt-0.5">
                    Grounded rule verification
                  </div>
                </div>

                <button
                  onClick={() => onOpenTab("guide")}
                  className="btn-coral w-full py-1.5 rounded-xl text-[10px] font-bold mt-2"
                >
                  Enabled
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Real-time persistence:</span>
            <span className="font-semibold text-slate-800">PostgreSQL Live</span>
          </div>
        </div>

        {/* Bottom Right: Review Rating & Experience Widget ("How is your business management going?") */}
        <div className="lg:col-span-3 clay-card p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            {/* Top Pagination Dots + Close */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-4 h-1.5 rounded-full bg-slate-900" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
              <button
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs"
                aria-label="Dismiss widget"
              >
                ✕
              </button>
            </div>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Review rating
            </div>
            <h4 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug mb-2">
              How is your content governance going?
            </h4>
            <p className="text-xs text-slate-500">
              Rate the speed of policy verification and resolution for Verdanta Foods marketing copy.
            </p>
          </div>

          {/* Interactive Smileys Curves [ ⌒ ] [ ⌒ ] [ — ] [ ⌣ ] [ ⌣ ] */}
          <div className="flex items-center justify-between py-6 px-1">
            {[1, 2, 3, 4, 5].map((level) => {
              const isSelected = selectedRating === level;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedRating(level)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isSelected
                      ? "bg-[#e05638] text-white shadow-md scale-110"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                  title={`Satisfaction level ${level}`}
                >
                  {level === 1 && "︵"}
                  {level === 2 && "⌒"}
                  {level === 3 && "—"}
                  {level === 4 && "⌣"}
                  {level === 5 && "◡"}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onOpenTab("guide")}
              className="text-xs font-bold text-[#e05638] hover:underline"
            >
              Open Hackathon Evaluation Guide →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
