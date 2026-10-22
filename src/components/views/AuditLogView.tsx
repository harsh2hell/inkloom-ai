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
} from "lucide-react";

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/audit?entityType=${selectedEntity}&limit=100`);
      const json = await res.json();
      setLogs(json || []);
    } catch (e) {
      console.error(e);
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
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (action.includes("OVERRIDE")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    if (action.includes("REJECTED") || action.includes("DISMISSED")) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Immutable Audit Trail</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              Audit Grade
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Every content submission, verification run, finding dismissal, policy override, and approval decision is recorded in an immutable audit ledger with timestamp and user attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            {logs.length} Total Events
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "ALL", label: "All Entities" },
            { id: "CONTENT_ITEM", label: "Content Submissions" },
            { id: "CONTENT_VERSION", label: "Revisions" },
            { id: "CONTENT_REVIEW", label: "Human Reviews" },
            { id: "ANALYSIS_RUN", label: "Analysis Runs" },
            { id: "FINDING", label: "Finding Resolutions" },
            { id: "CREATOR_BRIEF", label: "Creator Briefs" },
            { id: "CREATOR_SUBMISSION", label: "Creator Adaptations" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedEntity(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedEntity === cat.id
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, user, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading Audit Trail...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No audit log entries matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              let parsedDetails: any = null;
              try {
                parsedDetails = JSON.parse(log.details);
              } catch {
                parsedDetails = log.details;
              }

              return (
                <div key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="p-4 flex items-center justify-between cursor-pointer gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-slate-400 shrink-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>

                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border uppercase shrink-0 ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>

                      <div className="min-w-0">
                        <div className="text-slate-800 font-semibold truncate flex items-center gap-2">
                          <span>{log.userName}</span>
                          <span className="text-[11px] font-normal text-slate-400">({log.userRole})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Target: {log.entityType} ({log.entityId})
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-1 bg-slate-50 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Audit Record Metadata & Payload:</span>
                      </div>
                      <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
                        {JSON.stringify(parsedDetails, null, 2)}
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
