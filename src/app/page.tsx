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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-700">Connecting to PostgreSQL & verifying auth personas...</p>
      </div>
    );
  }

  if (userError || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-600">
        <div className="max-w-md w-full bg-white p-6 rounded-xl border border-rose-200 shadow-sm text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Database Authentication Error</h2>
          <p className="text-xs text-rose-600 font-medium">{userError || "Failed to load database users"}</p>
          <p className="text-[11px] text-slate-400">
            Zero mock data enforced: The application will not substitute fake user personas when PostgreSQL is unavailable.
          </p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* 1. Left Fixed Sidebar (240px desktop, drawer on mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        aiMode="AI_ASSISTED"
      />

      {/* 2. Main Workspace (fills width minus 240px sidebar) */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          currentUser={currentUser}
          availableUsers={availableUsers}
          onSelectUser={setCurrentUser}
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        />

        {/* View Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <OverviewView
              key={`overview-${refreshKey}`}
              onOpenStudio={handleOpenStudio}
              onOpenTab={setActiveTab}
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
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

        {/* Minimal Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Inkloom AI</span>
              <span>—</span>
              <span>Content Governance & Claims Verification</span>
            </div>
            <div className="text-[11px] text-slate-400">
              CodeAxis Round 2 &bull; Team ERROR 404 &bull; Verdanta Foods Demo
            </div>
          </div>
        </footer>
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
