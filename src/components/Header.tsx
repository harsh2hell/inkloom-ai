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
  BookOpen,
  SlidersHorizontal,
  FileText,
  Compass,
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
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSidebar,
  currentUser,
  availableUsers,
  onSelectUser,
  onOpenSubmitModal,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);

  const pillTabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "content", label: "Reviews", icon: FileCheck2 },
    { id: "audit", label: "Audit Logs", icon: History },
  ];

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
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-1 px-1">
      {/* Left: Mobile Menu Button + Neo-Modern Pill Navigation Bar */}
      <div className="flex items-center gap-2.5 w-full md:w-auto">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-xs"
          aria-label="Open dock menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Pill Navigation Bar (matching reference top bar) */}
        <div className="flex items-center bg-white/90 backdrop-blur-md rounded-full p-1.5 border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] gap-1 overflow-x-auto max-w-full">
          {pillTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab && onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? "bg-slate-100 text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Search Pill Button */}
          {showSearchInput ? (
            <div className="flex items-center px-2 py-0.5 bg-slate-50 rounded-full border border-slate-200 ml-1">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search claims & reviews..."
                className="text-xs bg-transparent outline-none w-36 text-slate-800 placeholder-slate-400 py-0.5"
                autoFocus
                onBlur={() => !searchQuery && setShowSearchInput(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors ml-1"
              aria-label="Search"
              title="Search claims & reviews"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Team Avatars Stack + Submit Content CTA + Active Profile Pill */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Real Team Persona Avatars Stack (interactive role switch) */}
        <div className="hidden sm:flex items-center bg-white/90 backdrop-blur-md px-2 py-1 rounded-full border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] gap-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1.5">
            Team:
          </span>
          <div className="flex -space-x-2 items-center">
            {availableUsers.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`relative group rounded-full transition-transform hover:scale-110 hover:z-20 ${
                    isSelected ? "ring-2 ring-indigo-600 z-10" : ""
                  }`}
                  title={`${user.name} (${getRoleShort(user.role)}) — Click to switch persona`}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-200 to-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center border-2 border-white">
                      {getInitials(user.name)}
                    </div>
                  )}

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-30">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-slate-300 text-[9px]">{getRoleShort(user.role)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button: + Submit Content (smooth pill) */}
        <button
          onClick={onOpenSubmitModal}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 hover:border-slate-300 px-4 py-2 rounded-full text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all hover:shadow-xs active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Add Content</span>
        </button>

        {/* Active User Avatar & Bell Pill */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1 pl-1.5 pr-2 rounded-full border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <div className="relative">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                {getInitials(currentUser.name)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="hidden lg:block text-left mr-1">
            <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 font-medium leading-none">
              {getRoleShort(currentUser.role)}
            </div>
          </div>

          {/* Bell Notification Button */}
          <button
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors relative"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
