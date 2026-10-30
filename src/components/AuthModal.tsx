"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Building,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Palette,
  Eye,
  Crown,
  Check,
} from "lucide-react";
import { UserProfile } from "./Navbar";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onUserRegistered?: (newUser: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  availableUsers,
  onSelectUser,
  onUserRegistered,
}) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<string>("AGENCY_CREATOR");
  const [regOrg, setRegOrg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email Sign In State
  const [loginEmail, setLoginEmail] = useState("");

  if (!isOpen) return null;

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
      onSelectUser(createdUser);
      if (onUserRegistered) onUserRegistered(createdUser);
      localStorage.setItem("inkloom_active_user_id", createdUser.id);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
        throw new Error(data.error || "Account not found.");
      }

      onSelectUser(data.user);
      localStorage.setItem("inkloom_active_user_id", data.user.id);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonaSelect = (user: UserProfile) => {
    onSelectUser(user);
    localStorage.setItem("inkloom_active_user_id", user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-[#09090b] rounded-2xl border border-white/[0.08] max-w-xl w-full p-6 space-y-5 text-zinc-100 shadow-2xl relative">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-xs shadow-xs">
              IL
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight font-sans">
                {authMode === "signin" ? "Sign In & Switch Persona" : "Create New Persona"}
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">
                {authMode === "signin"
                  ? "Select a pre-configured persona or sign in to your workspace"
                  : "Register as a Brand Admin, Creative Agency, or Independent Creator"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex items-center bg-black p-1 rounded-xl border border-white/[0.06] text-xs font-mono">
          <button
            onClick={() => {
              setAuthMode("signin");
              setAuthError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              authMode === "signin"
                ? "bg-white text-black shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign In / Demo Personas
          </button>
          <button
            onClick={() => {
              setAuthMode("signup");
              setAuthError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              authMode === "signup"
                ? "bg-white text-black shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Register New Profile
          </button>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/30 text-rose-300 border border-rose-500/30 text-xs font-medium">
            {authError}
          </div>
        )}

        {/* TAB 1: SIGN IN / PERSONA SWITCHER */}
        {authMode === "signin" && (
          <div className="space-y-4">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {"// 1_CLICK_PERSONA_ACCESS"}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableUsers.map((user) => {
                const roleObj = roleOptions.find((r) => r.id === user.role) || roleOptions[0];
                const isSelected = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handlePersonaSelect(user)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-white/[0.08] border-white/30 shadow-xs"
                        : "bg-black/60 hover:bg-white/[0.04] border-white/[0.06] hover:border-white/[0.15]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-9 h-9 rounded-lg object-cover border border-white/[0.08]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center border border-white/[0.08]">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#09090b]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-white truncate">
                          {user.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${roleObj.color}`}
                        >
                          {roleObj.pill}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {user.organization || user.role}
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Email Direct Login Form */}
            <div className="pt-3 border-t border-white/[0.04]">
              <form onSubmit={handleEmailLogin} className="space-y-2">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  {"// SIGN_IN_WITH_EMAIL"}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. sarah.chen@verdantafoods.demo"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-black border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !loginEmail.trim()}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    Enter Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW ACCOUNT */}
        {authMode === "signup" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-black border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. elena@kineticagency.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-black border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
                Organization / Brand Name
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={regOrg}
                  onChange={(e) => setRegOrg(e.target.value)}
                  placeholder="e.g. Apex Creative or Verdanta Foods"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-black border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                Select Workspace Role & Permissions
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = regRole === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setRegRole(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-0.5 ${
                        isSelected
                          ? "bg-white/[0.08] border-white/30 shadow-xs"
                          : "bg-black/60 hover:bg-white/[0.03] border-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-zinc-500"}`} />
                          <span className="text-xs font-semibold text-white">{opt.title}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 line-clamp-1 font-sans">
                        {opt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !regName.trim() || !regEmail.trim()}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-sm"
            >
              <span>{isSubmitting ? "Creating Profile..." : "Register & Enter Isolated Workspace"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
