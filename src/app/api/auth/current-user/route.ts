import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/db/migrate";

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSchema();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_admin_01";

    let allUsers = await prisma.user.findMany({
      orderBy: { role: "asc" },
    });

    // Auto-bootstrap default personas if database is freshly deployed / unseeded
    if (allUsers.length === 0) {
      await prisma.user.createMany({
        data: [
          {
            id: "usr_owner_01",
            name: "Elena Vance",
            email: "elena.vance@verdantafoods.demo",
            role: "BRAND_OWNER",
            organization: "Verdanta Foods Executive",
            avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
          },
          {
            id: "usr_admin_01",
            name: "Sarah Chen",
            email: "sarah.chen@verdantafoods.demo",
            role: "BRAND_ADMIN",
            organization: "Verdanta Foods Governance",
            avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
          },
          {
            id: "usr_agency_01",
            name: "Alex Rivera",
            email: "alex.rivera@apexmarketing.demo",
            role: "AGENCY_CREATOR",
            organization: "Apex Creative Agency",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          },
          {
            id: "usr_creator_01",
            name: "Maya Patel",
            email: "maya.creates@contentlab.demo",
            role: "EXTERNAL_CREATOR",
            organization: "Independent Creator Studio",
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          },
          {
            id: "usr_auditor_01",
            name: "David Thorne",
            email: "david.thorne@complianceaudit.demo",
            role: "AUDITOR",
            organization: "Global Standards Assurance",
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
          },
        ],
        skipDuplicates: true,
      });

      const brandCount = await prisma.brand.count();
      if (brandCount === 0) {
        await prisma.brand
          .create({
            data: {
              id: "brand_verdanta_01",
              name: "Verdanta Foods",
              description: "Wholesome plant-based nutrition snacks and bars.",
              isFictionalDemo: true,
            },
          })
          .catch(() => {});
      }

      allUsers = await prisma.user.findMany({
        orderBy: { role: "asc" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json({
      currentUser: user || allUsers[0],
      availableUsers: allUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
