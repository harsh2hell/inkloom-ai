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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Governance Audit Trail</h2>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Lock className="w-3 h-3" />
              Append-Only Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped record of every draft submission, automated analysis, version revision, finding resolution, and human reviewer decision.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-2xs shrink-0">
          Total Logged Events: <strong className="text-slate-900">{logs.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Entity Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "ALL", label: "All Entities" },
            { id: "CONTENT_ITEM", label: "Content Items" },
            { id: "CONTENT_VERSION", label: "Versions" },
            { id: "FINDING", label: "Findings" },
            { id: "CREATOR_BRIEF", label: "Briefs" },
          ].map((ent) => (
            <button
              key={ent.id}
              onClick={() => setSelectedEntity(ent.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedEntity === ent.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
              }`}
            >
              {ent.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user, entity..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-2xs"
          />
        </div>
      </div>

      {/* Audit Log Timeline Container */}
      <div className="clay-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading Audit Log Trail...</div>
        ) : auditError ? (
          <div className="py-16 text-center text-xs p-6 space-y-3 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-900">Failed to Retrieve Audit Events</h3>
            <p className="text-xs text-rose-600">{auditError}</p>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No audit records match the current filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              let parsedDetails: any = null;
              try {
                parsedDetails = JSON.parse(log.details);
              } catch {
                parsedDetails = log.details;
              }

              return (
                <div key={log.id} className="p-4 sm:px-6 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        aria-label="Expand audit details"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {log.entityType}: {log.entityId.slice(0, 16)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pl-7 sm:pl-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                          {log.userName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{log.userName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({log.userRole})</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && (
                    <div className="mt-3.5 ml-7 p-3.5 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto shadow-inner">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-2 pb-1 border-b border-slate-800">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Audit Event Payload:</span>
                      </div>
                      <pre className="text-slate-300">
                        {typeof parsedDetails === "object"
                          ? JSON.stringify(parsedDetails, null, 2)
                          : parsedDetails}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
