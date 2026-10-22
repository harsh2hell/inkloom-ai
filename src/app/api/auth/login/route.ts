import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, userId } = body;

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User account not found. Please check your email or register a new profile." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
      message: "Logged in successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log in." }, { status: 500 });
  }
}
