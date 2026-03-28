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
    const contentId = request.nextUrl.searchParams.get('contentId');

    const where: any = { userId: user.id };
    if (contentId) {
      where.contentId = contentId;
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          content: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Notes GET]', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
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
    const { content, contentId, tag } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify content exists if contentId provided
    if (contentId) {
      const contentItem = await prisma.content.findUnique({
        where: { id: contentId },
      });
      if (!contentItem) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }
    }

    const note = await prisma.note.create({
      data: {
        content,
        userId: user.id,
        contentId: contentId || null,
        tag: tag || '',
      },
      include: {
        content: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('[Notes POST]', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
