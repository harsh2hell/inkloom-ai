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
  Lock,
  Layers,
  Palette,
  Eye,
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
      id: "BRAND_ADMIN",
      title: "Brand Content Admin",
      desc: "Full governance approval gate authority, reviews submitted copy, and manages Brand Truth Rules.",
      icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      id: "AGENCY_CREATOR",
      title: "Creative Agency Partner",
      desc: "Drafts and submits campaigns for verification, executes AI corrections. Isolated draft history.",
      icon: Palette,
      color: "text-[#e05638] bg-orange-50 border-orange-200",
    },
    {
      id: "EXTERNAL_CREATOR",
      title: "External Creator / Influencer",
      desc: "Adapts creator briefs for social channels, verifies policy adherence and adaptation drift.",
      icon: Sparkles,
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    {
      id: "AUDITOR",
      title: "Assurance Auditor",
      desc: "Independent third-party compliance assurance with read-only cryptographic ledger access.",
      icon: Eye,
      color: "text-blue-700 bg-blue-50 border-blue-200",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_24px_70px_rgba(15,23,42,0.18)] border border-slate-200/90 max-w-xl w-full p-6 sm:p-7 space-y-5 text-slate-900 relative">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
              IL
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {authMode === "signin" ? "Sign In & Switch Persona" : "Create New User Profile"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {authMode === "signin"
                  ? "Select a pre-configured persona or sign in to your workspace"
                  : "Register as a Brand Admin, Creative Agency, or Independent Creator"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80 text-xs">
          <button
            onClick={() => {
              setAuthMode("signin");
              setAuthError(null);
            }}
            className={`flex-1 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              authMode === "signin"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In / Demo Personas
          </button>
          <button
            onClick={() => {
              setAuthMode("signup");
              setAuthError(null);
            }}
            className={`flex-1 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              authMode === "signup"
                ? "bg-[#e05638] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register New Profile
          </button>
        </div>

        {authError && (
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
            {authError}
          </div>
        )}

        {/* TAB 1: SIGN IN / PERSONA SWITCHER */}
        {authMode === "signin" && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              1-Click Instant Persona Sign-In:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableUsers.map((user) => {
                const isSelected = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handlePersonaSelect(user)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-orange-50/60 border-[#e05638] ring-1 ring-[#e05638]/20 shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-xs text-slate-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate">
                        {user.organization || user.role}
                      </div>
                      <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono">
                        {user.role}
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#e05638] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Email Direct Login Form */}
            <div className="pt-3 border-t border-slate-100">
              <form onSubmit={handleEmailLogin} className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600">
                  Or Sign In with Custom Profile Email:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. your.email@agency.com"
                      className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !loginEmail.trim()}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 cursor-pointer"
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name:
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address:
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. jordan@agency.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Organization / Brand Name:
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={regOrg}
                  onChange={(e) => setRegOrg(e.target.value)}
                  placeholder="e.g. Apex Creative or Verdanta Foods"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638]"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Select Workspace Role & Permissions:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = regRole === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setRegRole(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? "bg-orange-50/70 border-[#e05638] ring-1 ring-[#e05638]/30 shadow-xs"
                          : "bg-white hover:bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#e05638]" : "text-slate-500"}`} />
                          <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                        </div>
                        <input
                          type="radio"
                          name="role"
                          checked={isSelected}
                          onChange={() => setRegRole(opt.id)}
                          className="accent-[#e05638]"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
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
              className="btn-coral w-full py-3 rounded-2xl text-xs font-bold shadow-[0_8px_20px_rgba(224,86,56,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
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
