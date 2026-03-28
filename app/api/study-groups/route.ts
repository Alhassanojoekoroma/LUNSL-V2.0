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
    const courseId = request.nextUrl.searchParams.get('courseId');

    const skip = (page - 1) * limit;

    const where: any = {
      members: {
        some: { id: user.id },
      },
    };

    if (courseId) {
      where.courseId = courseId;
    }

    const [groups, total] = await Promise.all([
      prisma.studyGroup.findMany({
        where,
        include: {
          course: { select: { id: true, title: true } },
          _count: { select: { members: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studyGroup.count({ where }),
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
    const { name, description, courseId, maxMembers } = body;

    if (!name || !courseId) {
      return NextResponse.json(
        { error: 'Name and courseId are required' },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const group = await prisma.studyGroup.create({
      data: {
        name,
        description: description || '',
        courseId,
        createdById: user.id,
        maxMembers: maxMembers || 10,
        members: {
          connect: { id: user.id },
        },
      },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('[Study Groups POST]', error);
    return NextResponse.json(
      { error: 'Failed to create study group' },
      { status: 500 }
    );
  }
}
