"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  SlidersHorizontal,
  FileText,
  History,
  Compass,
  X,
  User,
  Database,
  CheckCircle2,
} from "lucide-react";
import { UserProfile } from "./Navbar";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  aiMode?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isOpen,
  onClose,
  aiMode = "AI_ASSISTED",
}) => {
  const [health, setHealth] = useState<{
    database: { reachable: boolean; latencyMs?: number };
    ai: { configured: boolean; available: boolean; mode: string; provider: string };
  } | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
      })
      .catch(() => {
        setHealth({
          database: { reachable: false },
          ai: { configured: false, available: false, mode: "DETERMINISTIC_ONLY", provider: "Offline" },
        });
      })
      .finally(() => setHealthLoading(false));
  }, []);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "knowledge", label: "Knowledge Centre", icon: BookOpen },
    { id: "content", label: "Content Reviews", icon: FileCheck2 },
    { id: "studio", label: "Correction Studio", icon: SlidersHorizontal, highlight: true },
    { id: "briefs", label: "Creator Briefs", icon: FileText },
    { id: "audit", label: "Audit Log", icon: History },
  ];

  const secondaryNavItems = [
    { id: "guide", label: "Judge Guide", icon: Compass },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "BRAND_ADMIN":
        return { label: "Brand Admin", color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "AGENCY_CREATOR":
        return { label: "Agency Creator", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "EXTERNAL_CREATOR":
        return { label: "Creator", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "AUDITOR":
        return { label: "Auditor", color: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { label: role, color: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand & Workspace Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              setActiveTab("overview");
              onClose();
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight">Inkloom</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  AI Gov
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Claims & Policy Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Context Chip */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="font-semibold text-slate-700 truncate">Verdanta Foods</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Demo</span>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Governance
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Verification
            </div>
            <nav className="space-y-0.5">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* System Status Indicators (Backed by real /api/health) */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>PostgreSQL</span>
            </span>
            {healthLoading ? (
              <span className="text-slate-400 text-[10px]">Pinging...</span>
            ) : health?.database?.reachable ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Reachable ({health.database.latencyMs ?? "<1"}ms)
              </span>
            ) : (
              <span className="text-rose-600 font-medium flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Unreachable
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="truncate pr-1">
              {health?.ai?.available ? "AI-Assisted (Gemini)" : "Deterministic Rules"}
            </span>
            <span
              className={`font-semibold px-1.5 py-0.2 rounded border shrink-0 ${
                health?.ai?.available
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {health?.ai?.available ? "Gemini Live" : "Grounded"}
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate">{currentUser.organization}</div>
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between px-1">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-[10px] text-slate-400">Demo Persona Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
