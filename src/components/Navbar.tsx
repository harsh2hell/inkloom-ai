"use client";

import React from "react";
import { ShieldCheck, UserCheck, Sparkles, PlusCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "BRAND_OWNER" | "BRAND_ADMIN" | "AGENCY_CREATOR" | "EXTERNAL_CREATOR" | "AUDITOR";
  organization: string;
  avatarUrl?: string | null;
}

interface NavbarProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenSubmitModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  aiMode: "AI_ASSISTED" | "DETERMINISTIC";
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  availableUsers,
  onSelectUser,
  onOpenSubmitModal,
  activeTab,
  setActiveTab,
  aiMode,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "BRAND_OWNER":
        return { bg: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "Brand Owner / Executive" };
      case "BRAND_ADMIN":
        return { bg: "bg-purple-100 text-purple-800 border-purple-200", label: "Brand Admin / Reviewer" };
      case "AGENCY_CREATOR":
        return { bg: "bg-blue-100 text-blue-800 border-blue-200", label: "Agency Creator" };
      case "EXTERNAL_CREATOR":
        return { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "External Creator" };
      case "AUDITOR":
        return { bg: "bg-amber-100 text-amber-800 border-amber-200", label: "Read-only Auditor" };
      default:
        return { bg: "bg-gray-100 text-gray-800 border-gray-200", label: role };
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white tracking-wide">CODEAXIS HACKATHON ROUND 2</span>
          <span className="text-slate-600">|</span>
          <span className="text-indigo-400 font-medium">Team ERROR 404</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Verdanta Foods Demo Workspace (Fictional Brand)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300">
              {aiMode === "AI_ASSISTED" ? "Gemini 3.8 Flash + Deterministic Engine" : "Deterministic Engine (No Key Required)"}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span>PostgreSQL Active</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">Inkloom</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI Gov
              </span>
            </div>
            <p className="text-xs text-slate-500">Traceable Marketing Governance</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-sm">
          {[
            { id: "overview", label: "Overview" },
            { id: "knowledge", label: "Knowledge Centre" },
            { id: "content", label: "Content Reviews" },
            { id: "studio", label: "Correction Studio" },
            { id: "briefs", label: "Creator Briefs" },
            { id: "audit", label: "Audit Log" },
            { id: "guide", label: "Judge Guide" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User Role Switcher & Action */}
        <div className="flex items-center gap-3">
          {/* Active Role Selector for Hackathon Judges */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <UserCheck className="w-4 h-4 text-slate-500" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium leading-none">TEST AS ROLE:</div>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = availableUsers.find((x) => x.id === e.target.value);
                  if (u) onSelectUser(u);
                }}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({getRoleBadge(u.role).label})
                  </option>
                ))}
              </select>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentBadge.bg}`}>
              {currentBadge.label.split(" ")[0]}
            </span>
          </div>

          {/* New Submission CTA */}
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow-indigo-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Content</span>
          </button>
        </div>
      </div>
    </header>
  );
};
