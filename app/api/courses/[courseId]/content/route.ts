import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only lecturers and admins can upload content' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      contentUrl,
      duration,
      sequenceNumber,
    } = body;

    if (!title || !type || !contentUrl) {
      return NextResponse.json(
        { error: 'title, type, and contentUrl are required' },
        { status: 400 }
      );
    }

    // Verify course exists and user is the lecturer or admin
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (
      course.lecturerId !== user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'You can only upload content to your own courses' },
        { status: 403 }
      );
    }

    // Get the highest sequence number for this course
    const lastContent = await prisma.content.findFirst({
      where: { courseId: params.courseId },
      orderBy: { sequenceNumber: 'desc' },
    });

    const nextSequence = sequenceNumber || (lastContent?.sequenceNumber || 0) + 1;

    const content = await prisma.content.create({
      data: {
        title,
        description: description || '',
        type: type as any,
        contentUrl,
        duration: duration || 0,
        courseId: params.courseId,
        sequenceNumber: nextSequence,
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('[Content Upload]', error);
    return NextResponse.json(
      { error: 'Failed to upload content' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const content = await prisma.content.findMany({
      where: { courseId: params.courseId },
      orderBy: { sequenceNumber: 'asc' },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('[Content GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
