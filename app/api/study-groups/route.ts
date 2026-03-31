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

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const [groups, total] = await Promise.all([
      prisma.studyGroup.findMany({
        where: {
          members: {
            some: { userId: user.id },
          },
        },
        include: {
          _count: { select: { members: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studyGroup.count({
        where: {
          members: {
            some: { userId: user.id },
          },
        },
      }),
    ]);

    return NextResponse.json({
      groups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Study Groups GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch study groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, maxMembers = 10 } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const group = await prisma.studyGroup.create({
      data: {
        name,
        description: description || '',
        maxMembers,
      },
    });

    // Add creator as member
    await prisma.studyGroupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        role: 'admin',
      },
    });

    const groupWithMembers = await prisma.studyGroup.findUnique({
      where: { id: group.id },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(groupWithMembers, { status: 201 });
  } catch (error) {
    console.error('[Study Groups POST]', error);
    return NextResponse.json(
      { error: 'Failed to create study group' },
      { status: 500 }
    );
  }
}
