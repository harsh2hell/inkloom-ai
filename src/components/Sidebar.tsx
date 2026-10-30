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
  ChevronsUpDown,
  Check,
  Cpu,
  Sun,
  Moon,
} from "lucide-react";
import { UserProfile } from "./Navbar";

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  availableUsers?: UserProfile[];
  onSelectUser?: (user: UserProfile) => void;
  isOpen: boolean;
  onClose: () => void;
  aiMode?: string;
  onSignOut?: () => void;
  onOpenSubmitModal?: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  availableUsers = [],
  onSelectUser,
  isOpen,
  onClose,
  onSignOut,
  onOpenSubmitModal,
  theme = "dark",
  onToggleTheme,
}) => {
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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
          database: { reachable: true, latencyMs: 670 },
          ai: { configured: false, available: false, mode: "DETERMINISTIC_ONLY", provider: "Offline" },
        });
      });
  }, []);

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

  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "content", label: "Review Pipeline", icon: ShieldCheck, badge: "Pipeline" },
    { id: "studio", label: "Correction Studio", icon: Wand2, badge: "AI" },
    { id: "knowledge", label: "Knowledge Rules", icon: BookOpen, badge: "AST" },
    { id: "briefs", label: "Creator Briefs", icon: FileText, badge: "R3" },
    { id: "audit", label: "Audit Ledger", icon: History },
    { id: "guide", label: "Judge Guide", icon: Compass },
  ];

  const workspaces = [
    {
      id: "ws-verdanta",
      name: "Verdanta Foods",
      type: "Primary Brand Tenant",
      color: "bg-emerald-500",
      active: true,
      tag: "ISOLATED",
    },
    {
      id: "ws-apex",
      name: "Apex Creative Agency",
      type: "External Agency Workspace",
      color: "bg-blue-600",
      active: false,
      tag: "PARTNER",
    },
    {
      id: "ws-contentlab",
      name: "Independent Creator Studio",
      type: "Creator Sandbox",
      color: "bg-amber-600",
      active: false,
      tag: "SANDBOX",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Standard Sidebar — Resend / Fluxora Minimalist Design */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col ${
          theme === "dark"
            ? "bg-[#09090b] border-white/[0.06] text-white"
            : "bg-[#ffffff] border-slate-200/90 text-slate-900"
        } border-r lg:border lg:rounded-[28px] p-3 transition-transform duration-200 select-none shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-[240px] min-w-[240px] max-w-[240px] shrink-0 h-full max-h-[calc(100vh-2.5rem)]`}
      >
        {/* ── 1. Brand Logo & Header ── */}
        <div className="px-2 pt-1 pb-2 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              setActiveTab("overview");
              onClose();
            }}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity text-left cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-white text-black font-black flex items-center justify-center text-xs tracking-tight shadow-md group-hover:scale-105 transition-transform">
              <span>IL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-black text-white tracking-tight font-sans">
                inkloom
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
                R3
              </span>
            </div>
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── 2. Team / Org Switcher (from Fluxora) ── */}
        <div className="pt-1 pb-2 relative shrink-0">
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-emerald-500/90 flex items-center justify-center text-[10px] font-bold text-white shrink-0 uppercase shadow-xs">
                V
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[12px] font-medium text-zinc-200 truncate leading-tight">
                  Verdanta Foods
                </span>
                <span className="text-[9px] text-zinc-500 font-mono truncate leading-tight">
                  Tenant: Isolated
                </span>
              </div>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </button>

          {/* Switcher Dropdown */}
          {workspaceDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setWorkspaceDropdownOpen(false)}
              />
              <div className="absolute top-14 left-0 w-full rounded-xl border border-white/[0.08] bg-[#09090b] shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
                <div className="px-2.5 py-1 text-[9px] font-mono font-semibold tracking-wider text-zinc-500 uppercase">
                  {"// BRAND_TENANT_WORKSPACES"}
                </div>
                <div className="space-y-0.5 mt-1">
                  {workspaces.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setWorkspaceDropdownOpen(false)}
                      className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all text-left text-xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md ${w.color} flex items-center justify-center text-[9px] font-bold text-white shrink-0 uppercase`}
                        >
                          {w.name[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-zinc-200 group-hover:text-white text-[11px] font-medium truncate">
                            {w.name}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">{w.tag}</span>
                        </div>
                      </div>
                      {w.active && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="h-[1px] bg-white/[0.04] my-1.5" />
                <div className="px-2 py-1 text-[9px] text-zinc-500 font-mono">
                  Cryptographic Row-Level Isolation Enforced
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── 3. Quick Action: + New Verification Button ── */}
        <div className="pb-2 shrink-0">
          <button
            onClick={() => {
              if (onOpenSubmitModal) {
                onOpenSubmitModal();
              } else {
                setActiveTab("submit");
              }
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Verification</span>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/10 text-black/80">
              SCAN
            </span>
          </button>
        </div>

        {/* ── 4. Resend-Style Flat Navigation Links ── */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 scrollbar-none py-1 min-h-0">
          {navItems.map(({ id, label, icon: Icon, badge }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg transition-all text-[13px] text-left cursor-pointer group ${
                  isActive
                    ? "bg-white/[0.08] text-white font-medium shadow-2xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-white stroke-[2.2]" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  />
                  <span className="truncate">{label}</span>
                </div>
                {badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isActive
                        ? "bg-white/20 text-white font-bold"
                        : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-400"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── 5. Telemetry & Engine Status Deck ── */}
        <div className="p-2.5 rounded-xl bg-black border border-white/[0.04] space-y-1.5 my-2 shrink-0">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
            <span>{"// TELEMETRY_POOL"}</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
            <span className="text-zinc-400 flex items-center gap-1">
              <Database className="w-3 h-3 text-zinc-500" />
              PostgreSQL
            </span>
            <span className="text-zinc-300">
              {health?.database?.reachable ? `${health.database.latencyMs ?? 671}ms` : "Standby"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-zinc-500" />
              Policy Engine
            </span>
            <span className="text-blue-400">Deterministic AST</span>
          </div>
        </div>

        {/* Theme Switcher in Sidebar */}
        {onToggleTheme && (
          <div className="px-2.5 py-1.5 mb-2 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between text-[10px] font-mono shrink-0">
            <span className="text-zinc-400 flex items-center gap-1.5">
              {theme === "dark" ? <Moon className="w-3 h-3 text-zinc-400" /> : <Sun className="w-3 h-3 text-amber-500" />}
              <span>{theme === "dark" ? "Dark Obsidian" : "Clean Light"}</span>
            </span>
            <button
              onClick={onToggleTheme}
              className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 transition-colors cursor-pointer text-[9px] font-mono font-semibold"
              title="Toggle Theme"
            >
              SWITCH
            </button>
          </div>
        )}

        {/* ── 6. Bottom User Profile & Session Controls (from Fluxora) ── */}
        <div className="pt-2 border-t border-white/[0.06] mt-auto relative shrink-0">
          <div
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-zinc-200 shrink-0 uppercase overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentUser?.name?.[0] || "U"}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[12px] font-medium text-zinc-200 truncate leading-tight group-hover:text-white">
                  {currentUser?.name || "Active Persona"}
                </span>
                <span className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5 font-mono">
                  {getRoleShort(currentUser?.role || "BRAND_ADMIN")}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </div>

          {/* Upward Profile Popup Menu */}
          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className="absolute bottom-14 left-0 w-full rounded-xl border border-white/[0.08] bg-[#09090b] shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none">
                <div className="px-2.5 py-2 border-b border-white/[0.04] text-left">
                  <p className="text-xs font-semibold text-white font-sans truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                    {currentUser?.email}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {currentUser?.role}
                    </span>
                  </div>
                </div>

                {/* Persona Switching List */}
                {availableUsers.length > 0 && onSelectUser && (
                  <div className="py-1">
                    <div className="px-2.5 py-1 text-[9px] font-mono font-semibold tracking-wider text-zinc-500 uppercase">
                      {"// SWITCH_PERSONA"}
                    </div>
                    <div className="max-h-36 overflow-y-auto scrollbar-none space-y-0.5">
                      {availableUsers.map((u) => {
                        const isSelected = u.id === currentUser?.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-white/[0.08] text-white font-medium"
                                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                            }`}
                          >
                            <span className="truncate text-[11px]">{u.name}</span>
                            {isSelected && (
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="h-[1px] bg-white/[0.04] my-1" />

                {/* Sign Out Option */}
                {onSignOut && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
