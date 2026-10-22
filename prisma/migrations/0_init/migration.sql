-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BRAND_ADMIN', 'AGENCY_CREATOR', 'EXTERNAL_CREATOR', 'AUDITOR');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('PRODUCT_FACT', 'PERMITTED_CLAIM', 'PROHIBITED_CLAIM', 'GUIDELINE', 'TERMINOLOGY', 'MANDATORY_DISCLOSURE');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('SOCIAL_CAPTION', 'BLOG_POST', 'PACKAGING_COPY', 'AD_BANNER', 'CREATOR_ADAPTATION');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FindingType" AS ENUM ('VERIFIED_CONTRADICTION', 'UNSUPPORTED_CLAIM', 'INSUFFICIENT_EVIDENCE', 'POSSIBLE_RISK', 'STYLE_SUGGESTION');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'INFO');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('VERIFIED', 'UNVERIFIED_CITATION', 'NO_EVIDENCE', 'EXPIRED_EVIDENCE');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('OPEN', 'ACCEPTED_CORRECTION', 'MANUALLY_EDITED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'REJECTED', 'OVERRIDE', 'CHANGES_REQUESTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENCY_CREATOR',
    "organization" TEXT NOT NULL DEFAULT 'Verdanta Ecosystem',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isFictionalDemo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeItem" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "KnowledgeCategory" NOT NULL,
    "sourceDocument" TEXT,
    "sourceExcerpt" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL DEFAULT 'SOCIAL_CAPTION',
    "submitterId" TEXT NOT NULL,
    "currentVersionNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "ContentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "textContent" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "changeNotes" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRun" (
    "id" TEXT NOT NULL,
    "contentVersionId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "triggeredById" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "analysisRunId" TEXT NOT NULL,
    "type" "FindingType" NOT NULL,
    "severity" "FindingSeverity" NOT NULL,
    "affectedText" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "evidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'NO_EVIDENCE',
    "sourceReferenceId" TEXT,
    "quotedExcerpt" TEXT,
    "citationValid" BOOLEAN NOT NULL DEFAULT false,
    "citationFailureReason" TEXT,
    "suggestedCorrection" TEXT,
    "suggestedCorrectionSupported" BOOLEAN NOT NULL DEFAULT false,
    "resolutionStatus" "ResolutionStatus" NOT NULL DEFAULT 'OPEN',
    "dismissReason" TEXT,
    "requiresHumanReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanReview" (
    "id" TEXT NOT NULL,
    "contentVersionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HumanReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorBrief" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "sourceContentVersionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "versionReference" TEXT NOT NULL,
    "permittedClaims" TEXT NOT NULL,
    "prohibitedClaims" TEXT NOT NULL,
    "mandatoryDisclosures" TEXT NOT NULL,
    "approvedFacts" TEXT NOT NULL,
    "guidelines" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorSubmission" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "adaptationDriftFlags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE INDEX "KnowledgeItem_brandId_idx" ON "KnowledgeItem"("brandId");

-- CreateIndex
CREATE INDEX "KnowledgeItem_category_idx" ON "KnowledgeItem"("category");

-- CreateIndex
CREATE INDEX "KnowledgeItem_approvalStatus_idx" ON "KnowledgeItem"("approvalStatus");

-- CreateIndex
CREATE INDEX "ContentItem_brandId_idx" ON "ContentItem"("brandId");

-- CreateIndex
CREATE INDEX "ContentItem_submitterId_idx" ON "ContentItem"("submitterId");

-- CreateIndex
CREATE INDEX "ContentVersion_contentItemId_idx" ON "ContentVersion"("contentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVersion_contentItemId_versionNumber_key" ON "ContentVersion"("contentItemId", "versionNumber");

-- CreateIndex
CREATE INDEX "AnalysisRun_contentVersionId_idx" ON "AnalysisRun"("contentVersionId");

-- CreateIndex
CREATE INDEX "Finding_analysisRunId_idx" ON "Finding"("analysisRunId");

-- CreateIndex
CREATE INDEX "Finding_type_idx" ON "Finding"("type");

-- CreateIndex
CREATE INDEX "HumanReview_contentVersionId_idx" ON "HumanReview"("contentVersionId");

-- CreateIndex
CREATE INDEX "HumanReview_reviewerId_idx" ON "HumanReview"("reviewerId");

-- CreateIndex
CREATE INDEX "CreatorBrief_brandId_idx" ON "CreatorBrief"("brandId");

-- CreateIndex
CREATE INDEX "CreatorBrief_sourceContentVersionId_idx" ON "CreatorBrief"("sourceContentVersionId");

-- CreateIndex
CREATE INDEX "CreatorSubmission_briefId_idx" ON "CreatorSubmission"("briefId");

-- CreateIndex
CREATE INDEX "CreatorSubmission_creatorId_idx" ON "CreatorSubmission"("creatorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_contentVersionId_fkey" FOREIGN KEY ("contentVersionId") REFERENCES "ContentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_analysisRunId_fkey" FOREIGN KEY ("analysisRunId") REFERENCES "AnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanReview" ADD CONSTRAINT "HumanReview_contentVersionId_fkey" FOREIGN KEY ("contentVersionId") REFERENCES "ContentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanReview" ADD CONSTRAINT "HumanReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorBrief" ADD CONSTRAINT "CreatorBrief_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorBrief" ADD CONSTRAINT "CreatorBrief_sourceContentVersionId_fkey" FOREIGN KEY ("sourceContentVersionId") REFERENCES "ContentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorSubmission" ADD CONSTRAINT "CreatorSubmission_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "CreatorBrief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorSubmission" ADD CONSTRAINT "CreatorSubmission_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

