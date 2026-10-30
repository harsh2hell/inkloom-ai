import { PrismaClient, Role, KnowledgeCategory, ApprovalStatus, ContentType, ContentStatus, FindingType, FindingSeverity, EvidenceStatus, ResolutionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Inkloom AI database (idempotent, non-destructive)...");

  // 1. Seed / Upsert Users representing the 5 Core Roles
  const ownerUser = await prisma.user.upsert({
    where: { id: "usr_owner_01" },
    update: {},
    create: {
      id: "usr_owner_01",
      name: "Elena Vance",
      email: "elena.vance@verdantafoods.demo",
      role: Role.BRAND_OWNER,
      organization: "Verdanta Foods Executive",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { id: "usr_admin_01" },
    update: {},
    create: {
      id: "usr_admin_01",
      name: "Sarah Chen",
      email: "sarah.chen@verdantafoods.demo",
      role: Role.BRAND_ADMIN,
      organization: "Verdanta Foods Governance",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
  });

  const agencyUser = await prisma.user.upsert({
    where: { id: "usr_agency_01" },
    update: {},
    create: {
      id: "usr_agency_01",
      name: "Alex Rivera",
      email: "alex.rivera@apexmarketing.demo",
      role: Role.AGENCY_CREATOR,
      organization: "Apex Creative Agency",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });

  const creatorUser = await prisma.user.upsert({
    where: { id: "usr_creator_01" },
    update: {},
    create: {
      id: "usr_creator_01",
      name: "Maya Patel",
      email: "maya.creates@contentlab.demo",
      role: Role.EXTERNAL_CREATOR,
      organization: "Independent Creator Studio",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
  });

  const auditorUser = await prisma.user.upsert({
    where: { id: "usr_auditor_01" },
    update: {},
    create: {
      id: "usr_auditor_01",
      name: "David Thorne",
      email: "david.thorne@complianceaudit.demo",
      role: Role.AUDITOR,
      organization: "Global Standards Assurance",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
  });

  console.log("Verified / seeded 5 core users across all RBAC personas.");

  // 2. Seed / Upsert Brand
  const brand = await prisma.brand.upsert({
    where: { id: "brand_verdanta_01" },
    update: {},
    create: {
      id: "brand_verdanta_01",
      name: "Verdanta Foods",
      description: "Fictional packaged-food brand producing wholesome plant-based nutrition snacks and bars. Demo data for CodeAxis Hackathon Round 2.",
      isFictionalDemo: true,
    },
  });

  // 3. Seed / Upsert Brand Knowledge Centre items
  const pastDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 2);
  const expiredDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const knowledgeDefinitions = [
    {
      id: "KB-VER-001",
      brandId: brand.id,
      title: "Nutritional Profile: Protein Content",
      content: "Verdanta Plant Crunch Bar contains exactly 11 g of wholesome plant protein per 100 g serving.",
      category: KnowledgeCategory.PRODUCT_FACT,
      sourceDocument: "Verdanta_Lab_Certificate_Analysis_2026.pdf",
      sourceExcerpt: "Laboratory testing confirms protein concentration measured at exactly 11 g protein per 100 g finished product.",
      owner: "Quality Assurance & Nutrition Science Team",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 2,
      effectiveDate: pastDate,
      expiryDate: futureDate,
    },
    {
      id: "KB-VER-002",
      brandId: brand.id,
      title: "Nutritional Profile: Added Sugar",
      content: "Each standard serving of Verdanta Plant Crunch contains 6 g of added raw cane sugar for texture and taste.",
      category: KnowledgeCategory.PRODUCT_FACT,
      sourceDocument: "Verdanta_Formulation_Specification_v3.pdf",
      sourceExcerpt: "Batch formulation specifies exactly 6 g added sugar per 40 g bar serving.",
      owner: "Formulation and Regulatory Affairs",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 1,
      effectiveDate: pastDate,
      expiryDate: futureDate,
    },
    {
      id: "KB-VER-003",
      brandId: brand.id,
      title: "Permitted Claim: Source of Protein",
      content: "Marketing materials may describe the product as a 'source of protein' when referencing the verified 11 g / 100 g composition.",
      category: KnowledgeCategory.PERMITTED_CLAIM,
      sourceDocument: "Verdanta_Brand_Marketing_Code_2026.pdf",
      sourceExcerpt: "Permitted claim: 'source of protein' is approved for Verdanta Plant Crunch based on fulfilling regulatory protein-to-energy ratio.",
      owner: "Legal & Regulatory Compliance",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 1,
      effectiveDate: pastDate,
      expiryDate: futureDate,
    },
    {
      id: "KB-VER-004",
      brandId: brand.id,
      title: "Prohibited Claim: Sugar-Free",
      content: "The term 'sugar-free' or 'no sugar' is strictly prohibited across all marketing communications because the product contains 6 g added sugar per serving.",
      category: KnowledgeCategory.PROHIBITED_CLAIM,
      sourceDocument: "Verdanta_Brand_Marketing_Code_2026.pdf",
      sourceExcerpt: "Prohibited claim: 'sugar-free' is strictly banned. Any claim implying zero or negligible sugar is false and non-compliant.",
      owner: "Legal & Regulatory Compliance",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 1,
      effectiveDate: pastDate,
      expiryDate: futureDate,
    },
    {
      id: "KB-VER-005",
      brandId: brand.id,
      title: "Prohibited Claim: Diabetes-Friendly",
      content: "Do not describe the product as 'diabetes-friendly' or 'suitable for diabetics'. Medical and therapeutic health claims are strictly forbidden.",
      category: KnowledgeCategory.PROHIBITED_CLAIM,
      sourceDocument: "Verdanta_Brand_Marketing_Code_2026.pdf",
      sourceExcerpt: "Prohibited claim: 'diabetes-friendly' or any therapeutic or glycemic disease management claim is prohibited.",
      owner: "Medical Advisory & Regulatory Affairs",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 1,
      effectiveDate: pastDate,
      expiryDate: futureDate,
    },
    {
      id: "KB-VER-006",
      brandId: brand.id,
      title: "Mandatory Brand Disclosure: Sugar & Balanced Diet",
      content: "All consumer-facing advertising and sponsored creator captions must explicitly include the approved brand disclosure notice: 'Contains added sugar. This product is not a substitute for a balanced diet.' (Note: Fictional demo brand policy, not statutory legal text).",
      category: KnowledgeCategory.MANDATORY_DISCLOSURE,
      sourceDocument: "Verdanta_Consumer_Transparency_Charter.pdf",
      sourceExcerpt: "Mandatory brand disclosure: Contains added sugar. This product is not a substitute for a balanced diet.",
      owner: "Brand Governance Board",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 1,
      effectiveDate: pastDate,
      expiryDate: futureDate,
    },
    {
      id: "KB-VER-007",
      brandId: brand.id,
      title: "Expired Certification: 100% Organic Certificate 2023",
      content: "Previous batch certification from Organic Soil Association certifying ingredients as 100% organic until Dec 2023. This certification has expired and cannot be cited for current 2026 marketing.",
      category: KnowledgeCategory.PRODUCT_FACT,
      sourceDocument: "Organic_Cert_OSA_2023_Archived.pdf",
      sourceExcerpt: "Certified organic status granted through December 31, 2023. Expiration noted.",
      owner: "Procurement & Quality Audit",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 1,
      effectiveDate: pastDate,
      expiryDate: expiredDate,
    },
    {
      id: "KB-VER-008",
      brandId: brand.id,
      title: "Guideline: Transparent Nutrition Tone",
      content: "Highlight plant energy, natural crunch, and active living. Avoid hyperbole or miraculous body transformation promises.",
      category: KnowledgeCategory.GUIDELINE,
      sourceDocument: "Verdanta_Creative_Guidelines_2026.pdf",
      sourceExcerpt: "Tone must be grounded, transparent, and uplifting. Celebrate real ingredients without exaggerated functional promises.",
      owner: "Creative Strategy Lead",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 1,
      effectiveDate: pastDate,
      expiryDate: futureDate,
    },
    {
      id: "KB-VER-009",
      brandId: brand.id,
      title: "Brand Terminology: Plant Crunch™ & Clean Energy",
      content: "Official trademark and naming guidelines: Always use 'Verdanta Plant Crunch™' on first reference. Approved descriptors: 'plant-based energy', 'whole food crunch', 'clean fuel'. Prohibited slang: 'junk substitute', 'guilt-free magic'.",
      category: KnowledgeCategory.TERMINOLOGY,
      sourceDocument: "Verdanta_Brand_Style_Guide_2026.pdf",
      sourceExcerpt: "Always use 'Verdanta Plant Crunch™' on first reference. Approved descriptors include 'plant-based energy' and 'clean fuel'.",
      owner: "Brand Marketing Directorate",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 1,
      effectiveDate: pastDate,
      expiryDate: futureDate,
    },
    {
      id: "KB-VER-010",
      brandId: brand.id,
      title: "Approved Brand Asset: Logo & Color Palette",
      content: "Primary Brand Logo: Verdanta Leaf Icon + Wordmark (SVG/PNG). Approved Brand Color Palette: Forest Green (#2D5A27), Earth Terracotta (#E05638), Warm Canvas (#F4F5F8). Alt-text requirement: 'Verdanta Foods organic leaf brand mark'.",
      category: KnowledgeCategory.ASSET,
      sourceDocument: "Verdanta_Visual_Identity_Specification_2026.pdf",
      sourceExcerpt: "Visual Identity Spec: Primary logo must appear in #2D5A27 on light backgrounds. Required alt-text: 'Verdanta Foods organic leaf brand mark'.",
      owner: "Creative & Brand Design Studio",
      approvalStatus: ApprovalStatus.APPROVED,
      version: 1,
      effectiveDate: pastDate,
      expiryDate: futureDate,
    },
  ];

  for (const item of knowledgeDefinitions) {
    await prisma.knowledgeItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log("Verified / seeded 10 Knowledge Items across all categories.");

  // 4. Seed initial sample content item if not already existing
  const existingSample = await prisma.contentItem.findUnique({
    where: { id: "cnt_sample_01" },
  });

  if (!existingSample) {
    const sampleContent = await prisma.contentItem.create({
      data: {
        id: "cnt_sample_01",
        brandId: brand.id,
        campaignName: "Spring Wellness 2026 Launch",
        title: "Instagram Launch Post: Plant Crunch Bar",
        contentType: ContentType.SOCIAL_CAPTION,
        submitterId: agencyUser.id,
        currentVersionNumber: 1,
        status: ContentStatus.SUBMITTED,
      },
    });

    const sampleVersion = await prisma.contentVersion.create({
      data: {
        id: "ver_sample_01",
        contentItemId: sampleContent.id,
        versionNumber: 1,
        textContent: "Fuel your active day with Verdanta Plant Crunch! Packed with 25g protein per bar, it's 100% sugar-free and completely diabetes-friendly. Certified 100% organic. Grab yours today at 20% off!",
        submittedById: agencyUser.id,
        changeNotes: "Initial draft submitted by agency for verification.",
      },
    });

    const sampleRun = await prisma.analysisRun.create({
      data: {
        id: "run_sample_01",
        contentVersionId: sampleVersion.id,
        provider: "DETERMINISTIC_ONLY",
        mode: "DETERMINISTIC",
        status: "COMPLETED",
        triggeredById: agencyUser.id,
        summary: "Verification identified 5 policy issues: 2 prohibited claims, 1 factual contradiction, 1 expired evidence citation, and 1 missing mandatory disclosure.",
      },
    });

    await prisma.finding.createMany({
      data: [
        {
          analysisRunId: sampleRun.id,
          type: FindingType.VERIFIED_CONTRADICTION,
          severity: FindingSeverity.HIGH,
          affectedText: "100% sugar-free",
          explanation: "Draft claims '100% sugar-free', directly violating approved fact KB-VER-002 (6 g added sugar per serving) and prohibited claim policy KB-VER-004.",
          evidenceStatus: EvidenceStatus.VERIFIED,
          sourceReferenceId: "KB-VER-004",
          quotedExcerpt: "Prohibited claim: 'sugar-free' is strictly banned. Any claim implying zero or negligible sugar is false and non-compliant.",
          citationValid: true,
          suggestedCorrection: "crafted with wholesome plant ingredients and 6 g added raw cane sugar",
          suggestedCorrectionSupported: true,
          resolutionStatus: ResolutionStatus.OPEN,
          requiresHumanReview: true,
        },
        {
          analysisRunId: sampleRun.id,
          type: FindingType.VERIFIED_CONTRADICTION,
          severity: FindingSeverity.HIGH,
          affectedText: "completely diabetes-friendly",
          explanation: "Draft claims 'completely diabetes-friendly', directly violating prohibited claim policy KB-VER-005 forbidding therapeutic health claims.",
          evidenceStatus: EvidenceStatus.VERIFIED,
          sourceReferenceId: "KB-VER-005",
          quotedExcerpt: "Prohibited claim: 'diabetes-friendly' or any therapeutic or glycemic disease management claim is prohibited.",
          citationValid: true,
          suggestedCorrection: "a wholesome source of plant energy for active days",
          suggestedCorrectionSupported: true,
          resolutionStatus: ResolutionStatus.OPEN,
          requiresHumanReview: true,
        },
        {
          analysisRunId: sampleRun.id,
          type: FindingType.VERIFIED_CONTRADICTION,
          severity: FindingSeverity.HIGH,
          affectedText: "Packed with 25g protein per bar",
          explanation: "Draft claims '25g protein per bar', whereas approved specification KB-VER-001 confirms exactly 11 g protein per 100 g.",
          evidenceStatus: EvidenceStatus.VERIFIED,
          sourceReferenceId: "KB-VER-001",
          quotedExcerpt: "Laboratory testing confirms protein concentration measured at exactly 11 g protein per 100 g finished product.",
          citationValid: true,
          suggestedCorrection: "Packed with wholesome plant protein (11 g per 100 g), an approved source of protein",
          suggestedCorrectionSupported: true,
          resolutionStatus: ResolutionStatus.OPEN,
          requiresHumanReview: true,
        },
        {
          analysisRunId: sampleRun.id,
          type: FindingType.INSUFFICIENT_EVIDENCE,
          severity: FindingSeverity.HIGH,
          affectedText: "Certified 100% organic",
          explanation: "The referenced organic certification (KB-VER-007) expired on December 31, 2023. Expired evidence cannot substantiate current marketing claims.",
          evidenceStatus: EvidenceStatus.EXPIRED_EVIDENCE,
          sourceReferenceId: "KB-VER-007",
          quotedExcerpt: "Certified organic status granted through December 31, 2023. Expiration noted.",
          citationValid: false,
          citationFailureReason: "Referenced knowledge item KB-VER-007 has expired (expired Dec 2023).",
          suggestedCorrection: "crafted with thoughtfully selected plant-based ingredients",
          suggestedCorrectionSupported: false,
          resolutionStatus: ResolutionStatus.OPEN,
          requiresHumanReview: true,
        },
        {
          analysisRunId: sampleRun.id,
          type: FindingType.POSSIBLE_RISK,
          severity: FindingSeverity.HIGH,
          affectedText: "[End of caption]",
          explanation: "Draft is missing the mandatory brand disclosure: 'Contains added sugar. This product is not a substitute for a balanced diet.' as required by KB-VER-006.",
          evidenceStatus: EvidenceStatus.VERIFIED,
          sourceReferenceId: "KB-VER-006",
          quotedExcerpt: "Mandatory brand disclosure: Contains added sugar. This product is not a substitute for a balanced diet.",
          citationValid: true,
          suggestedCorrection: "Contains added sugar. This product is not a substitute for a balanced diet.",
          suggestedCorrectionSupported: true,
          resolutionStatus: ResolutionStatus.OPEN,
          requiresHumanReview: true,
        },
      ],
    });

    await prisma.auditLog.create({
      data: {
        action: "CONTENT_SUBMITTED",
        userId: agencyUser.id,
        userName: agencyUser.name,
        userRole: agencyUser.role,
        entityType: "CONTENT_ITEM",
        entityId: sampleContent.id,
        details: JSON.stringify({
          campaignName: sampleContent.campaignName,
          title: sampleContent.title,
          version: 1,
        }),
      },
    });

    console.log("Seeded initial demo content and analysis run.");
  } else {
    console.log("Demo content already present; preserved existing user submissions.");
  }

  console.log("Idempotent seed complete. Zero destructive deletes executed.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
