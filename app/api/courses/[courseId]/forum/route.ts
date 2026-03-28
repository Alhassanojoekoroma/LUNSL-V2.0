import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where: { courseId },
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumPost.count({ where: { courseId } }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Forum GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch forum posts' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
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
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Verify user is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId,
        },
      },
    });

    if (!enrollment && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You must be enrolled in this course' },
        { status: 403 }
      );
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        courseId: params.courseId,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('[Forum POST]', error);
    return NextResponse.json(
      { error: 'Failed to create forum post' },
      { status: 500 }
    );
  }
}
