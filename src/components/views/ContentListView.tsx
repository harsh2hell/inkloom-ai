"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Filter,
} from "lucide-react";

interface ContentListProps {
  onOpenStudio: (contentId: string) => void;
  onOpenSubmitModal: () => void;
}

export const ContentListView: React.FC<ContentListProps> = ({
  onOpenStudio,
  onOpenSubmitModal,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      const json = await res.json();
      setItems(json || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Approved" };
      case "CHANGES_REQUESTED":
        return { bg: "bg-amber-100 text-amber-800 border-amber-200", label: "Changes Requested" };
      case "REJECTED":
        return { bg: "bg-red-100 text-red-800 border-red-200", label: "Rejected" };
      default:
        return { bg: "bg-blue-100 text-blue-800 border-blue-200", label: "Submitted" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Content Reviews & Governance Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track marketing drafts, version history, deterministic checks, and human approval status
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Content Submission</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading Content Pipeline...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No marketing content submitted yet. Click &quot;New Content Submission&quot; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Content Item / Campaign</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Current Version</th>
                  <th className="py-3 px-4">Submitter</th>
                  <th className="py-3 px-4">Verification Findings</th>
                  <th className="py-3 px-4">Governance Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((item) => {
                  const latestVersion = item.versions?.[0];
                  const latestRun = latestVersion?.analysisRuns?.[0];
                  const findings = latestRun?.findings || [];
                  const highSeverityCount = findings.filter((f: any) => f.severity === "HIGH").length;
                  const statusBadge = getStatusBadge(item.status);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => onOpenStudio(item.id)}
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{item.campaignName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {item.contentType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">v{item.currentVersionNumber}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.versions?.length} version{item.versions?.length === 1 ? "" : "s"} preserved
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{item.submitter?.name}</div>
                        <div className="text-[10px] text-slate-400">{item.submitter?.role}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {findings.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>100% Compliant</span>
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{findings.length} findings</span>
                            </span>
                            {highSeverityCount > 0 && (
                              <div className="text-[10px] text-red-600 font-medium">
                                {highSeverityCount} high risk / unverified
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenStudio(item.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors border border-indigo-200"
                        >
                          <span>Correction Studio</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
