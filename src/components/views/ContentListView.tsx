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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
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
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/content");
      if (!res.ok) {
        throw new Error(`Failed to load content reviews (HTTP ${res.status})`);
      }
      const json = await res.json();
      setItems(json || []);
    } catch (e: any) {
      console.error("Content fetch error:", e);
      setError(e.message || "Failed to load content reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const formatContentType = (type: string) => {
    switch (type) {
      case "SOCIAL_CAPTION":
        return "Social Post";
      case "BLOG_POST":
        return "Blog Article";
      case "PACKAGING_COPY":
        return "Packaging";
      case "NEWSLETTER":
        return "Newsletter";
      case "PRODUCT_DESC":
        return "Product Desc";
      case "SCRIPT":
        return "Video Script";
      default:
        return type.toLowerCase().replace(/_/g, " ");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Approved",
          dot: "bg-emerald-500",
          pill: "bg-emerald-50/80 text-emerald-800 border-emerald-200/70",
        };
      case "CHANGES_REQUESTED":
        return {
          label: "Revisions",
          dot: "bg-amber-500",
          pill: "bg-amber-50/80 text-amber-800 border-amber-200/70",
        };
      case "REJECTED":
        return {
          label: "Rejected",
          dot: "bg-rose-500",
          pill: "bg-rose-50/80 text-rose-800 border-rose-200/70",
        };
      default:
        return {
          label: "In Review",
          dot: "bg-blue-500",
          pill: "bg-blue-50/80 text-blue-800 border-blue-200/70",
        };
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

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (st: string) => {
    setStatusFilter(st);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const totalCount = items.length;
  const inReviewCount = items.filter((i) => i.status === "SUBMITTED").length;
  const approvedCount = items.filter((i) => i.status === "APPROVED").length;
  const revisionsCount = items.filter((i) => i.status === "CHANGES_REQUESTED").length;

  return (
    <div className="space-y-4">
      {/* 1. Slim Header */}
      <div className="clay-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Governance Pipeline
            </h2>
            <span className="text-[10px] font-bold text-[#e05638] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 font-mono">
              {totalCount} Total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Audit ledger of marketing drafts, multi-version verifications, and compliance decisions.
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="btn-coral px-4 py-2 text-xs font-bold rounded-full shadow-2xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Submission</span>
        </button>
      </div>

      {/* 2. Slim Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "ALL", label: "All", count: totalCount },
            { id: "SUBMITTED", label: "In Review", count: inReviewCount },
            { id: "APPROVED", label: "Approved", count: approvedCount },
            { id: "CHANGES_REQUESTED", label: "Revisions", count: revisionsCount },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => handleFilterChange(st.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st.id
                  ? "bg-slate-950 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/70"
              }`}
            >
              <span>{st.label}</span>
              <span className={`ml-1.5 text-[10px] font-mono ${statusFilter === st.id ? "text-orange-300" : "text-slate-400"}`}>
                {st.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px] sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search campaign, author..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638] shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* 3. Slim, Sleek Data Table */}
      <div className="clay-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#e05638] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading pipeline records...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs p-6 space-y-3 max-w-md mx-auto">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Failed to Retrieve Content Pipeline</h3>
            <p className="text-xs text-rose-600">{error}</p>
            <button
              onClick={fetchContent}
              className="btn-coral px-4 py-1.5 text-xs font-semibold rounded-full shadow-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-600">No campaigns match your filter</p>
            <p className="text-[11px] text-slate-400">Try selecting another tab or clear your search input.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafbfe] text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Campaign & Title</th>
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-3">Submitter</th>
                  <th className="py-3 px-3">Policy Audit</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.map((item) => {
                  const latestVersion = item.versions?.[0];
                  const latestRun = latestVersion?.analysisRuns?.[0];
                  const findings = latestRun?.findings || [];
                  const openCount = findings.filter((f: any) => f.resolutionStatus === "OPEN").length;
                  const highRiskCount = findings.filter((f: any) => f.severity === "HIGH" && f.resolutionStatus === "OPEN").length;
                  const status = getStatusBadge(item.status);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      {/* Campaign & Title */}
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900 text-xs truncate max-w-[240px]" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[240px]">
                          {item.campaignName}
                        </div>
                      </td>

                      {/* Format */}
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {formatContentType(item.contentType)}
                        </span>
                      </td>

                      {/* Version */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          v{item.currentVersionNumber || 1}
                        </span>
                      </td>

                      {/* Submitter */}
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-semibold text-xs leading-tight">
                          {item.submitter?.name || "Alex Rivera"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.submitter?.organization || "Apex Creative"}
                        </div>
                      </td>

                      {/* Policy Findings */}
                      <td className="py-2.5 px-3">
                        {openCount === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/80">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Clean
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200/80">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>{openCount} Flagged</span>
                            {highRiskCount > 0 && (
                              <span className="text-[9px] text-rose-800 font-mono">
                                ({highRiskCount} High)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => onOpenStudio(item.id)}
                          className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 hover:bg-[#e05638] hover:text-white text-slate-700 transition-all cursor-pointer group-hover:bg-[#e05638] group-hover:text-white shadow-2xs whitespace-nowrap"
                        >
                          <span>Review</span>
                          <span className="ml-1 text-[10px]">→</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Slim Footer Pagination */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-[#fafbfe]">
            <div className="text-[11px] text-slate-400">
              Showing <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span>–
              <span className="font-bold text-slate-700">
                {Math.min(currentPage * itemsPerPage, filteredItems.length)}
              </span> of <span className="font-bold text-slate-700">{filteredItems.length}</span> records
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const isGap = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {isGap && <span className="text-slate-300 px-0.5">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`w-6 h-6 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            currentPage === p
                              ? "bg-slate-950 text-white shadow-2xs"
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
