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

import { ShieldAlert } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [studioContentId, setStudioContentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch initial users from PostgreSQL
  const fetchUsers = async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      const r = await fetch("/api/auth/current-user");
      if (!r.ok) {
        throw new Error(`Failed to load user accounts (HTTP ${r.status})`);
      }
      const data = await r.json();
      if (data.availableUsers && data.availableUsers.length > 0) {
        setAvailableUsers(data.availableUsers);
        setCurrentUser(data.currentUser || data.availableUsers[0]);
      } else {
        throw new Error("No user records returned from PostgreSQL.");
      }
    } catch (e: any) {
      console.error("Could not fetch users", e);
      setUserError(e.message || "Unable to reach user authentication API");
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  if (userError || !currentUser) {
    return (
      <div className="min-h-screen bg-[#e8edf4] flex flex-col items-center justify-center p-6 text-slate-600">
        <div className="max-w-md w-full bg-white p-6 rounded-3xl border border-rose-200 shadow-md text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Database Authentication Error</h2>
          <p className="text-xs text-rose-600 font-medium">{userError || "Failed to load database users"}</p>
          <p className="text-[11px] text-slate-400">
            Zero mock data enforced: The application will not substitute fake user personas when PostgreSQL is unavailable.
          </p>
          <button
            onClick={fetchUsers}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-full shadow-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8edf4] p-2.5 sm:p-4 lg:p-6 flex flex-col items-center justify-start text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Master Neo-Modern Canvas Frame (matching the rounded container in the reference design) */}
      <div className="w-full max-w-[1640px] min-h-[92vh] bg-[#f4f7fb] rounded-[32px] sm:rounded-[36px] shadow-[0_16px_50px_rgba(15,23,42,0.06)] border border-white/80 p-3 sm:p-5 flex flex-col lg:flex-row gap-5 relative">
        {/* 1. Left Vertical Icon Dock Rail */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          aiMode="AI_ASSISTED"
        />

        {/* 2. Main Canvas Body */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 space-y-4">
          {/* Top Floating Pill Header */}
          <Header
            activeTab={activeTab}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            currentUser={currentUser}
            availableUsers={availableUsers}
            onSelectUser={setCurrentUser}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onSelectTab={setActiveTab}
          />

          {/* Active Workspace View */}
          <main className="flex-1 w-full min-h-0 overflow-y-auto">
            {activeTab === "overview" && (
              <OverviewView
                key={`overview-${refreshKey}`}
                onOpenStudio={handleOpenStudio}
                onOpenTab={setActiveTab}
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
                currentUser={currentUser}
              />
            )}

            {activeTab === "knowledge" && <KnowledgeView key={`knowledge-${refreshKey}`} />}

            {activeTab === "content" && (
              <ContentListView
                key={`content-${refreshKey}`}
                onOpenStudio={handleOpenStudio}
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
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

            {activeTab === "audit" && <AuditLogView key={`audit-${refreshKey}`} />}

            {activeTab === "guide" && (
              <JudgeGuideView
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
                onOpenTab={setActiveTab}
              />
            )}
          </main>

          {/* Minimal Subtle Brand Tagline */}
          <footer className="pt-2 pb-1 px-3 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1 border-t border-slate-200/50">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-slate-600 font-semibold">Inkloom AI</span>
              <span>•</span>
              <span>Content Governance & Claims Verification</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Verdanta Foods Demo &bull; CodeAxis Round 2
            </div>
          </footer>
        </div>
      </div>

      {/* Global Submission Modal */}
      <SubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
        currentUserId={currentUser.id}
      />
    </div>
  );
}
