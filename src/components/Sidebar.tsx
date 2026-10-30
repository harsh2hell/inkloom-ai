"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Wand2,
  BookOpen,
  FileText,
  History,
  Compass,
  X,
  Database,
  Plus,
  LogOut,
} from "lucide-react";
import { UserProfile } from "./Navbar";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  aiMode?: string;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onSignOut,
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
    { id: "overview", label: "Dashboard", category: "Overview", icon: LayoutDashboard },
    { id: "content", label: "Review Pipeline", category: "Governance", icon: ShieldCheck },
    { id: "studio", label: "Correction Studio", category: "AI Studio", icon: Wand2 },
    { id: "knowledge", label: "Knowledge Rules", category: "Grounding", icon: BookOpen },
    { id: "briefs", label: "Creator Briefs", category: "Ad Drift", icon: FileText },
    { id: "audit", label: "Audit Ledger", category: "Compliance", icon: History },
    { id: "guide", label: "Judge Guide", category: "Demo Script", icon: Compass },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Floating Neo-Modern Soft Card Dock (Dark Obsidian Mode matching Fluxora) */}
      <aside
        className={`fixed lg:sticky top-4 lg:top-5 bottom-4 lg:bottom-auto left-4 lg:left-0 z-50 lg:z-10 w-[84px] py-5 px-3 bg-[#09090b]/95 backdrop-blur-2xl rounded-[32px] sm:rounded-[36px] border border-white/[0.08] shadow-[0_16px_45px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } max-h-[calc(100vh-2.5rem)] shrink-0`}
      >
        {/* Top: Stark Monogram Logo + Quick Action */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <button
            onClick={() => {
              setActiveTab("overview");
              onClose();
            }}
            className="w-12 h-12 rounded-[22px] bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white flex items-center justify-center font-black text-sm tracking-tight shadow-xl hover:scale-105 active:scale-95 transition-all group relative cursor-pointer ring-1 ring-white/10"
            title="Inkloom AI — Home"
            aria-label="Inkloom AI Home"
          >
            <div className="flex items-center tracking-tighter">
              <span className="font-extrabold text-[15px] text-white">IL</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />
            </div>

            {/* Floating Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-950/95 backdrop-blur-md text-white text-[11px] font-bold py-2 px-3.5 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-50 border border-white/[0.1]">
              Inkloom AI Home
            </div>
          </button>

          {/* Dedicated New Verification / Submit Floating Button */}
          <button
            onClick={() => {
              setActiveTab("submit");
              onClose();
            }}
            className={`w-12 h-12 rounded-[22px] flex items-center justify-center transition-all duration-200 group cursor-pointer relative ${
              activeTab === "submit"
                ? "bg-white text-black shadow-lg scale-105 ring-2 ring-white/20"
                : "bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] shadow-2xs hover:scale-105"
            }`}
            aria-label="Submit Content for Verification"
          >
            <Plus
              className={`w-5 h-5 transition-transform group-hover:rotate-90 duration-200 ${
                activeTab === "submit" ? "stroke-[2.6]" : "stroke-[2.2]"
              }`}
            />

            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-950/95 backdrop-blur-md text-white text-[11px] py-2 px-3.5 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-50 flex items-center gap-2 border border-white/[0.1]">
              <span className="font-bold">New Verification</span>
              <span className="text-[10px] text-blue-400 font-semibold px-1.5 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/60">
                Scan
              </span>
            </div>
          </button>

          {/* Soft divider */}
          <div className="w-8 h-[1px] bg-white/[0.08] my-1 rounded-full" />

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.1]"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Vertical Navigation Icons */}
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
                className={`relative w-12 h-12 rounded-[22px] flex items-center justify-center transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? "bg-white text-black shadow-lg scale-105"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:scale-105"
                }`}
                aria-label={item.label}
              >
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? "stroke-[2.2] text-black" : "stroke-[1.8]"
                  }`}
                />

                {/* Floating Tooltip with full label + category */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-950/95 backdrop-blur-md text-white text-[11px] py-2 px-3.5 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-50 flex items-center gap-2 border border-white/[0.1]">
                  <span className="font-bold">{item.label}</span>
                  <span className="text-[10px] text-zinc-400 font-medium">({item.category})</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Database Live Telemetry Pill & Sign Out Button */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="w-8 h-[1px] bg-white/[0.08] mb-0.5 rounded-full" />

          {/* Sign Out Action Button */}
          {onSignOut && (
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-11 h-11 rounded-[20px] bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/20 flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-all hover:scale-105 cursor-pointer group relative shadow-2xs"
              title="Sign Out of Dashboard"
              aria-label="Sign Out of Dashboard"
            >
              <LogOut className="w-4 h-4 stroke-[1.9]" />

              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-950/95 backdrop-blur-md text-white text-[11px] font-bold py-2 px-3.5 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-50 border border-white/[0.1]">
                Sign Out
              </div>
            </button>
          )}

          <div
            className="w-11 h-11 rounded-[20px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-zinc-400 transition-all hover:scale-105 cursor-pointer group relative shadow-2xs"
            title="Database & AI Telemetry"
          >
            <Database className="w-4 h-4 text-zinc-400 stroke-[1.9]" />
            <span
              className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#09090b] ${
                health?.database?.reachable ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
              }`}
            />

            {/* Health Telemetry Tooltip */}
            <div className="absolute left-16 bottom-0 bg-zinc-950/95 backdrop-blur-md text-white text-[11px] p-3.5 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-50 space-y-2 border border-white/[0.1] min-w-[210px]">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
                <span className="font-bold text-zinc-200">System Telemetry</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  {health?.database?.reachable ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400">PostgreSQL</span>
                <span className="text-emerald-400 font-medium">
                  {health?.database?.reachable ? `Connected (${health.database.latencyMs ?? 1}ms)` : "Unavailable"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400">Policy Engine</span>
                <span className="text-blue-400 font-medium">
                  {health?.ai?.available ? "Gemini 2.5 Flash" : "Deterministic Rules"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
