"use client";

import React from "react";
import {
  Menu,
  Plus,
  UserCheck,
  ChevronDown,
  Shield,
  Layers,
} from "lucide-react";
import { UserProfile } from "./Navbar";

interface HeaderProps {
  activeTab: string;
  onOpenSidebar: () => void;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenSubmitModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSidebar,
  currentUser,
  availableUsers,
  onSelectUser,
  onOpenSubmitModal,
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "overview":
        return { title: "Governance Overview", category: "Dashboard" };
      case "knowledge":
        return { title: "Brand Knowledge Centre", category: "Source of Truth" };
      case "content":
        return { title: "Content Reviews & Pipeline", category: "Verification" };
      case "studio":
        return { title: "Correction Studio", category: "Evidence Workspace" };
      case "briefs":
        return { title: "Creator Briefs & Drift", category: "Governance" };
      case "audit":
        return { title: "Audit Log & History", category: "Compliance Trail" };
      case "guide":
        return { title: "Judge Demo Script", category: "Evaluation Guide" };
      default:
        return { title: "Overview", category: "Workspace" };
    }
  };

  const { title, category } = getTabTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs truncate">
          <span className="text-slate-400 font-medium hidden sm:inline">{category}</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="font-semibold text-slate-900 text-sm truncate">{title}</h1>
        </div>
      </div>

      {/* Right: Workspace Tag, Persona Switcher & Primary CTA */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Workspace Tag (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 font-medium">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>Verdanta Foods</span>
        </div>

        {/* Persona Selector (Visibly labelled Demo Role Switcher) */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1">
          <span className="text-[10px] uppercase tracking-wider text-indigo-700 font-bold bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-200/60 hidden sm:inline">
            Demo Persona:
          </span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const selected = availableUsers.find((u) => u.id === e.target.value);
              if (selected) onSelectUser(selected);
            }}
            className="text-xs font-semibold text-slate-800 bg-transparent border-0 outline-none cursor-pointer focus:ring-0 pr-1 py-0.5"
            aria-label="Switch demo persona for testing role-based access"
          >
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role === "BRAND_ADMIN" ? "Brand Admin" : user.role === "AGENCY_CREATOR" ? "Agency Creator" : user.role === "EXTERNAL_CREATOR" ? "External Creator" : "Auditor"})
              </option>
            ))}
          </select>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onOpenSubmitModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Submit Content</span>
          <span className="xs:hidden">Submit</span>
        </button>
      </div>
    </header>
  );
};
