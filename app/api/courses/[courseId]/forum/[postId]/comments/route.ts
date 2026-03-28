import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const comments = await prisma.forumComment.findMany({
      where: { postId: params.postId },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('[Forum Comments GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
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
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: params.postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comment = await prisma.forumComment.create({
      data: {
        content,
        postId: params.postId,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('[Forum Comments POST]', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
