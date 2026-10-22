"use client";

import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  ChevronDown,
  ChevronRight,
  Code2,
  Lock,
} from "lucide-react";

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setAuditError(null);
      const res = await fetch(`/api/audit?entityType=${selectedEntity}&limit=100`);
      if (!res.ok) {
        throw new Error(`Failed to load audit events (HTTP ${res.status})`);
      }
      const json = await res.json();
      setLogs(json || []);
    } catch (e: any) {
      console.error("Audit log fetch error:", e);
      setAuditError(e.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedEntity]);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.userRole.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: string) => {
    if (action.includes("APPROVED")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (action.includes("OVERRIDE")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (action.includes("REJECTED") || action.includes("DISMISSED")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (action.includes("SUBMITTED")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Governance Audit Trail</h2>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Lock className="w-3 h-3" />
              Append-Only Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped record of every draft submission, automated analysis, version revision, finding resolution, and human reviewer decision.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg shrink-0">
          Total Logged Events: <strong className="text-slate-900">{logs.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Entity Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "ALL", label: "All Entities" },
            { id: "CONTENT_ITEM", label: "Submissions" },
            { id: "CONTENT_VERSION", label: "Versions" },
            { id: "CONTENT_REVIEW", label: "Reviews" },
            { id: "ANALYSIS_RUN", label: "Analysis Runs" },
            { id: "CREATOR_SUBMISSION", label: "Creator Drift Checks" },
          ].map((ent) => (
            <button
              key={ent.id}
              onClick={() => setSelectedEntity(ent.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedEntity === ent.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {ent.label}
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
            placeholder="Search action, actor, ID..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="saas-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading Audit Log Trail...</div>
        ) : auditError ? (
          <div className="py-16 text-center text-xs p-6 space-y-3 max-w-md mx-auto">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Failed to Retrieve Audit Log</h3>
            <p className="text-xs text-rose-600">{auditError}</p>
            <button
              onClick={fetchLogs}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
            >
              Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No audit records found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Entity</th>
                  <th className="py-2.5 px-4">Timestamp (UTC)</th>
                  <th className="py-2.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  let parsedDetails: any = null;
                  try {
                    parsedDetails = JSON.parse(log.details);
                  } catch {
                    parsedDetails = log.details;
                  }

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${getActionBadge(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{log.userName}</div>
                          <div className="text-[10px] text-slate-400">{log.userRole}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {log.entityType}
                          </span>
                          <span className="block text-[10px] font-mono text-slate-400 truncate max-w-[120px] mt-0.5">
                            {log.entityId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(log.createdAt).toISOString().replace("T", " ").substring(0, 19)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-slate-400 hover:text-slate-700 p-1">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 inline" />
                            ) : (
                              <ChevronRight className="w-4 h-4 inline" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded JSON Inspector */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={5} className="py-3 px-4">
                            <div className="p-3 bg-slate-900 rounded-lg text-slate-100 font-mono text-[11px] overflow-x-auto shadow-inner">
                              <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1.5 mb-1.5 border-b border-slate-800">
                                <span>Audit Event ID: {log.id}</span>
                                <span>Actor ID: {log.userId}</span>
                              </div>
                              <pre>{JSON.stringify(parsedDetails, null, 2)}</pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
