import { prisma } from "@/lib/prisma";

let isMigrated = false;

export async function ensureDatabaseSchema() {
  if (isMigrated) return;

  // Fast-path: Check if already migrated and seeded
  try {
    const owner = await prisma.user.findUnique({
      where: { id: "usr_owner_01" },
      select: { id: true },
    });
    if (owner) {
      isMigrated = true;
      return;
    }
  } catch {
    // Column or enum missing, proceed with DDL below
  }

  isMigrated = true;

  const ddlStatements = [
    `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'BRAND_OWNER';`,
    `ALTER TYPE "KnowledgeCategory" ADD VALUE IF NOT EXISTS 'ASSET';`,
    `ALTER TABLE "ContentVersion" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;`,
    `ALTER TABLE "ContentVersion" ADD COLUMN IF NOT EXISTS "imageAltText" TEXT;`,
    `ALTER TABLE "ContentVersion" ADD COLUMN IF NOT EXISTS "imageAnalysis" TEXT;`,
    `ALTER TABLE "Finding" ADD COLUMN IF NOT EXISTS "insufficientEvidenceSubReason" TEXT;`,
    `ALTER TABLE "Finding" ADD COLUMN IF NOT EXISTS "routedReviewer" TEXT;`,
    `ALTER TABLE "CreatorBrief" ADD COLUMN IF NOT EXISTS "approvedAssets" TEXT;`,
    `ALTER TABLE "CreatorSubmission" ADD COLUMN IF NOT EXISTS "clearedById" TEXT;`,
    `ALTER TABLE "CreatorSubmission" ADD COLUMN IF NOT EXISTS "clearedByName" TEXT;`,
    `ALTER TABLE "CreatorSubmission" ADD COLUMN IF NOT EXISTS "clearedAt" TIMESTAMP(3);`,
    `ALTER TABLE "CreatorSubmission" ADD COLUMN IF NOT EXISTS "clearanceStatus" TEXT DEFAULT 'PENDING_CLEARANCE';`,
    `ALTER TABLE "CreatorSubmission" ADD COLUMN IF NOT EXISTS "clearanceNotes" TEXT;`,
  ];

  for (const stmt of ddlStatements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (e: any) {
      // Ignore if column/enum already exists or if type cannot be modified
      console.warn("DDL migration step notice:", e.message || e);
    }
  }

  // Ensure Brand Owner exists
  try {
    await prisma.user.upsert({
      where: { id: "usr_owner_01" },
      update: {},
      create: {
        id: "usr_owner_01",
        email: "elena.vance@verdantafoods.demo",
        name: "Elena Vance",
        role: "BRAND_OWNER",
        organization: "Verdanta Foods Executive",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      },
    });
  } catch (e) {
    console.warn("User upsert notice:", e);
  }

  // Ensure Round 3 Knowledge items exist
  try {
    const brand = await prisma.brand.findFirst();
    if (brand) {
      await prisma.knowledgeItem.upsert({
        where: { id: "KB-VER-009" },
        update: {},
        create: {
          id: "KB-VER-009",
          brandId: brand.id,
          category: "TERMINOLOGY",
          title: "Approved Brand Product Names",
          content: "The correct trademark product name is 'Verdanta Plant Crunch' or 'Verdanta Organic Almond Oat Bar'. Abbreviations like 'V-Crunch' or 'Plant Bar' are prohibited in consumer-facing advertising.",
          sourceDocument: "Brand Style Guide v3.4, Section 1.2",
          sourceExcerpt: "The correct trademark product name is 'Verdanta Plant Crunch' or 'Verdanta Organic Almond Oat Bar'. Abbreviations like 'V-Crunch' or 'Plant Bar' are prohibited in consumer-facing advertising.",
          owner: "Elena Vance (Brand Owner)",
          approvalStatus: "APPROVED",
          version: 2,
        },
      });

      await prisma.knowledgeItem.upsert({
        where: { id: "KB-VER-010" },
        update: {},
        create: {
          id: "KB-VER-010",
          brandId: brand.id,
          category: "ASSET",
          title: "Approved Brand Assets & Color Palette",
          content: "Primary Logo: https://verdantafoods.demo/assets/logo-primary.svg. Approved Brand Palette: Forest Green (#2D5A27), Warm Terracotta (#E05638), Clean Slate (#F4F5F8). Alt text must describe packaging or brand logo.",
          sourceDocument: "Brand Asset Registry 2026",
          sourceExcerpt: "Primary Logo: https://verdantafoods.demo/assets/logo-primary.svg. Approved Brand Palette: Forest Green (#2D5A27), Warm Terracotta (#E05638), Clean Slate (#F4F5F8). Alt text must describe packaging or brand logo.",
          owner: "Elena Vance (Brand Owner)",
          approvalStatus: "APPROVED",
          version: 1,
        },
      });
    }
  } catch (e) {
    console.warn("Knowledge upsert notice:", e);
  }

  isMigrated = true;
}
