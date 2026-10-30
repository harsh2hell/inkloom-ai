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
  CheckCircle2,
  Lock,
  Shield,
  Layers,
  Crown,
} from "lucide-react";
import { UserProfile } from "@/components/Navbar";

interface AuthPageViewProps {
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onUserRegistered: (newUser: UserProfile) => void;
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
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      pill: "Executive",
    },
    {
      id: "BRAND_ADMIN",
      title: "Brand Content Admin",
      desc: "Full governance approval gate authority, reviews submitted copy, and manages Brand Truth Rules.",
      icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      pill: "Approver",
    },
    {
      id: "AGENCY_CREATOR",
      title: "Creative Agency Partner",
      desc: "Drafts and submits campaigns for verification, executes AI corrections. Isolated draft history.",
      icon: Palette,
      color: "text-[#e05638] bg-orange-50 border-orange-200",
      pill: "Creator",
    },
    {
      id: "EXTERNAL_CREATOR",
      title: "External Creator / Influencer",
      desc: "Adapts creator briefs for social channels, verifies policy adherence and adaptation drift.",
      icon: Sparkles,
      color: "text-purple-700 bg-purple-50 border-purple-200",
      pill: "Influencer",
    },
    {
      id: "AUDITOR",
      title: "Assurance Auditor",
      desc: "Independent third-party compliance assurance with read-only cryptographic ledger access.",
      icon: Eye,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      pill: "Auditor",
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
    <div className="min-h-screen bg-[#f3f4f7] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-950">
      {/* Neo-Modern Card Wrapper */}
      <div className="w-full max-w-2xl bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-200/80 p-6 sm:p-10 space-y-6 relative overflow-hidden">
        {/* Subtle Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-100/40 via-rose-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Top Header & Monogram */}
        <div className="flex flex-col items-center text-center space-y-2 relative z-10">
          <div className="w-14 h-14 rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(15,23,42,0.25)] ring-1 ring-white/20 mb-1">
            <div className="flex items-center tracking-tighter">
              <span className="font-extrabold text-lg text-white">IL</span>
              <span className="w-2 h-2 rounded-full bg-[#e05638] ml-0.5 animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inkloom AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md">
            Brand Content Governance, Grounded Verification & Creator Compliance Workspace
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-full border border-slate-200/80 text-xs font-bold max-w-md mx-auto relative z-10">
          <button
            onClick={() => {
              setAuthMode("signin");
              setAuthError(null);
            }}
            className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
              authMode === "signin"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In / Demo Roles
          </button>
          <button
            onClick={() => {
              setAuthMode("signup");
              setAuthError(null);
            }}
            className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
              authMode === "signup"
                ? "bg-[#e05638] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Error Notice */}
        {authError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 text-center animate-in fade-in duration-150">
            {authError}
          </div>
        )}

        {/* TAB 1: SIGN IN / FAST DEMO PERSONA LOGIN */}
        {authMode === "signin" && (
          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  1-Click Instant Persona Sign-In:
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Ready for Evaluation
                </span>
              </div>

              {/* 4 Persona Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableUsers.map((user) => {
                  const roleObj = roleOptions.find((r) => r.id === user.role) || roleOptions[0];
                  const Icon = roleObj.icon;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleFastPersonaLogin(user)}
                      className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-orange-50/40 border border-slate-200/80 hover:border-[#e05638]/50 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center gap-3.5 group shadow-2xs"
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-xs text-slate-900 group-hover:text-[#e05638] transition-colors truncate">
                            {user.name}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 shrink-0">
                            {roleObj.pill}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {user.organization || "Verdanta Foods"}
                        </div>
                        <div className="text-[10px] text-[#e05638] font-bold mt-1 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          <span>Sign in as {roleObj.pill}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 absolute">
                or sign in with email
              </span>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g., sarah.chen@verdantafoods.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-coral w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? "Signing In..." : "Sign In to Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: SIGN UP / REGISTER NEW PROFILE */}
        {authMode === "signup" && (
          <form onSubmit={handleRegister} className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g., Elena Vance"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g., elena@kineticagency.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638] transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Organization / Agency Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regOrg}
                  onChange={(e) => setRegOrg(e.target.value)}
                  placeholder="e.g., Kinetic Agency / Verdanta Partner"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e05638]/20 focus:border-[#e05638] transition-all"
                />
              </div>
            </div>

            {/* Select Role */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Select Your Governance Role & Permissions
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = regRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setRegRole(role.id)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-orange-50/70 border-[#e05638] ring-1 ring-[#e05638]/20 shadow-xs"
                          : "bg-slate-50/60 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-[#e05638] text-white" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900 truncate">
                          {role.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                        {role.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-coral w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {isSubmitting ? "Creating Account in PostgreSQL..." : "Register & Open Workspace"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Bottom Trust Badge */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Isolated creator workspace & 4-eyes governance</span>
          </div>
          <span className="font-bold text-slate-600">PostgreSQL Neon DB</span>
        </div>
      </div>
    </div>
  );
};
