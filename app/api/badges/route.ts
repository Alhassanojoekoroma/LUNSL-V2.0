import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = request.nextUrl.searchParams.get('userId') || user.id;

    const badges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error('[Badges GET]', error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, badgeName, description, icon } = body;

    if (!userId || !badgeName) {
      return NextResponse.json(
        { error: 'userId and badgeName are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has this badge
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeName,
      },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 400 }
      );
    }

    const badge = await prisma.userBadge.create({
      data: {
        userId,
        badgeName,
        description: description || '',
        icon: icon || '🏆',
        earnedAt: new Date(),
      },
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error('[Badges POST]', error);
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}
