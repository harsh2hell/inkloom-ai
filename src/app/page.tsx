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

const DEFAULT_USERS: UserProfile[] = [
  {
    id: "usr_admin_01",
    name: "Sarah Chen",
    email: "sarah.chen@verdantafoods.demo",
    role: "BRAND_ADMIN",
    organization: "Verdanta Foods Governance",
  },
  {
    id: "usr_agency_01",
    name: "Alex Rivera",
    email: "alex.rivera@apexmarketing.demo",
    role: "AGENCY_CREATOR",
    organization: "Apex Creative Agency",
  },
  {
    id: "usr_creator_01",
    name: "Maya Patel",
    email: "maya.creates@contentlab.demo",
    role: "EXTERNAL_CREATOR",
    organization: "Independent Creator Studio",
  },
  {
    id: "usr_auditor_01",
    name: "David Thorne",
    email: "david.thorne@complianceaudit.demo",
    role: "AUDITOR",
    organization: "Global Standards Assurance",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS[0]);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [studioContentId, setStudioContentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch initial users from DB
  useEffect(() => {
    fetch("/api/auth/current-user")
      .then((r) => r.json())
      .then((data) => {
        if (data.availableUsers && data.availableUsers.length > 0) {
          setAvailableUsers(data.availableUsers);
          if (data.currentUser) {
            setCurrentUser(data.currentUser);
          }
        }
      })
      .catch((e) => console.error("Could not fetch users", e));
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
