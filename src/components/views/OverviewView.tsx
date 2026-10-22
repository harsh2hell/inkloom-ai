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
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  Plus,
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
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium text-slate-500">Loading governance metrics from PostgreSQL...</p>
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

  const getPercent = (count: number) => {
    if (!totalFindings) return 0;
    return Math.round((count / totalFindings) * 100);
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
        return { label: "In Review", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
  };

  return (
    <div className="space-y-6">
      {/* A. Page Header (Restrained, Minimal, Clean) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Governance Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time claim compliance, approved truth evidence, and human verification pipeline for Verdanta Foods.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTab("guide")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Judge Guide</span>
          </button>
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Content</span>
          </button>
        </div>
      </div>

      {/* B. KPI Row (4 Equal-Height Compact Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="saas-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Reviewed Campaigns</span>
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.totalContent || 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {metrics.approvedContent || 0} approved for release
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="saas-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Pending Reviews</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.pendingReviews || 0}
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">
              Requires human reviewer action
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="saas-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Approved Truth Items</span>
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.approvedTruthItems ?? metrics.totalKnowledge ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {metrics.activeApprovedKnowledge ?? 7} active specs • {metrics.expiredKnowledge ?? 1} expired
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="saas-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Creator Briefs</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.totalBriefs || 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Derived from approved copy
            </div>
          </div>
        </div>
      </div>

      {/* C. Main Analytics Area (Balanced 2-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Larger Panel: Findings by Classification (Horizontal Clean Bars) */}
        <div className="lg:col-span-7 saas-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Findings by Policy Classification</h3>
              <p className="text-[11px] text-slate-500">Non-duplicated findings across latest active campaign versions</p>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {totalFindings} Total
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* 1. Verified Contradictions */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Verified Contradictions
                </span>
                <span className="font-semibold text-slate-800">
                  {findingsByType.verifiedContradictions || 0}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({getPercent(findingsByType.verifiedContradictions || 0)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${getPercent(findingsByType.verifiedContradictions || 0)}%` }}
                />
              </div>
            </div>

            {/* 2. Prohibited & Possible Risks */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Possible Policy Risks & Mandatory Disclosures
                </span>
                <span className="font-semibold text-slate-800">
                  {findingsByType.possibleRisks || 0}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({getPercent(findingsByType.possibleRisks || 0)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${getPercent(findingsByType.possibleRisks || 0)}%` }}
                />
              </div>
            </div>

            {/* 3. Insufficient Evidence */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Insufficient Evidence (Expired / Unverified Sources)
                </span>
                <span className="font-semibold text-slate-800">
                  {findingsByType.insufficientEvidence || 0}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({getPercent(findingsByType.insufficientEvidence || 0)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${getPercent(findingsByType.insufficientEvidence || 0)}%` }}
                />
              </div>
            </div>

            {/* 4. Unsupported Claims */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  Unsupported Claims
                </span>
                <span className="font-semibold text-slate-800">
                  {findingsByType.unsupportedClaims || 0}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({getPercent(findingsByType.unsupportedClaims || 0)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${getPercent(findingsByType.unsupportedClaims || 0)}%` }}
                />
              </div>
            </div>

            {/* 5. Style Suggestions */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Terminology & Style Alignments
                </span>
                <span className="font-semibold text-slate-800">
                  {findingsByType.styleSuggestions || 0}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({getPercent(findingsByType.styleSuggestions || 0)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${getPercent(findingsByType.styleSuggestions || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Smaller Panel: Review Pipeline & Governance Statuses */}
        <div className="lg:col-span-5 saas-card p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-900">Review Pipeline Status</h3>
              <p className="text-[11px] text-slate-500">Persisted lifecycle states in PostgreSQL</p>
            </div>

            <div className="mt-3.5 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
                <span className="font-medium text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Approved for Publication
                </span>
                <span className="font-bold text-emerald-900">{metrics.approvedContent || 0}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 text-xs">
                <span className="font-medium text-amber-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Pending Human Review
                </span>
                <span className="font-bold text-amber-900">{metrics.pendingReviews || 0}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-slate-700 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  Total Campaigns Monitored
                </span>
                <span className="font-bold text-slate-900">{metrics.totalContent || 0}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Human Review Rule:</span>
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              Creator Self-Approval Banned
            </span>
          </div>
        </div>
      </div>

      {/* D. Recent Activity Table */}
      <div className="saas-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900">Recent Content Reviews</h3>
            <p className="text-[11px] text-slate-500">Latest marketing submissions and verification audit traces</p>
          </div>
          <button
            onClick={() => onOpenTab("content")}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentContent.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No campaigns submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Campaign Title</th>
                  <th className="py-2.5 px-4">Submitter</th>
                  <th className="py-2.5 px-4">Last Updated</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Findings</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentContent.slice(0, 5).map((item: any) => {
                  const status = getStatusBadge(item.status);
                  const latestVersion = item.versions?.[0];
                  const findingsCount =
                    latestVersion?.analysisRuns?.[0]?.findings?.length ?? 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-400">{item.campaignName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.submitter?.name || "Agency Creator"}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(item.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {findingsCount > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[10px] border border-rose-200">
                            {findingsCount} issues
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                            Clean
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenStudio(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                        >
                          Review in Studio →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
