import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, organization } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Full Name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required." }, { status: 400 });
    }

    const validRoles = Object.values(Role);
    const assignedRole = validRoles.includes(role) ? (role as Role) : Role.AGENCY_CREATOR;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      // Return existing user for convenient login/registration flow
      return NextResponse.json({
        user: existing,
        message: "Account already exists. Logged in successfully.",
        isNew: false,
      });
    }

    // Generate random avatar placeholder from unsplash based on role
    const defaultAvatars: Record<string, string> = {
      BRAND_ADMIN: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      AGENCY_CREATOR: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      EXTERNAL_CREATOR: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      AUDITOR: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    };

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: assignedRole,
        organization: organization?.trim() || (assignedRole === Role.BRAND_ADMIN ? "Verdanta Foods Governance" : "Independent Creative Studio"),
        avatarUrl: defaultAvatars[assignedRole] || defaultAvatars.AGENCY_CREATOR,
      },
    });

    // Record audit event for user registration
    await prisma.auditLog.create({
      data: {
        action: "USER_REGISTERED",
        userId: newUser.id,
        userName: newUser.name,
        userRole: newUser.role,
        entityType: "USER",
        entityId: newUser.id,
        details: JSON.stringify({
          role: newUser.role,
          organization: newUser.organization,
          email: newUser.email,
        }),
      },
    });

    return NextResponse.json({
      user: newUser,
      message: "Account registered successfully.",
      isNew: true,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register user." }, { status: 500 });
  }
}
