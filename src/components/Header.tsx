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
      {/* Top Left: Menu Button + Black Monogram Logo + Dashboard Title (matching reference) */}
      <div className="flex items-center gap-3">
        {/* Menu Pill Button */}
        <button
          onClick={onOpenSidebar}
          className="w-10 h-10 rounded-full bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Black Circular Monogram Badge */}
        <div
          onClick={() => onSelectTab && onSelectTab("overview")}
          className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs cursor-pointer hover:scale-105 transition-transform"
          title="Inkloom AI"
        >
          <span>IL</span>
        </div>

        {/* Two-line Title: Reflects active page dynamically */}
        <div
          onClick={() => onSelectTab && onSelectTab("overview")}
          className="cursor-pointer select-none"
        >
          <div className="text-xs font-bold text-slate-900 leading-tight">
            {activeTab === "overview" && "Governance"}
            {activeTab === "submit" && "Submit Content"}
            {activeTab === "content" && "Content Reviews"}
            {activeTab === "studio" && "Correction Studio"}
            {activeTab === "knowledge" && "Knowledge Centre"}
            {activeTab === "briefs" && "Creator Briefs"}
            {activeTab === "audit" && "Audit Ledger"}
            {activeTab === "guide" && "Judge Guide"}
          </div>
          <div className="text-[11px] font-medium text-slate-400 leading-none">
            {activeTab === "overview" && "Dashboard"}
            {activeTab === "submit" && "Draft Verification"}
            {activeTab === "content" && "Pipeline & Audit"}
            {activeTab === "studio" && "Evidence Workspace"}
            {activeTab === "knowledge" && "Source of Truth"}
            {activeTab === "briefs" && "Drift Scorecard"}
            {activeTab === "audit" && "Compliance Trail"}
            {activeTab === "guide" && "Evaluation Script"}
          </div>
        </div>
      </div>

      {/* Top Right: Plus Button + Persona Badge + Search Bar (matching reference) */}
      <div className="flex items-center gap-3">
        {/* Circular Plus Button */}
        <button
          onClick={onOpenSubmitModal}
          className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors"
          title="Submit New Content"
          aria-label="Submit New Content"
        >
          <Plus className="w-4 h-4 text-slate-600" />
        </button>

        {/* Persona Profile Card (avatar + name + role + switcher dropdown) */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-full shadow-2xs transition-colors cursor-pointer"
            title="Click to switch active testing persona"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#e05638] text-white font-bold text-[10px] flex items-center justify-center">
                {getInitials(currentUser.name)}
              </div>
            )}

            <div className="text-left hidden sm:block pr-1">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">
                {getRoleShort(currentUser.role)}
              </div>
            </div>

            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {/* Persona Switcher Dropdown */}
          {showPersonaMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100 mb-1">
                Switch Demo Persona
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-slate-100 font-bold text-slate-900"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 truncate">
                      <div className="truncate text-slate-900 text-[11px] font-semibold">{user.name}</div>
                      <div className="text-[9px] text-slate-400">{getRoleShort(user.role)}</div>
                    </div>
                  </button>
                );
              })}

              {/* Register / Sign In Trigger */}
              <div className="pt-1.5 mt-1 border-t border-slate-100 space-y-1">
                {onOpenAuthModal && (
                  <button
                    onClick={() => {
                      setShowPersonaMenu(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-center text-xs font-bold text-[#e05638] bg-orange-50/80 hover:bg-orange-100/90 transition-colors cursor-pointer"
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
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-center text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Pill Input (matching reference) */}
        <div className="hidden md:flex items-center bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 shadow-2xs w-56 focus-within:w-64 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Start searching here ..."
            className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>
    </header>
  );
};
