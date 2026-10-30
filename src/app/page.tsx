"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { UserProfile } from "@/components/Navbar";
import { SubmissionModal } from "@/components/SubmissionModal";
import { OverviewView } from "@/components/views/OverviewView";
import { KnowledgeView } from "@/components/views/KnowledgeView";
import { ContentListView } from "@/components/views/ContentListView";
import { CorrectionStudioView } from "@/components/views/CorrectionStudioView";
import { CreatorBriefsView } from "@/components/views/CreatorBriefsView";
import { AuditLogView } from "@/components/views/AuditLogView";
import { JudgeGuideView } from "@/components/views/JudgeGuideView";
import { SubmitContentView } from "@/components/views/SubmitContentView";
import { AuthModal } from "@/components/AuthModal";
import { AuthPageView } from "@/components/views/AuthPageView";

import { ShieldAlert } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [studioContentId, setStudioContentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch initial users from PostgreSQL
  const fetchUsers = async (isRetry = false) => {
    setUserLoading(true);
    setUserError(null);
    try {
      const storedUserId = typeof window !== "undefined" ? localStorage.getItem("inkloom_active_user_id") : null;
      const url = storedUserId ? `/api/auth/current-user?userId=${storedUserId}` : "/api/auth/current-user";
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const r = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!r.ok) {
        throw new Error(`Failed to load user accounts (HTTP ${r.status})`);
      }
      const data = await r.json();
      if (data.availableUsers && data.availableUsers.length > 0) {
        setAvailableUsers(data.availableUsers);
        setCurrentUser(data.currentUser || data.availableUsers[0]);
        setUserLoading(false);
        return;
      } else {
        throw new Error("No user records returned from PostgreSQL.");
      }
    } catch (e: any) {
      console.error("Could not fetch users", e);
      if (!isRetry) {
        // Silent automatic retry on cold start latency
        setTimeout(() => fetchUsers(true), 600);
        return;
      }
      if (e.name === "AbortError") {
        setUserError("PostgreSQL connection timed out (server waking). Please click Retry Connection.");
      } else {
        setUserError(e.message || "Unable to reach user authentication API");
      }
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("inkloom_active_user_id", user.id);
    }
    setRefreshKey((k) => k + 1);
  };

  const handleUserRegistered = (newUser: UserProfile) => {
    setAvailableUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("inkloom_active_user_id", newUser.id);
    }
    setRefreshKey((k) => k + 1);
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("inkloom_active_user_id");
    }
    setCurrentUser(null);
  };

  const handleOpenStudio = (contentId: string) => {
    setStudioContentId(contentId);
    setActiveTab("studio");
  };

  const handleSubmitSuccess = (newContentId: string) => {
    setStudioContentId(newContentId);
    setActiveTab("studio");
    setRefreshKey((k) => k + 1);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#e8edf4] flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-700">Connecting to PostgreSQL & verifying auth personas...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-[#e8edf4] flex flex-col items-center justify-center p-6 text-slate-600">
        <div className="max-w-md w-full bg-white p-6 rounded-3xl border border-rose-200 shadow-md text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Database Authentication Error</h2>
          <p className="text-xs text-rose-600 font-medium">{userError}</p>
          <p className="text-[11px] text-slate-400">
            Zero mock data enforced: The application will not substitute fake user personas when PostgreSQL is unavailable.
          </p>
          <button
            onClick={() => fetchUsers(false)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-full shadow-xs transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // When signed out, render dedicated full-page Login & Sign Up screen
  if (!currentUser) {
    return (
      <AuthPageView
        availableUsers={availableUsers}
        onSelectUser={handleSelectUser}
        onUserRegistered={handleUserRegistered}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f7] p-2.5 sm:p-4 lg:p-6 flex flex-col items-center justify-start text-slate-900 selection:bg-orange-100 selection:text-orange-950 font-sans">
      {/* Master Neo-Modern Canvas Frame (matching floating soft-edge card aesthetic) */}
      <div className="w-full max-w-[1680px] min-h-[94vh] bg-[#f8f9fb] rounded-[32px] sm:rounded-[40px] shadow-[0_20px_60px_rgba(15,23,42,0.05)] border border-white p-3 sm:p-5 flex flex-col lg:flex-row gap-5 relative">
        {/* 1. Left Vertical Icon Dock Rail */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          aiMode="AI_ASSISTED"
          onSignOut={handleSignOut}
        />

        {/* 2. Main Canvas Body */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 space-y-4">
          {/* Top Floating Pill Header */}
          <Header
            activeTab={activeTab}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            currentUser={currentUser}
            availableUsers={availableUsers}
            onSelectUser={handleSelectUser}
            onOpenSubmitModal={() => setActiveTab("submit")}
            onSelectTab={setActiveTab}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSignOut={handleSignOut}
          />

          {/* Active Workspace View */}
          <main className="flex-1 w-full min-h-0 overflow-y-auto">
            {activeTab === "overview" && (
              <OverviewView
                key={`overview-${refreshKey}-${currentUser.id}`}
                onOpenStudio={handleOpenStudio}
                onOpenTab={setActiveTab}
                onOpenSubmitModal={() => setActiveTab("submit")}
                currentUser={currentUser}
              />
            )}

            {activeTab === "submit" && (
              <SubmitContentView
                key={`submit-${refreshKey}-${currentUser.id}`}
                currentUser={currentUser}
                onSubmitSuccess={handleSubmitSuccess}
                onOpenTab={setActiveTab}
              />
            )}

            {activeTab === "knowledge" && <KnowledgeView key={`knowledge-${refreshKey}`} />}

            {activeTab === "content" && (
              <ContentListView
                key={`content-${refreshKey}-${currentUser.id}`}
                onOpenStudio={handleOpenStudio}
                onOpenSubmitModal={() => setActiveTab("submit")}
                currentUser={currentUser}
              />
            )}

            {activeTab === "studio" && (
              <CorrectionStudioView
                key={`studio-${studioContentId}-${refreshKey}-${currentUser.id}`}
                contentId={studioContentId}
                currentUser={currentUser}
                onOpenBriefsTab={() => setActiveTab("briefs")}
                onRefreshList={() => setRefreshKey((k) => k + 1)}
              />
            )}

            {activeTab === "briefs" && (
              <CreatorBriefsView key={`briefs-${refreshKey}-${currentUser.id}`} currentUser={currentUser} />
            )}

            {activeTab === "audit" && (
              <AuditLogView
                key={`audit-${refreshKey}-${currentUser.id}`}
                currentUser={currentUser}
              />
            )}

            {activeTab === "guide" && (
              <JudgeGuideView
                onOpenSubmitModal={() => setActiveTab("submit")}
                onOpenTab={setActiveTab}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Submission Modal */}
      <SubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
        currentUserId={currentUser.id}
      />

      {/* Authentication & Profile Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        availableUsers={availableUsers}
        onSelectUser={handleSelectUser}
        onUserRegistered={handleUserRegistered}
      />
    </div>
  );
}
