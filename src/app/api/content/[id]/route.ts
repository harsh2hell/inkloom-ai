import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const contentItem = await prisma.contentItem.findUnique({
      where: { id },
      include: {
        brand: true,
        submitter: true,
        versions: {
          orderBy: { versionNumber: "desc" },
          include: {
            submittedBy: true,
            analysisRuns: {
              orderBy: { createdAt: "desc" },
              include: {
                findings: {
                  orderBy: [{ severity: "asc" }, { createdAt: "asc" }],
                },
              },
            },
            reviews: {
              include: { reviewer: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!contentItem) {
      return NextResponse.json({ error: "Content item not found." }, { status: 404 });
    }

    return NextResponse.json(contentItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
