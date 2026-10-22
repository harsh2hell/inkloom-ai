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

      {/* Floating Neo-Modern Soft Card Dock */}
      <aside
        className={`fixed lg:sticky top-4 lg:top-5 bottom-4 lg:bottom-auto left-4 lg:left-0 z-50 lg:z-10 w-[84px] py-5 px-3 bg-white/95 backdrop-blur-2xl rounded-[32px] sm:rounded-[36px] border border-slate-200/80 shadow-[0_16px_45px_rgba(15,23,42,0.06),0_2px_6px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } max-h-[calc(100vh-2.5rem)] shrink-0`}
      >
        {/* Top: Stark Jet-Black Monogram Logo + Quick Action */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <button
            onClick={() => {
              setActiveTab("overview");
              onClose();
            }}
            className="w-12 h-12 rounded-[22px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center font-black text-sm tracking-tight shadow-[0_6px_16px_rgba(15,23,42,0.25)] hover:scale-105 active:scale-95 transition-all group relative cursor-pointer ring-1 ring-white/10"
            title="Inkloom AI — Home"
            aria-label="Inkloom AI Home"
          >
            <div className="flex items-center tracking-tighter">
              <span className="font-extrabold text-[15px] text-white">IL</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e05638] ml-0.5 animate-pulse" />
            </div>

            {/* Floating Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-950/95 backdrop-blur-md text-white text-[11px] font-bold py-2 px-3.5 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-50 border border-slate-800">
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
                ? "bg-[#e05638] text-white shadow-[0_8px_24px_rgba(224,86,56,0.38)] scale-105 ring-2 ring-[#e05638]/20"
                : "bg-orange-50/80 hover:bg-orange-100/90 text-[#e05638] border border-orange-200/70 shadow-2xs hover:scale-105"
            }`}
            aria-label="Submit Content for Verification"
          >
            <Plus
              className={`w-5 h-5 transition-transform group-hover:rotate-90 duration-200 ${
                activeTab === "submit" ? "stroke-[2.6]" : "stroke-[2.2]"
              }`}
            />

            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-950/95 backdrop-blur-md text-white text-[11px] py-2 px-3.5 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-50 flex items-center gap-2 border border-slate-800">
              <span className="font-bold">New Verification</span>
              <span className="text-[10px] text-orange-400 font-semibold px-1.5 py-0.5 rounded-md bg-orange-950/60 border border-orange-800/60">
                Scan
              </span>
            </div>
          </button>

          {/* Soft divider */}
          <div className="w-8 h-[1px] bg-slate-200/80 my-1 rounded-full" />

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                    ? "bg-[#e05638] text-white shadow-[0_8px_24px_rgba(224,86,56,0.38)] scale-105"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-100/90 hover:scale-105"
                }`}
                aria-label={item.label}
              >
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? "stroke-[2.2] text-white" : "stroke-[1.8]"
                  }`}
                />

                {/* Floating Tooltip with full label + category */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-950/95 backdrop-blur-md text-white text-[11px] py-2 px-3.5 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-50 flex items-center gap-2 border border-slate-800">
                  <span className="font-bold">{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium">({item.category})</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Database Live Telemetry Pill */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="w-8 h-[1px] bg-slate-200/80 mb-1 rounded-full" />
          <div
            className="w-11 h-11 rounded-[20px] bg-slate-50 hover:bg-slate-100 border border-slate-200/90 flex items-center justify-center text-slate-600 transition-all hover:scale-105 cursor-pointer group relative shadow-2xs"
            title="Database & AI Telemetry"
          >
            <Database className="w-4 h-4 text-slate-600 stroke-[1.9]" />
            <span
              className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                health?.database?.reachable ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />

            {/* Health Telemetry Tooltip */}
            <div className="absolute left-16 bottom-0 bg-slate-950/95 backdrop-blur-md text-white text-[11px] p-3.5 rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-50 space-y-2 border border-slate-800 min-w-[210px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-slate-200">System Telemetry</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {health?.database?.reachable ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">PostgreSQL</span>
                <span className="text-emerald-400 font-medium">
                  {health?.database?.reachable ? `Connected (${health.database.latencyMs ?? 1}ms)` : "Unavailable"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Policy Engine</span>
                <span className="text-orange-400 font-medium">
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
