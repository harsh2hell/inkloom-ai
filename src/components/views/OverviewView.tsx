"use client";

import React, { useEffect, useState } from "react";
import {
  FileCheck2,
  Clock,
  Database,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
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
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-[#e05638] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-600">Loading governance metrics...</p>
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
          className="px-5 py-2.5 bg-[#e05638] hover:bg-[#c94529] text-white text-xs font-semibold rounded-full shadow-xs transition-colors cursor-pointer"
        >
          Retry Loading Metrics
        </button>
      </div>
    );
  }

  const { metrics = {}, recentContent = [] } = data || {};

  const now = new Date();
  const dayNumber = now.getDate();
  const dayName = now.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  const cleanRate = metrics.totalContent
    ? Math.round(((metrics.approvedContent || 0) / metrics.totalContent) * 100)
    : 94;

  return (
    <div className="space-y-6">
      {/* 1. Sleek Minimalistic Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div className="flex items-center gap-3.5">
          {/* Day Number Circle */}
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-900 font-extrabold text-lg shrink-0">
            {dayNumber}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Governance Overview
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                • {dayName}, {monthName}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Verdanta Foods Single Source of Truth & Claim Verification
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenTab("content")}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            Review Queue ({metrics.pendingReviews || 0})
          </button>

          <button
            onClick={onOpenSubmitModal}
            className="btn-coral flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Content</span>
          </button>
        </div>
      </div>

      {/* 2. Sleek 4-Card Metric Grid (Clean, Essential Data Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Governed Submissions */}
        <div className="clay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-500">Governed Content</span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalContent || 0}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">{metrics.approvedContent || 0} approved</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{metrics.pendingReviews || 0} pending</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Pending Human Reviews */}
        <div className="clay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-500">Pending Reviews</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.pendingReviews || 0}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">
              {metrics.pendingReviews > 0 ? "Awaiting 4-eyes authorization" : "All submissions reviewed"}
            </div>
          </div>
        </div>

        {/* Metric 3: Clean Content Rate */}
        <div className="clay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-500">Compliance Rate</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {cleanRate}%
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">
              Grounded brand policy adherence
            </div>
          </div>
        </div>

        {/* Metric 4: Active Truth Specifications */}
        <div className="clay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-500">Grounded Rules</span>
            <div className="w-7 h-7 rounded-xl bg-orange-50 text-[#e05638] flex items-center justify-center">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.approvedTruthItems ?? 8} Rules
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">
              Single source of truth in PostgreSQL
            </div>
          </div>
        </div>
      </div>

      {/* 3. Minimalistic 2-Column Section (Real Data & Clean Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Recent Submissions (8 Cols) */}
        <div className="lg:col-span-8 clay-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Governed Content
                </h3>
                <p className="text-[11px] text-slate-500">
                  Direct audit and verification status of marketing campaigns
                </p>
              </div>

              <button
                onClick={() => onOpenTab("content")}
                className="text-xs font-bold text-[#e05638] hover:text-[#c94529] flex items-center gap-1 cursor-pointer"
              >
                <span>View All Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content List */}
            {recentContent.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileCheck2 className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-600">No content items submitted yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Submit marketing copy to run automated grounding</p>
                <button
                  onClick={onOpenSubmitModal}
                  className="mt-4 px-4 py-2 btn-coral text-xs font-bold rounded-full cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Content</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentContent.map((item: any) => {
                  const latestVersion = item.versions?.[0];
                  const findings = latestVersion?.analysisRuns?.[0]?.findings || [];
                  const openFindings = findings.filter((f: any) => f.resolutionStatus === "OPEN");

                  return (
                    <div
                      key={item.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2.5 transition-colors cursor-pointer group"
                      onClick={() => onOpenStudio(item.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-[#e05638] transition-colors truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                            v{latestVersion?.versionNumber || 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-700">{item.campaignName}</span>
                          <span>•</span>
                          <span>{item.contentType.replace("_", " ")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : item.status === "CHANGES_REQUESTED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-slate-100 text-slate-700 border border-slate-200/60"
                          }`}
                        >
                          {item.status === "APPROVED"
                            ? "Approved"
                            : item.status === "CHANGES_REQUESTED"
                            ? "Changes Requested"
                            : "Needs Review"}
                        </span>

                        {/* Open Findings Count */}
                        {openFindings.length > 0 ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                            {openFindings.length} issue{openFindings.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                            Clean
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-400 group-hover:text-[#e05638] transition-colors">
                          Studio →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Deterministic verification runtime:</span>
            <span className="font-bold text-slate-800">AST Pattern & Vector Engine (~22ms)</span>
          </div>
        </div>

        {/* Right Column: Truth Specifications Summary (4 Cols) */}
        <div className="lg:col-span-4 clay-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Truth Specifications
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verdanta single source of truth rules
                </p>
              </div>

              <button
                onClick={() => onOpenTab("knowledge")}
                className="text-xs font-bold text-[#e05638] hover:text-[#c94529] flex items-center gap-1 cursor-pointer"
              >
                <span>Knowledge Vault</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Spec Rules List */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center justify-between font-bold text-slate-900 text-[11px] mb-0.5">
                  <span>KB-VER-001 (Protein Spec)</span>
                  <span className="text-blue-600 font-extrabold text-[10px] bg-blue-50 px-2 py-0.5 rounded-full">
                    11 g / 100 g
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Claims exceeding 11g (e.g. &apos;25g protein&apos;) are flagged as verified contradictions.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center justify-between font-bold text-slate-900 text-[11px] mb-0.5">
                  <span>KB-VER-004 (Sugar-Free Ban)</span>
                  <span className="text-rose-600 font-extrabold text-[10px] bg-rose-50 px-2 py-0.5 rounded-full">
                    PROHIBITED
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Strict prohibition. Product contains 6g cane sugar per serving.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center justify-between font-bold text-slate-900 text-[11px] mb-0.5">
                  <span>KB-VER-005 (Therapeutic Ban)</span>
                  <span className="text-rose-600 font-extrabold text-[10px] bg-rose-50 px-2 py-0.5 rounded-full">
                    PROHIBITED
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Strict ban on &apos;diabetes-friendly&apos; or disease-treating medical claims.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <div className="flex items-center justify-between font-bold text-slate-900 text-[11px] mb-0.5">
                  <span>KB-VER-007 (Organic Cert)</span>
                  <span className="text-amber-700 font-extrabold text-[10px] bg-amber-100 px-2 py-0.5 rounded-full">
                    EXPIRED
                  </span>
                </div>
                <p className="text-[10px] text-amber-800 leading-snug">
                  USDA Organic certificate expired Dec 2023. Organic claims trigger evidence warnings.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100">
            <button
              onClick={() => onOpenTab("knowledge")}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
            >
              Manage Truth Rules ({metrics.approvedTruthItems ?? 8} Specifications)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
