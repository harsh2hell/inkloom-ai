import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyContent } from "@/lib/verification/engine";
import { ContentType, ContentStatus } from "@prisma/client";

export async function GET() {
  try {
    const items = await prisma.contentItem.findMany({
      include: {
        brand: true,
        submitter: true,
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          include: {
            analysisRuns: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { findings: true },
            },
            reviews: {
              include: { reviewer: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignName, title, contentType, textContent, submitterId, forceDeterministicOnly } = body;

    if (!campaignName || !title || !textContent) {
      return NextResponse.json(
        { error: "Campaign name, title, and text content are required." },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findFirst();
    if (!brand) throw new Error("Brand not found.");

    const submitter = await prisma.user.findUnique({
      where: { id: submitterId || "usr_agency_01" },
    });

    if (!submitter) throw new Error("Submitter user not found.");

    // 1. Create ContentItem
    const contentItem = await prisma.contentItem.create({
      data: {
        brandId: brand.id,
        campaignName,
        title,
        contentType: (contentType as ContentType) || ContentType.SOCIAL_CAPTION,
        submitterId: submitter.id,
        currentVersionNumber: 1,
        status: ContentStatus.SUBMITTED,
      },
    });

    // 2. Create Version 1
    const version1 = await prisma.contentVersion.create({
      data: {
        contentItemId: contentItem.id,
        versionNumber: 1,
        textContent,
        submittedById: submitter.id,
        changeNotes: "Initial draft submitted for compliance verification.",
      },
    });

    // 3. Record Audit Log for Submission
    await prisma.auditLog.create({
      data: {
        action: "CONTENT_SUBMITTED",
        userId: submitter.id,
        userName: submitter.name,
        userRole: submitter.role,
        entityType: "CONTENT_ITEM",
        entityId: contentItem.id,
        details: JSON.stringify({
          campaignName,
          title,
          contentType,
          version: 1,
        }),
      },
    });

    // 4. Run Verification Engine
    const verificationResult = await verifyContent({
      contentVersionId: version1.id,
      textContent,
      brandId: brand.id,
      brandName: brand.name,
      userId: submitter.id,
      userName: submitter.name,
      userRole: submitter.role,
      forceDeterministicOnly: Boolean(forceDeterministicOnly),
    });

    return NextResponse.json({
      contentItem,
      version: version1,
      verification: verificationResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
