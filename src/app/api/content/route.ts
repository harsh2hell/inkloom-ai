import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyContent } from "@/lib/verification/engine";
import { extractTextFromFile } from "@/lib/intake/extractor";
import { ContentType, ContentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    const where: any = {};
    if (userId && (role === "AGENCY_CREATOR" || role === "EXTERNAL_CREATOR")) {
      where.submitterId = userId;
    }

    const items = await prisma.contentItem.findMany({
      where,
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
    const {
      campaignName,
      title,
      contentType,
      textContent: incomingText,
      fileBase64,
      fileName,
      imageUrl,
      imageAltText,
      detectedColors,
      detectedLogo,
      submitterId,
      forceDeterministicOnly,
    } = body;

    let textContent = (incomingText || "").trim();

    // Server-side Multi-format intake: Extract text if document file is uploaded
    if (fileBase64 && fileName) {
      try {
        const fileBuffer = Buffer.from(fileBase64, "base64");
        const extracted = extractTextFromFile(fileName, fileBuffer);
        if (extracted.text) {
          textContent = textContent ? `${textContent}\n\n[Extracted from ${fileName}]:\n${extracted.text}` : extracted.text;
        }
      } catch (err: any) {
        console.warn("Server-side file text extraction warning:", err);
      }
    }

    if (!campaignName || !title || !textContent) {
      return NextResponse.json(
        { error: "Campaign name, title, and valid text content (or uploaded file) are required." },
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
        imageUrl: imageUrl || null,
        imageAltText: imageAltText || null,
        changeNotes: fileName ? `Uploaded ${fileName} with server-side text extraction.` : "Initial draft submitted for compliance verification.",
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
          hasFileAttachment: Boolean(fileName),
          hasVisualAsset: Boolean(imageUrl || imageAltText),
        }),
      },
    });

    // 4. Run Verification Engine with Visual Asset checks
    const visualInput =
      imageUrl || imageAltText || detectedColors || detectedLogo
        ? {
            imageUrl: imageUrl || null,
            imageAltText: imageAltText || null,
            imageFileName: fileName || null,
            detectedColors: detectedColors || [],
            detectedLogo: detectedLogo || null,
          }
        : undefined;

    const verificationResult = await verifyContent({
      contentVersionId: version1.id,
      textContent,
      brandId: brand.id,
      brandName: brand.name,
      userId: submitter.id,
      userName: submitter.name,
      userRole: submitter.role,
      forceDeterministicOnly: Boolean(forceDeterministicOnly),
      visualInput,
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
