import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_admin_01";

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const allUsers = await prisma.user.findMany({
      orderBy: { role: "asc" },
    });

    return NextResponse.json({
      currentUser: user || allUsers[0],
      availableUsers: allUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
