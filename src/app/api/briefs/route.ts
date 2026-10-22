import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCreatorBrief } from "@/lib/briefs/generator";
import { canGenerateBrief, UserContext } from "@/lib/auth/roles";

export async function GET() {
  try {
    const briefs = await prisma.creatorBrief.findMany({
      include: {
        brand: true,
        sourceContentVersion: {
          include: { contentItem: true },
        },
        creatorSubmissions: {
          include: { creator: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(briefs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentVersionId, userId, userName, userRole } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found.");

    const userContext: UserContext = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
    };

    const perm = canGenerateBrief(userContext);
    if (!perm.allowed) {
      return NextResponse.json({ error: perm.reason }, { status: 403 });
    }

    const brief = await generateCreatorBrief({
      contentVersionId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    return NextResponse.json(brief);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
