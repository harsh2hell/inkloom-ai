"use client";

import React, { useState } from "react";
import {
  Menu,
  Plus,
  Search,
  Bell,
  LayoutDashboard,
  FileCheck2,
  History,
  Shield,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { UserProfile } from "./Navbar";

interface HeaderProps {
  activeTab: string;
  onOpenSidebar: () => void;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenSubmitModal: () => void;
  onSelectTab?: (tab: string) => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSidebar,
  currentUser,
  availableUsers,
  onSelectUser,
  onOpenSubmitModal,
  onSelectTab,
  onOpenAuthModal,
  onSignOut,
  theme = "dark",
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleShort = (role: string) => {
    switch (role) {
      case "BRAND_OWNER":
        return "Brand Owner";
      case "BRAND_ADMIN":
        return "Brand Admin";
      case "AGENCY_CREATOR":
        return "Agency Creator";
      case "EXTERNAL_CREATOR":
        return "Creator";
      case "AUDITOR":
        return "Auditor";
      default:
        return role;
    }
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 px-1 relative">
      {/* Top Left: Menu Button + White Monogram Logo + Dashboard Title (matching Fluxora) */}
      <div className="flex items-center gap-3">
        {/* Menu Pill Button (Mobile / Tablet drawer trigger) */}
        <button
          onClick={onOpenSidebar}
          className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-2xs flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Circular Monogram Badge */}
        <div
          onClick={() => onSelectTab && onSelectTab("overview")}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs tracking-tight shadow-md cursor-pointer hover:scale-105 transition-transform"
          title="Inkloom AI"
        >
          <span>IL</span>
        </div>

        {/* Two-line Title: Reflects active page dynamically */}
        <div
          onClick={() => onSelectTab && onSelectTab("overview")}
          className="cursor-pointer select-none"
        >
          <div className="text-xs font-bold text-white leading-tight font-sans">
            {activeTab === "overview" && "Governance"}
            {activeTab === "submit" && "Submit Content"}
            {activeTab === "content" && "Content Reviews"}
            {activeTab === "studio" && "Correction Studio"}
            {activeTab === "knowledge" && "Knowledge Centre"}
            {activeTab === "briefs" && "Creator Briefs"}
            {activeTab === "audit" && "Audit Ledger"}
            {activeTab === "guide" && "Judge Guide"}
          </div>
          <div className="text-[11px] font-mono text-zinc-500 leading-none">
            {activeTab === "overview" && "// OVERVIEW_DASHBOARD"}
            {activeTab === "submit" && "// DRAFT_VERIFICATION"}
            {activeTab === "content" && "// PIPELINE_AND_AUDIT"}
            {activeTab === "studio" && "// EVIDENCE_WORKSPACE"}
            {activeTab === "knowledge" && "// SOURCE_OF_TRUTH"}
            {activeTab === "briefs" && "// DRIFT_SCORECARD"}
            {activeTab === "audit" && "// COMPLIANCE_TRAIL"}
            {activeTab === "guide" && "// EVALUATION_SCRIPT"}
          </div>
        </div>
      </div>

      {/* Top Right: Plus Button + Persona Badge (matching Fluxora) */}
      <div className="flex items-center gap-3">
        {/* Circular Plus Button */}
        <button
          onClick={onOpenSubmitModal}
          className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] shadow-2xs flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Submit New Content"
          aria-label="Submit New Content"
        >
          <Plus className="w-4 h-4 text-zinc-300" />
        </button>

        {/* Light / Dark Mode Switch */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-2xs ${
              theme === "dark"
                ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-amber-400"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
            }`}
            title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle Light and Dark Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Persona Profile Card (avatar + name + role + switcher dropdown) */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-2.5 py-1.5 rounded-full shadow-2xs transition-colors cursor-pointer"
            title="Click to switch active testing persona"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-800 text-white font-bold text-[10px] flex items-center justify-center">
                {getInitials(currentUser.name)}
              </div>
            )}

            <div className="text-left hidden sm:block pr-1 font-sans">
              <div className="text-xs font-semibold text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono leading-none">
                {getRoleShort(currentUser.role)}
              </div>
            </div>

            <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:block" />
          </button>

          {/* Persona Switcher Dropdown */}
          {showPersonaMenu && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-[#09090b] rounded-2xl border border-white/[0.1] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider px-2.5 py-1.5 border-b border-white/[0.06] mb-1">
                {"// SWITCH_PERSONA"}
              </div>
              {availableUsers.map((user) => {
                const isSelected = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white/[0.1] font-bold text-white"
                        : "hover:bg-white/[0.04] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 truncate font-sans">
                      <div className="truncate text-white text-[11px] font-semibold">{user.name}</div>
                      <div className="text-[9px] font-mono text-zinc-500">{getRoleShort(user.role)}</div>
                    </div>
                  </button>
                );
              })}

              {/* Register / Sign In Trigger */}
              <div className="pt-2 mt-1 border-t border-white/[0.06] space-y-1 font-sans">
                {onOpenAuthModal && (
                  <button
                    onClick={() => {
                      setShowPersonaMenu(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-center text-xs font-bold text-black bg-white hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Register New Profile</span>
                  </button>
                )}

                {onSignOut && (
                  <button
                    onClick={() => {
                      setShowPersonaMenu(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-center text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer font-mono text-[11px]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Search Input (matching Fluxora) */}
        <div className="hidden md:flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full px-3.5 py-1.5 shadow-2xs w-48 focus-within:w-60 transition-all">
          <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search truth rules..."
            className="w-full text-xs bg-transparent outline-none text-zinc-200 placeholder-zinc-500 font-mono text-[11px]"
          />
        </div>
      </div>
    </header>
  );
};
