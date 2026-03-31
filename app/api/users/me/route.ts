import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/me
// Get current user profile
export async function GET(req: NextRequest) {
  try {
    let session = await getServerSession(authOptions);
    
    // Development mode: fallback to mock user if no session
    if (!session?.user?.email && process.env.NODE_ENV === 'development') {
      console.log('[Auth] Development mode: Returning mock user data');
      return NextResponse.json({
        data: {
          id: 'dev-user-123',
          email: 'test@example.com',
          name: 'Demo Student',
          image: null,
          role: 'STUDENT',
          subscriptionTier: 'FREE',
          totalTokensEarned: 500,
          enrollments: [],
          badges: [],
          certificates: [],
          profile: null,
        },
      });
    }

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        enrollments: {
          include: { course: true },
        },
        badges: {
          include: { badge: true },
        },
        certificates: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/me
// Update current user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      bio,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      postalCode,
      theme,
      emailNotifications,
      pushNotifications,
      language,
    } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name, 
        bio,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        address,
        city,
        state,
        country,
        postalCode,
        theme,
        emailNotifications,
        pushNotifications,
        language,
      },
      include: { profile: true },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/me
// Delete user account
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Soft delete - mark as deleted
    await prisma.user.update({
      where: { email: session.user.email },
      data: { status: "DELETED" },
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
