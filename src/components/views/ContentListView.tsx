"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
        return { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "CHANGES_REQUESTED":
        return { label: "Changes Requested", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "REJECTED":
        return { label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: "Submitted", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.campaignName.toLowerCase().includes(search.toLowerCase()) ||
      item.submitter?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Content Reviews & Governance Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor marketing drafts, multi-version audit history, deterministic findings, and reviewer decisions.
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Content Submission</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "ALL", label: `All (${items.length})` },
            { id: "SUBMITTED", label: `Submitted (${items.filter((i) => i.status === "SUBMITTED").length})` },
            { id: "APPROVED", label: `Approved (${items.filter((i) => i.status === "APPROVED").length})` },
            { id: "CHANGES_REQUESTED", label: `Changes (${items.filter((i) => i.status === "CHANGES_REQUESTED").length})` },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns, authors..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="saas-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading Content Pipeline...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No marketing content matches the selected filter. Click &ldquo;New Content Submission&rdquo; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Campaign & Title</th>
                  <th className="py-2.5 px-4">Format</th>
                  <th className="py-2.5 px-4">Version</th>
                  <th className="py-2.5 px-4">Submitter</th>
                  <th className="py-2.5 px-4">Policy Findings</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((item) => {
                  const latestVersion = item.versions?.[0];
                  const latestRun = latestVersion?.analysisRuns?.[0];
                  const findings = latestRun?.findings || [];
                  const highRisk = findings.filter((f: any) => f.severity === "HIGH").length;
                  const status = getStatusBadge(item.status);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-400">{item.campaignName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.contentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        v{item.currentVersionNumber || 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">
                          {item.submitter?.name || "Agency Creator"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.submitter?.organization || "Apex Creative"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {findings.length === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Clean
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[10px] border border-rose-200">
                              {findings.length} findings
                            </span>
                            {highRisk > 0 && (
                              <span className="text-[10px] text-rose-600 font-medium">
                                ({highRisk} high risk)
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${status.color}`}>
                          {status.label}
                        </span>
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
