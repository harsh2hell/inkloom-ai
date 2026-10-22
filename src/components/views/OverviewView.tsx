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
  ArrowRight,
  Database,
  History,
  FileCheck,
} from "lucide-react";

interface OverviewProps {
  onOpenStudio: (contentId: string) => void;
  onOpenTab: (tab: string) => void;
  onOpenSubmitModal: () => void;
}

export const OverviewView: React.FC<OverviewProps> = ({
  onOpenStudio,
  onOpenTab,
  onOpenSubmitModal,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium">Loading Governance Dashboard Metrics from PostgreSQL...</p>
      </div>
    );
  }

  const { metrics, findingsByType, recentAuditEvents, recentContent } = data || {
    metrics: {},
    findingsByType: {},
    recentAuditEvents: [],
    recentContent: [],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Single Source of Truth Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Verdanta Foods Content Governance Hub
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Inkloom AI governs marketing claims against approved lab specifications, permitted and prohibited claims, and mandatory disclosures. Every finding is evidence-backed and every approval decision remains with a human reviewer.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSubmitModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Verify New Content
            </button>
            <button
              onClick={() => onOpenTab("guide")}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl border border-white/20 transition-colors"
            >
              View Judge Demo Script
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
            <span>Reviewed Campaigns</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalContent || 0}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {metrics.approvedContent || 0} approved for publication
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
            <span>Pending Reviews</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.pendingReviews || 0}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            Requires authorized human review
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
            <span>Approved Truth Items</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalKnowledge || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {metrics.expiredKnowledge || 0} expired certifications
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
            <span>Creator Briefs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalBriefs || 0}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">
            {metrics.totalCreatorSubmissions || 0} final adaptations checked
          </div>
        </div>
      </div>

      {/* The 5 Finding Types Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Compliance Findings by Classification</h2>
            <p className="text-xs text-slate-500">
              Deterministic & AI findings categorized strictly across the 5 governance types
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {findingsByType.totalFindings || 0} Total Findings Recorded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* 1. Verified Contradiction */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
            <div className="flex items-center gap-2 text-red-700 text-xs font-semibold mb-1">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              <span>Contradiction</span>
            </div>
            <div className="text-xl font-bold text-red-900">{findingsByType.verifiedContradictions || 0}</div>
            <p className="text-[10px] text-red-600 mt-1 leading-snug">
              Direct conflict with approved specification or prohibited claim policy
            </p>
          </div>

          {/* 2. Unsupported Claim */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold mb-1">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Unsupported</span>
            </div>
            <div className="text-xl font-bold text-amber-900">{findingsByType.unsupportedClaims || 0}</div>
            <p className="text-[10px] text-amber-600 mt-1 leading-snug">
              Claim without evidence in approved repository (not auto-false)
            </p>
          </div>

          {/* 3. Insufficient Evidence */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
            <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold mb-1">
              <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Insufficient Evidence</span>
            </div>
            <div className="text-xl font-bold text-purple-900">{findingsByType.insufficientEvidence || 0}</div>
            <p className="text-[10px] text-purple-600 mt-1 leading-snug">
              Unverified citations, expired sources, or unverifiable claims
            </p>
          </div>

          {/* 4. Possible Risk */}
          <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50">
            <div className="flex items-center gap-2 text-orange-700 text-xs font-semibold mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Possible Risk</span>
            </div>
            <div className="text-xl font-bold text-orange-900">{findingsByType.possibleRisks || 0}</div>
            <p className="text-[10px] text-orange-600 mt-1 leading-snug">
              Missing mandatory disclosures, ambiguous wording, or regulatory risks
            </p>
          </div>

          {/* 5. Style Suggestion */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold mb-1">
              <Lightbulb className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Style Suggestion</span>
            </div>
            <div className="text-xl font-bold text-blue-900">{findingsByType.styleSuggestions || 0}</div>
            <p className="text-[10px] text-blue-600 mt-1 leading-snug">
              Brand voice, transparency tone, and clarity enhancements
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Submissions & Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Content Submissions</h3>
              <p className="text-xs text-slate-500">Open any item to inspect in Correction Studio</p>
            </div>
            <button
              onClick={() => onOpenTab("content")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentContent.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No content items submitted yet.</div>
            ) : (
              recentContent.map((item: any) => {
                const latestVersion = item.versions?.[0];
                const findingsCount = latestVersion?.analysisRuns?.[0]?.findings?.length || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenStudio(item.id)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="text-xs font-semibold text-slate-900 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-slate-700">{item.campaignName}</span>
                        <span>•</span>
                        <span>v{item.currentVersionNumber}</span>
                        <span>•</span>
                        <span>by {item.submitter?.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {findingsCount > 0 ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {findingsCount} findings
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Compliant
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          item.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : item.status === "CHANGES_REQUESTED"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Immutable Audit Events */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Audit Log Events</h3>
              <p className="text-xs text-slate-500">Immutable trace of all approvals, overrides & checks</p>
            </div>
            <button
              onClick={() => onOpenTab("audit")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Full Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72 pr-1">
            {recentAuditEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No audit events recorded yet.</div>
            ) : (
              recentAuditEvents.map((log: any) => (
                <div key={log.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 font-mono text-[11px]">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <span className="font-medium text-slate-800">{log.userName}</span>
                    <span className="text-slate-400">({log.userRole})</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 truncate max-w-xs">{log.entityType}: {log.entityId}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
