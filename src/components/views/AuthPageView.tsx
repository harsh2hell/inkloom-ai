"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Palette,
  Sparkles,
  Eye,
  Mail,
  User,
  Building,
  ArrowRight,
  Lock,
  Shield,
  Crown,
  Cpu,
  Database,
  Check,
} from "lucide-react";
import { UserProfile } from "@/components/Navbar";

interface AuthPageViewProps {
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onUserRegistered: (newUser: UserProfile) => void;
}

/* Advanced geometric mesh — interconnected node graph + circuit traces from Fluxora */
function AdvancedMesh() {
  const nodes = [
    { x: 15, y: 12, r: 2.5, pulse: true },
    { x: 45, y: 8, r: 2, pulse: false },
    { x: 78, y: 15, r: 3, pulse: true },
    { x: 25, y: 35, r: 2, pulse: false },
    { x: 55, y: 30, r: 2.5, pulse: true },
    { x: 85, y: 32, r: 2, pulse: false },
    { x: 10, y: 55, r: 2, pulse: true },
    { x: 40, y: 52, r: 3, pulse: false },
    { x: 70, y: 50, r: 2, pulse: true },
    { x: 92, y: 55, r: 2.5, pulse: false },
    { x: 20, y: 72, r: 2.5, pulse: false },
    { x: 50, y: 75, r: 2, pulse: true },
    { x: 80, y: 70, r: 2, pulse: false },
    { x: 35, y: 90, r: 2, pulse: true },
    { x: 65, y: 88, r: 3, pulse: false },
    { x: 90, y: 85, r: 2, pulse: true },
  ];

  const connections = [
    [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
    [3, 4], [4, 5], [3, 6], [4, 7], [5, 9],
    [6, 7], [7, 8], [8, 9], [6, 10], [7, 11],
    [8, 12], [10, 11], [11, 12], [10, 13], [11, 14],
    [12, 15], [13, 14], [14, 15], [3, 7], [4, 8],
    [7, 10], [8, 11], [9, 12],
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map(([a, b], i) => (
          <line
            key={`conn-${i}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="white"
            strokeOpacity="0.05"
            strokeWidth="0.18"
          />
        ))}

        {nodes.map((n, i) => (
          <g key={`node-${i}`}>
            <circle cx={n.x} cy={n.y} r={n.r * 0.4} fill="white" opacity={n.pulse ? 0.3 : 0.12} />
            <circle cx={n.x} cy={n.y} r={n.r * 0.18} fill="white" opacity={n.pulse ? 0.7 : 0.35} />
          </g>
        ))}
      </svg>

      {/* Fading Perspective Grid */}
      <svg className="absolute bottom-0 left-0 w-full h-[45%] opacity-[0.03]" viewBox="0 0 400 200" preserveAspectRatio="none">
        {[...Array(15)].map((_, i) => (
          <line key={`hgrid-${i}`} x1="0" y1={i * 14} x2="400" y2={i * 14} stroke="white" strokeWidth="0.5" />
        ))}
        {[...Array(20)].map((_, i) => (
          <line key={`vgrid-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="200" stroke="white" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Ambient gradient glow */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[500px] h-[350px] bg-white/[0.015] rounded-full blur-[140px]" />
    </div>
  );
}

export const AuthPageView: React.FC<AuthPageViewProps> = ({
  availableUsers,
  onSelectUser,
  onUserRegistered,
}) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<string>("BRAND_ADMIN");
  const [regOrg, setRegOrg] = useState("Verdanta Foods");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email Sign In State
  const [loginEmail, setLoginEmail] = useState("");

  const roleOptions = [
    {
      id: "BRAND_OWNER",
      title: "Brand Owner / Executive Sponsor",
      desc: "Ultimate brand governance authority. Approves content, manages Truth Rules, and issues final publication clearances.",
      icon: Crown,
      pill: "Executive",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "BRAND_ADMIN",
      title: "Brand Content Admin",
      desc: "Full governance approval gate authority, reviews submitted copy, and manages Brand Truth Rules.",
      icon: ShieldCheck,
      pill: "Approver",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "AGENCY_CREATOR",
      title: "Creative Agency Partner",
      desc: "Drafts and submits campaigns for verification, executes AI corrections. Isolated draft history.",
      icon: Palette,
      pill: "Creator",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "EXTERNAL_CREATOR",
      title: "External Creator / Influencer",
      desc: "Adapts creator briefs for social channels, verifies policy adherence and adaptation drift.",
      icon: Sparkles,
      pill: "Influencer",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      id: "AUDITOR",
      title: "Assurance Auditor",
      desc: "Independent third-party compliance assurance with read-only cryptographic ledger access.",
      icon: Eye,
      pill: "Auditor",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          role: regRole,
          organization: regOrg.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register profile.");
      }

      const createdUser = data.user;
      if (typeof window !== "undefined") {
        localStorage.setItem("inkloom_active_user_id", createdUser.id);
      }
      onUserRegistered(createdUser);
    } catch (err: any) {
      setAuthError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setAuthError("Please enter your account email address.");
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Account not found with this email.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("inkloom_active_user_id", data.user.id);
      }
      onSelectUser(data.user);
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFastPersonaLogin = (user: UserProfile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("inkloom_active_user_id", user.id);
    }
    onSelectUser(user);
  };

  return (
    <main className="min-h-screen bg-[#050507] text-zinc-100 font-sans select-none flex flex-col lg:flex-row">
      {/* ════════════════════════════════════════════════════ */}
      {/* LEFT BRANDING PANEL (Fluxora Hero & Mesh)           */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col bg-[#030305] border-r border-white/[0.06] overflow-hidden p-12 xl:p-16 justify-between shrink-0">
        <AdvancedMesh />

        {/* Top: Logo & Version */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center text-xs tracking-tight shadow-lg">
            <span>IL</span>
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight block">inkloom</span>
            <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">
              GOVERNANCE v3.0
            </span>
          </div>
        </div>

        {/* Center: Hero copy & Trust Grid */}
        <div className="relative z-10 space-y-6 max-w-md my-auto py-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 tracking-[0.2em] uppercase">
              {"// BRAND_CONTENT_GOVERNANCE"}
            </span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-[-0.04em] leading-[1.15]">
            Marketing claims,
            <br />
            <span className="text-zinc-500">verified on ground truth.</span>
          </h2>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Evidence-backed claim verification, deterministic brand compliance, and closed-loop creator brief governance for modern marketing teams.
          </p>

          {/* 4 Trust Points (Matching Fluxora design) */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {[
              { icon: ShieldCheck, title: "100% Grounded Citations", desc: "KB registry source tracing" },
              { icon: Sparkles, title: "Closed-Loop Creator Briefs", desc: "4-eyes clearance protocol" },
              { icon: Lock, title: "Tenant Isolation", desc: "Cryptographic RLS isolation" },
              { icon: Database, title: "Zero Mock Data", desc: "Live PostgreSQL pooler" },
            ].map((tp) => {
              const Icon = tp.icon;
              return (
                <div
                  key={tp.title}
                  className="p-3 rounded-xl border border-white/[0.06] bg-[#09090b]/80 space-y-0.5"
                >
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{tp.title}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans">{tp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: Live Telemetry Row */}
        <div className="relative z-10 pt-6 border-t border-white/[0.04] flex items-center justify-between text-zinc-400 font-mono text-[10px]">
          <div>
            <p className="text-base font-extrabold text-white font-sans tracking-tight">100%</p>
            <p className="text-[9px] text-zinc-500 uppercase mt-0.5">AST Grounded</p>
          </div>
          <div className="w-[1px] h-6 bg-white/[0.06]" />
          <div>
            <p className="text-base font-extrabold text-white font-sans tracking-tight">0</p>
            <p className="text-[9px] text-zinc-500 uppercase mt-0.5">Mock Data</p>
          </div>
          <div className="w-[1px] h-6 bg-white/[0.06]" />
          <div>
            <p className="text-base font-extrabold text-white font-sans tracking-tight">5</p>
            <p className="text-[9px] text-zinc-500 uppercase mt-0.5">RBAC Personas</p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* RIGHT AUTH PANEL                                    */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center relative p-5 sm:p-8 lg:p-12 min-h-screen overflow-y-auto">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="w-full max-w-lg relative z-10 space-y-6 py-8">
          {/* Mobile-only brand mark */}
          <div className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-white text-black font-black flex items-center justify-center text-xs tracking-tight shadow-md">
              <span>IL</span>
            </div>
            <span className="text-sm font-black text-white tracking-tight font-sans">
              inkloom
            </span>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[9px] font-mono text-zinc-500 tracking-[0.2em] uppercase">
                {"// SECURE_PERSONA_AUTHENTICATION"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Welcome to Inkloom
            </h1>
            <p className="text-xs text-zinc-400 font-sans">
              Select an active verified persona or authenticate to enter your brand governance workspace.
            </p>
          </div>

          {/* Tab Switcher: 1-Click Personas vs Create Account */}
          <div className="flex items-center bg-[#09090b] p-1 rounded-xl border border-white/[0.06] text-xs font-mono">
            <button
              onClick={() => {
                setAuthMode("signin");
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                authMode === "signin"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              1-Click Persona Access
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                authMode === "signup"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Notice */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs font-medium text-rose-300 flex items-start gap-2">
              <span className="font-bold text-rose-400">!</span>
              <span>{authError}</span>
            </div>
          )}

          {/* ── TAB 1: 1-CLICK INSTANT PERSONAS & EMAIL SIGN IN ── */}
          {authMode === "signin" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                    {"// SELECT_GOVERNANCE_PERSONA"}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Evaluation Pool
                  </span>
                </div>

                {/* 5 Persona Cards in Sleek Dark Obsidian */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableUsers.map((user) => {
                    const roleObj = roleOptions.find((r) => r.id === user.role) || roleOptions[0];
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleFastPersonaLogin(user)}
                        className="p-3 rounded-xl bg-[#09090b] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.18] text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center gap-3 group shadow-md"
                      >
                        <div className="relative shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-9 h-9 rounded-lg object-cover border border-white/[0.1]"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center border border-white/[0.08]">
                              {user.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#09090b]" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-xs text-white group-hover:text-zinc-200 transition-colors truncate">
                              {user.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${roleObj.color}`}
                            >
                              {roleObj.pill}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {user.organization || "Verdanta Foods"}
                          </div>
                          <div className="text-[10px] text-zinc-400 group-hover:text-white font-mono mt-1 group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1">
                            <span>Sign in</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="w-full border-t border-white/[0.06]" />
                <span className="bg-[#050507] px-3 text-[10px] font-mono text-zinc-500 uppercase tracking-wider absolute">
                  {"// OR_SIGN_IN_WITH_EMAIL"}
                </span>
              </div>

              {/* Email Login Form */}
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. sarah.chen@verdantafoods.demo"
                      className="w-full h-10 bg-[#09090b] border border-white/[0.08] rounded-xl pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  <span>{isSubmitting ? "Authenticating..." : "Sign In to Workspace"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* ── TAB 2: CREATE NEW ACCOUNT / REGISTER PROFILE ── */}
          {authMode === "signup" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Elena Vance"
                      className="w-full h-10 bg-[#09090b] border border-white/[0.08] rounded-xl pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. elena@kineticagency.com"
                      className="w-full h-10 bg-[#09090b] border border-white/[0.08] rounded-xl pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
                  Organization / Agency Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    placeholder="e.g. Kinetic Agency / Verdanta Partner"
                    className="w-full h-10 bg-[#09090b] border border-white/[0.08] rounded-xl pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-all"
                  />
                </div>
              </div>

              {/* Select Role */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  Select Governance Role & Permissions
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = regRole === role.id;
                    return (
                      <div
                        key={role.id}
                        onClick={() => setRegRole(role.id)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-white/[0.08] border-white/30 shadow-xs"
                            : "bg-[#09090b] hover:bg-white/[0.03] border-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${role.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-white block truncate">
                              {role.title}
                            </span>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 font-sans">
                              {role.desc}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  <span>
                    {isSubmitting ? "Creating Account in PostgreSQL..." : "Register & Open Workspace"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Bottom Security Footer */}
          <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-zinc-400" />
              <span>Cryptographic Row-Level Isolation</span>
            </div>
            <span className="text-zinc-400">PostgreSQL Neon DB</span>
          </div>
        </div>
      </div>
    </main>
  );
};
