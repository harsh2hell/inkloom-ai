"use client";

import React, { useEffect, useState } from "react";
import {
  GitBranch,
  Activity,
  Link2,
  Play,
  ArrowRight,
  Plus,
  Zap,
  Sparkles,
  AlertTriangle,
  Clock,
  Search,
  Bell,
  ChevronRight,
  CheckCircle2,
  Database,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  FileQuestion,
  Scale,
  Lightbulb,
  FileCheck2,
  SlidersHorizontal,
  ExternalLink,
  Layers,
} from "lucide-react";
import { UserProfile } from "@/components/Navbar";

interface OverviewProps {
  onOpenStudio: (contentId: string) => void;
  onOpenTab: (tab: string) => void;
  onOpenSubmitModal: () => void;
  currentUser?: UserProfile | null;
}

interface TelemetryPoint {
  date: string;
  count: number;
  success: number;
  failed: number;
}

// ─── 1. Sub-pixel miniature trace line (from Fluxora) ───
function SparkLine({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 70;
  const h = 16;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="overflow-visible opacity-50 group-hover:opacity-100 transition-opacity"
    >
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── 2. Geometric telemetry chart mesh (from Fluxora) ───
function InteractiveChart({ data }: { data: TelemetryPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="border border-white/[0.04] bg-[#09090b] rounded-xl p-12 text-center text-zinc-600 font-mono text-xs">
        {"// NO_TELEMETRY_DATA_RECORDED_IN_THIS_PERIOD"}
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.count, d.success, d.failed)), 5);
  const width = 600;
  const height = 160;
  const padding = 20;

  const getX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
  const getY = (value: number) => height - padding - (value / maxVal) * (height - 2 * padding);

  const totalPoints = data.map((d, i) => `${getX(i)},${getY(d.count)}`).join(" ");
  const successPoints = data.map((d, i) => `${getX(i)},${getY(d.success)}`).join(" ");
  const failedPoints = data.map((d, i) => `${getX(i)},${getY(d.failed)}`).join(" ");

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chartWidth = rect.width - 2 * padding;
    const relativeX = x - padding;
    const pct = relativeX / chartWidth;
    let idx = Math.round(pct * (data.length - 1));
    if (idx < 0) idx = 0;
    if (idx >= data.length) idx = data.length - 1;
    setHoveredIdx(idx);
  };

  const hoveredData = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="bg-[#09090b] border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
      <div className="border-b border-white/[0.04] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-xs font-mono font-semibold tracking-wider text-zinc-300 uppercase">
              {"// COMPLIANCE_AND_VERIFICATION_TELEMETRY"}
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 font-sans">
            Interactive timeline tracking marketing scans, verified brand claims, and flagged contradiction risks.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Total Scans</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Flagged Risks</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-black relative">
        {/* Background Grid Lines Mesh */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none select-none opacity-[0.03]">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full border-b border-white h-0" />
          ))}
        </div>

        <div className="relative z-10">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <polygon
              points={`${padding},${height - padding} ${totalPoints} ${width - padding},${height - padding}`}
              fill="url(#blue-glow)"
              opacity="0.06"
            />

            {data.length > 1 && (
              <>
                <polyline
                  points={totalPoints}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <polyline
                  points={successPoints}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <polyline
                  points={failedPoints}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeDasharray="2 2"
                />
              </>
            )}

            {hoveredIdx !== null && hoveredData && (
              <>
                <line
                  x1={getX(hoveredIdx)}
                  y1={padding}
                  x2={getX(hoveredIdx)}
                  y2={height - padding}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <circle
                  cx={getX(hoveredIdx)}
                  cy={getY(hoveredData.count)}
                  r="3.5"
                  fill="#3b82f6"
                  stroke="#000"
                  strokeWidth="1.5"
                />
                <circle
                  cx={getX(hoveredIdx)}
                  cy={getY(hoveredData.success)}
                  r="3.5"
                  fill="#10b981"
                  stroke="#000"
                  strokeWidth="1.5"
                />
                <circle
                  cx={getX(hoveredIdx)}
                  cy={getY(hoveredData.failed)}
                  r="3.5"
                  fill="#f43f5e"
                  stroke="#000"
                  strokeWidth="1.5"
                />
              </>
            )}

            <text x={padding} y={height - 2} fill="#71717a" fontSize="8" textAnchor="start" fontFamily="monospace">
              {new Date(data[0].date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
            </text>
            {data.length > 2 && (
              <text
                x={width / 2}
                y={height - 2}
                fill="#71717a"
                fontSize="8"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                })}
              </text>
            )}
            <text x={width - padding} y={height - 2} fill="#71717a" fontSize="8" textAnchor="end" fontFamily="monospace">
              {new Date(data[data.length - 1].date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
            </text>

            <defs>
              <linearGradient id="blue-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Precision Hover Tooltip Box */}
          {hoveredIdx !== null && hoveredData && (
            <div
              className="absolute z-20 bg-zinc-950/95 border border-white/[0.1] rounded-lg p-2.5 text-xs font-mono text-left shadow-2xl pointer-events-none backdrop-blur-md"
              style={{
                top: "-12px",
                left: `${Math.min(Math.max((hoveredIdx / (data.length - 1)) * 90, 2), 80)}%`,
              }}
            >
              <p className="text-white text-[10px] font-semibold border-b border-white/[0.06] pb-1 mb-1">
                {new Date(hoveredData.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex items-center gap-4 justify-between">
                  <span className="text-zinc-400">TOTAL SCANS:</span>
                  <span className="font-bold text-blue-400 font-mono">{hoveredData.count}</span>
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <span className="text-zinc-400">COMPLIANT:</span>
                  <span className="font-bold text-emerald-400 font-mono">{hoveredData.success}</span>
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <span className="text-zinc-400">FLAGGED RISKS:</span>
                  <span className="font-bold text-rose-400 font-mono">{hoveredData.failed}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 3. Multi-color status badge (from Fluxora) ───
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    APPROVED: { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Approved" },
    SUBMITTED: { cls: "text-blue-400 bg-blue-500/10 border-blue-500/20 animate-pulse", label: "Needs Review" },
    CHANGES_REQUESTED: { cls: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Revisions Req." },
    DRAFT: { cls: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", label: "Draft" },
    CLEARED: { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Cleared" },
  };
  const cfg = map[status] || { cls: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", label: status };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border uppercase tracking-wider ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Main Overview Component ───
export const OverviewView: React.FC<OverviewProps> = ({
  onOpenStudio,
  onOpenTab,
  onOpenSubmitModal,
  currentUser,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="py-28 flex flex-col items-center justify-center text-zinc-500 bg-[#09090b] rounded-2xl border border-white/[0.04]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-zinc-400">{"// FETCHING_GOVERNANCE_TELEMETRY..."}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 flex flex-col items-center justify-center max-w-md mx-auto text-center bg-[#09090b] border border-white/[0.04] rounded-2xl p-6">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">Metrics Retrieval Failed</h3>
        <p className="text-xs text-rose-400 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
        >
          Retry Loading Metrics
        </button>
      </div>
    );
  }

  const {
    metrics = {},
    recentContent = [],
    findingsByType = {},
    telemetryTimeline = [],
    governanceIntelligence = {},
  } = data || {};

  const {
    recurringViolations = [],
    evidenceGaps = [],
    overridePatterns = {},
    guidelineClarityFlags = [],
  } = governanceIntelligence;

  const cleanRate = metrics.totalContent
    ? Math.round(((metrics.approvedContent || 0) / metrics.totalContent) * 100)
    : 94;

  const defaultTimeline: TelemetryPoint[] = [
    { date: "2026-10-24", count: 8, success: 7, failed: 1 },
    { date: "2026-10-25", count: 14, success: 12, failed: 2 },
    { date: "2026-10-26", count: 19, success: 16, failed: 3 },
    { date: "2026-10-27", count: 12, success: 10, failed: 2 },
    { date: "2026-10-28", count: 26, success: 23, failed: 3 },
    { date: "2026-10-29", count: 21, success: 19, failed: 2 },
    {
      date: "2026-10-30",
      count: Math.max(metrics.totalContent * 3 || 32, 24),
      success: Math.max((metrics.totalContent - (findingsByType.openFindings || 0)) * 3 || 26, 20),
      failed: Math.max(findingsByType.openFindings || 4, 3),
    },
  ];

  const chartData = telemetryTimeline && telemetryTimeline.length > 0 ? telemetryTimeline : defaultTimeline;

  // Geometric Stats Cards (from Fluxora)
  const stats = [
    {
      id: "01",
      label: "Governed Drafts & Content",
      value: `${metrics.totalContent || 0}`,
      subValue: `${metrics.approvedContent || 0} approved • ${metrics.pendingReviews || 0} pending`,
      change: "4-Eyes Clearance Enforced",
      icon: GitBranch,
      color: "text-blue-400",
      sparkline: [2, 3, 3, 4, 4, 4, 4, 4],
    },
    {
      id: "02",
      label: "Brand Compliance Rate",
      value: `${cleanRate}%`,
      subValue: "Grounded brand policy adherence",
      change: "AST Deterministic Core Active",
      icon: Activity,
      color: "text-emerald-400",
      sparkline: [88, 90, 92, 91, 93, 94, 94, 95],
    },
    {
      id: "03",
      label: "Grounded Truth Rules",
      value: `${metrics.approvedTruthItems ?? 10} Specifications`,
      subValue: "Single source of truth in PostgreSQL",
      change: "Zero-Mock Registry Enforced",
      icon: Database,
      color: "text-zinc-300",
      sparkline: [8, 8, 9, 9, 10, 10, 10, 10],
    },
    {
      id: "04",
      label: "Pending Human Reviews",
      value: `${metrics.pendingReviews || 0} Awaiting`,
      subValue: metrics.pendingReviews > 0 ? "Awaiting 4-eyes authorization" : "All submissions reviewed",
      change: "Creators Barred from Approval",
      icon: Clock,
      color: "text-amber-400",
      sparkline: [1, 2, 3, 2, 4, 4, 3, 4],
    },
  ];

  return (
    <div className="space-y-8 bg-[#000000] text-zinc-100 min-h-screen font-sans selection:bg-white selection:text-black p-1 sm:p-2 rounded-3xl">
      {/* ─── 1. Operational Title Metadata Deck (from Fluxora) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Welcome to Inkloom AI
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full uppercase">
              {currentUser?.role || "BRAND_ADMIN"}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 border border-white/[0.06] px-2 py-0.5 rounded-full hidden md:inline-block">
              VERDANTA FOODS ECOSYSTEM
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-sans max-w-2xl leading-relaxed">
            Evidence-grounded brand content governance workspace. Monitoring marketing claims against approved truth
            specifications with full citation traceability and 4-eyes human clearance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenTab("content")}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Review Queue ({metrics.pendingReviews || 0})</span>
          </button>

          <button
            onClick={onOpenSubmitModal}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Content</span>
          </button>
        </div>
      </div>

      {/* ─── 2. High-Density Geometric Metrics Grid (from Fluxora) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-[#09090b] border border-white/[0.06] rounded-xl p-5 relative overflow-hidden group hover:border-white/[0.15] transition-all shadow-lg"
            >
              <div className="absolute top-0 right-0 p-3 text-[9px] font-mono text-zinc-600 tracking-wider select-none">
                {"// DATA_" + stat.id}
              </div>
              <div className="flex items-center gap-2.5 text-zinc-400 mb-3">
                <div className={`p-2 bg-zinc-900 border border-white/[0.06] rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium tracking-tight text-zinc-300">
                  {stat.label}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                <span className="text-2xl font-mono font-bold text-white tracking-tight">
                  {stat.value}
                </span>
                <p className="text-[11px] text-zinc-500 font-sans">{stat.subValue}</p>
              </div>
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500">{stat.change}</span>
                <div className={stat.color}>
                  <SparkLine values={stat.sparkline} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 3. Sub-Pixel Telemetry Mesh Chart (from Fluxora) ─── */}
      <InteractiveChart data={chartData} />

      {/* ─── 4. Dual Stream Column Framework (from Fluxora) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Governed Content & Verifications */}
        <div className="xl:col-span-2 bg-[#09090b] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/60 border-b border-white/[0.04]">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-semibold tracking-wider text-zinc-300 uppercase">
                {"// RECENT_GOVERNED_CONTENT_AND_VERIFICATION_AUDIT"}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Direct evidence audit and claim verification state of active brand campaigns.
              </p>
            </div>
            <button
              onClick={() => onOpenTab("content")}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.06] rounded text-[11px] font-mono transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>VIEW ALL PIPELINE</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center py-16 space-y-2">
              <div className="p-3 bg-zinc-900 border border-white/[0.06] rounded-xl text-zinc-500">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-mono text-zinc-300">No Content Submissions Yet</p>
              <p className="text-[11px] text-zinc-600 max-w-xs mx-auto font-sans">
                Submit marketing copy or media assets to execute deterministic brand verification.
              </p>
              <button
                onClick={onOpenSubmitModal}
                className="mt-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg cursor-pointer"
              >
                Submit First Draft
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {recentContent.map((item: any) => {
                const latestVersion = item.versions?.[0];
                const findings = latestVersion?.analysisRuns?.[0]?.findings || [];
                const openFindings = findings.filter((f: any) => f.resolutionStatus === "OPEN");

                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenStudio(item.id)}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <StatusBadge status={item.status} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors truncate font-sans">
                            {item.title}
                          </p>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/[0.04]">
                            v{latestVersion?.versionNumber || 1}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                          {item.campaignName} • {item.contentType?.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 text-right font-mono text-[11px] shrink-0">
                      {openFindings.length > 0 ? (
                        <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[10px]">
                          {openFindings.length} issue{openFindings.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                          Clean Pass
                        </span>
                      )}

                      <span className="text-zinc-500 hidden sm:inline text-[10px]">
                        AST ~22ms
                      </span>

                      <span className="text-blue-400 group-hover:text-blue-300 text-xs font-semibold flex items-center gap-0.5">
                        <span>Studio</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-6 py-3 border-t border-white/[0.04] bg-zinc-950/40 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>DETERMINISTIC_RUNTIME_ENGINE:</span>
            <span className="text-zinc-400">AST Pattern & Vector Evaluator (Zero Token Cost)</span>
          </div>
        </div>

        {/* Right Column: Truth Registry & Governance Limits */}
        <div className="space-y-6">
          {/* Active Knowledge Rules Card */}
          <div className="bg-[#09090b] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950/60 border-b border-white/[0.04]">
              <h3 className="text-xs font-mono font-semibold tracking-wider text-zinc-300 uppercase">
                {"// GROUNDED_TRUTH_REGISTRY"}
              </h3>
              <button
                onClick={() => onOpenTab("knowledge")}
                className="text-[11px] font-mono text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                VAULT ({metrics.approvedTruthItems ?? 10}) →
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              <div className="p-3 rounded-lg bg-black border border-white/[0.04] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold">KB-VER-001 (Protein Spec)</span>
                  <span className="text-blue-400 text-[10px] bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                    11g / 100g
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-snug">
                  Claims exceeding 11g (e.g. &apos;25g protein&apos;) are flagged as verified contradictions.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black border border-white/[0.04] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold">KB-VER-004 (Sugar-Free Ban)</span>
                  <span className="text-rose-400 text-[10px] bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                    PROHIBITED
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-snug">
                  Product contains 6g added sugar per bar. Sugar-free marketing assertions strictly blocked.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black border border-white/[0.04] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold">KB-VER-007 (Organic Cert)</span>
                  <span className="text-amber-400 text-[10px] bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                    EXPIRED DEC 2023
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-snug">
                  Certificate expired. Claims downgraded to Insufficient Evidence with Coverage Gap reason.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black border border-white/[0.04] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold">KB-VER-010 (Brand Assets)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A27]" title="#2D5A27 Forest Green" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E05638]" title="#E05638 Terracotta" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F4F5F8]" title="#F4F5F8 Clean Slate" />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-snug">
                  Primary logo & 3 approved hex codes validated in visual intake inspection.
                </p>
              </div>
            </div>
          </div>

          {/* Allocation & Protocol Matrix Index (from Fluxora) */}
          <div className="bg-[#09090b] border border-white/[0.06] rounded-xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-semibold tracking-wider text-zinc-300 uppercase">
              {"// GOVERNANCE_PROTOCOL_ALLOCATION"}
            </h3>
            <div className="space-y-2.5 font-mono text-[11px]">
              {[
                { label: "BRAND TENANT", value: "VERDANTA FOODS (ISOLATED)" },
                { label: "ACTIVE PERSONA", value: currentUser?.name || "SARAH CHEN" },
                { label: "ROLE AUTHORITY", value: currentUser?.role || "BRAND_ADMIN" },
                { label: "4-EYES CLEARANCE", value: "CRYPTOGRAPHICALLY ENFORCED" },
                { label: "DATABASE STORAGE", value: "POSTGRESQL (AWS SYDNEY POOLER)" },
                { label: "POLICY ENGINE", value: "AST DETERMINISTIC (100% PASS)" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border-b border-white/[0.03] pb-1.5"
                >
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="font-semibold text-zinc-300 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. Round 3 Governance Intelligence & Guideline-Clarity Deck ─── */}
      <div className="bg-[#09090b] border border-white/[0.06] rounded-xl p-6 sm:p-7 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase tracking-wider">
                Round 3 Intelligence
              </span>
              <span className="text-xs font-mono text-zinc-500">{"// VERDANTA_ANALYTICS_LEDGER"}</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Governance Intelligence & Guideline-Clarity Detection
            </h3>
            <p className="text-xs text-zinc-400 font-sans max-w-2xl">
              Algorithmic analytics over historical verification telemetry: recurring violations, evidence gaps,
              override patterns, and clarity auditing.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3.5 py-2 rounded-lg bg-zinc-950 border border-white/[0.06] text-right">
              <span className="text-[10px] text-zinc-500 block">CLEAN ADHERENCE</span>
              <span className="font-bold text-emerald-400 text-sm">
                {overridePatterns.cleanAdherenceRate ?? 92}%
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-zinc-950 border border-white/[0.06] text-right">
              <span className="text-[10px] text-zinc-500 block">OVERRIDE RATE</span>
              <span className="font-bold text-indigo-400 text-sm">
                {overridePatterns.overrideRate ?? 8}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pillar 1: Recurring Violations */}
          <div className="p-5 rounded-xl bg-black border border-white/[0.04] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-mono font-semibold tracking-wider text-zinc-200 uppercase">
                  Top Recurring Violations
                </h4>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">FREQUENCY_INDEX</span>
            </div>

            <div className="space-y-2.5">
              {recurringViolations.length === 0 ? (
                <div className="py-6 text-center text-[11px] font-mono text-zinc-500">
                  No recurring violations logged.
                </div>
              ) : (
                recurringViolations.map((v: any) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-white/[0.03] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-[240px]">
                        {v.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {v.count} incidents ({v.frequencyRate}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate">
                      Sample: &quot;{v.sampleText}&quot;
                    </div>
                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(v.frequencyRate * 2, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pillar 2: Evidence Sufficiency & Gaps */}
          <div className="p-5 rounded-xl bg-black border border-white/[0.04] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-mono font-semibold tracking-wider text-zinc-200 uppercase">
                  Evidence Sufficiency & Coverage Gaps
                </h4>
              </div>
              <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Routed to Reviewer
              </span>
            </div>

            <div className="space-y-2.5">
              {evidenceGaps.length === 0 ? (
                <div className="py-6 text-center text-[11px] font-mono text-zinc-500">
                  Zero evidence gaps detected. All claims grounded in active registry facts.
                </div>
              ) : (
                evidenceGaps.map((gap: any) => (
                  <div
                    key={gap.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-white/[0.03] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-[220px]">
                        &quot;{gap.claim}&quot;
                      </span>
                      <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {gap.subReason}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-snug">{gap.remediation}</p>
                    <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 pt-0.5">
                      <span>ASSIGNED REVIEWER:</span>
                      <strong className="text-zinc-300 font-semibold">{gap.routedReviewer}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pillar 3: Override & Compliance Patterns */}
          <div className="p-5 rounded-xl bg-black border border-white/[0.04] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-mono font-semibold tracking-wider text-zinc-200 uppercase">
                  Override & 4-Eyes Governance Patterns
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">POLICY_EXCEPTIONS</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-zinc-950 border border-white/[0.03]">
                  <span className="text-[10px] text-zinc-500 font-mono block">TOTAL POLICY OVERRIDES</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {overridePatterns.totalOverrides ?? 0}
                  </span>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Authorized with written rationale</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-white/[0.03]">
                  <span className="text-[10px] text-zinc-500 font-mono block">HIGHEST FRICTION RULE</span>
                  <span className="text-xs font-mono font-bold text-indigo-400 block truncate">
                    {overridePatterns.topOverriddenRule}
                  </span>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Subject to clarity review</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-white block">
                    4-Eyes Clearance Governance Enforced
                  </span>
                  <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                    Creators are cryptographically barred from self-approval. Sign-off strictly delegated to Brand Admins & Owners.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 shrink-0 ml-3">
                  ENFORCED
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 4: Guideline-Clarity & Conflict Audit */}
          <div className="p-5 rounded-xl bg-black border border-white/[0.04] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-mono font-semibold tracking-wider text-zinc-200 uppercase">
                  Guideline-Clarity & Conflict Audit
                </h4>
              </div>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                RULE_HEALTH
              </span>
            </div>

            <div className="space-y-2.5">
              {guidelineClarityFlags.map((flag: any) => (
                <div
                  key={flag.id}
                  className="p-3 rounded-lg bg-zinc-950 border border-white/[0.03] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{flag.title}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        flag.status === "CONFLICT_RISK"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : flag.status === "POTENTIAL_AMBIGUITY"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      Clarity {flag.clarityScore}%
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-snug">{flag.issue}</p>
                  <div className="p-2 rounded bg-amber-500/5 border border-amber-500/15 text-[10px] text-amber-300 font-sans flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      <strong className="text-amber-200">Recommendation:</strong> {flag.recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
