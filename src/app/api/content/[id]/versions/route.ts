import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyContent } from "@/lib/verification/engine";
import { ContentStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const {
      textContent,
      changeNotes,
      submitterId,
      forceDeterministicOnly,
      imageUrl,
      imageAltText,
      detectedColors,
      detectedLogo,
    } = body;

    if (!textContent) {
      return NextResponse.json({ error: "Text content is required." }, { status: 400 });
    }

    const contentItem = await prisma.contentItem.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!contentItem) {
      return NextResponse.json({ error: "Content item not found." }, { status: 404 });
    }

    const submitter = await prisma.user.findUnique({
      where: { id: submitterId || "usr_agency_01" },
    });

    if (!submitter) throw new Error("Submitter user not found.");

    // 1. Create new version and update content pointer atomically
    const newVersion = await prisma.$transaction(async (tx) => {
      // Find the absolute highest existing version number for this content item
      const highestVersion = await tx.contentVersion.aggregate({
        where: { contentItemId: contentItem.id },
        _max: { versionNumber: true },
      });

      const maxExisting = Math.max(
        contentItem.currentVersionNumber || 1,
        highestVersion._max.versionNumber || 1
      );
      const nextVersionNumber = maxExisting + 1;

      const ver = await tx.contentVersion.create({
        data: {
          contentItemId: contentItem.id,
          versionNumber: nextVersionNumber,
          textContent,
          submittedById: submitter.id,
          changeNotes: changeNotes || `Revision v${nextVersionNumber} created via Correction Studio.`,
          status: ContentStatus.SUBMITTED,
        },
      });

      await tx.contentItem.update({
        where: { id: contentItem.id },
        data: {
          currentVersionNumber: nextVersionNumber,
          status: ContentStatus.SUBMITTED,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "VERSION_CREATED",
          userId: submitter.id,
          userName: submitter.name,
          userRole: submitter.role,
          entityType: "CONTENT_VERSION",
          entityId: ver.id,
          details: JSON.stringify({
            contentItemId: contentItem.id,
            versionNumber: nextVersionNumber,
            changeNotes,
          }),
        },
      });

      return ver;
    });

    const visualInput =
      imageUrl || imageAltText || detectedColors || detectedLogo
        ? {
            imageUrl: imageUrl || null,
            imageAltText: imageAltText || null,
            detectedColors: detectedColors || [],
            detectedLogo: detectedLogo || null,
          }
        : undefined;

    // 4. Run verification engine on the new version
    const verification = await verifyContent({
      contentVersionId: newVersion.id,
      textContent,
      brandId: contentItem.brandId,
      brandName: contentItem.brand.name,
      userId: submitter.id,
      userName: submitter.name,
      userRole: submitter.role,
      forceDeterministicOnly: Boolean(forceDeterministicOnly),
      visualInput,
    });

    return NextResponse.json({
      version: newVersion,
      verification,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
