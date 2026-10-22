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
  Database,
  Settings,
  Sparkles,
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
}) => {
  const [health, setHealth] = useState<{
    database: { reachable: boolean; latencyMs?: number };
    ai: { configured: boolean; available: boolean; mode: string; provider: string };
  } | null>(null);

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
      });
  }, []);

  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "content", label: "Content Reviews & Pipeline", icon: FileCheck2 },
    { id: "studio", label: "Correction Studio", icon: SlidersHorizontal, highlight: true },
    { id: "knowledge", label: "Brand Knowledge Centre", icon: BookOpen },
    { id: "briefs", label: "Creator Briefs", icon: FileText },
    { id: "audit", label: "Compliance Audit Trail", icon: History },
    { id: "guide", label: "Judge Evaluation Guide", icon: Compass },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Desktop Neo-Modern Vertical Dock Rail / Mobile Drawer */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-5 bottom-0 lg:bottom-auto left-0 z-50 lg:z-10 w-20 lg:w-20 h-full lg:h-[calc(100vh-2.5rem)] bg-white rounded-none lg:rounded-[30px] border-r lg:border border-slate-200/70 shadow-[0_6px_28px_rgba(15,23,42,0.04)] flex flex-col items-center py-5 justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Brand Logo Pill (matching the hi pill in reference image) */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("overview");
              onClose();
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center font-bold text-base shadow-[0_6px_18px_rgba(99,102,241,0.35)] transition-transform hover:scale-105 active:scale-95 group relative"
            title="Inkloom AI — Home"
            aria-label="Inkloom AI Home"
          >
            <div className="flex items-center gap-0.5">
              <span className="tracking-tighter font-extrabold text-sm">i</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white mb-2"></span>
            </div>
            {/* Tooltip */}
            <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50">
              Inkloom AI
            </span>
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Vertical Icon Navigation */}
        <nav className="flex flex-col items-center gap-2 my-auto py-2">
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
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150 group ${
                  isActive
                    ? "bg-slate-100/90 text-indigo-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
                aria-label={item.label}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-600 stroke-[2.2]" : "stroke-[1.8]"}`} />

                {item.highlight && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}

                {/* Floating Tooltip */}
                <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Settings / Database Health Pill Button */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer group relative"
            title="Database & AI Health"
          >
            <Database className="w-4 h-4" />
            <span
              className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                health?.database?.reachable ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />

            {/* Health Tooltip */}
            <div className="absolute left-14 bottom-0 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 space-y-1">
              <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">System Health</div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${health?.database?.reachable ? "bg-emerald-400" : "bg-rose-400"}`} />
                <span>PostgreSQL: {health?.database?.reachable ? "Live Connected" : "Offline"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>AI Engine: {health?.ai?.available ? "Gemini 2.5 Flash" : "Deterministic"}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
