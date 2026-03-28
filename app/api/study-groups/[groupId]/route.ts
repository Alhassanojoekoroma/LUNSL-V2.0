import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const group = await prisma.studyGroup.findUnique({
      where: { id: params.groupId },
      include: {
        course: { select: { id: true, title: true } },
        members: { select: { id: true, name: true, email: true, image: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true } },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('[Study Group GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch study group' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
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
    const { action } = body; // 'join' or 'leave'

    if (!action || !['join', 'leave'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "join" or "leave"' },
        { status: 400 }
      );
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id: params.groupId },
      include: { _count: { select: { members: true } } },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (action === 'join') {
      if (group._count.members >= group.maxMembers) {
        return NextResponse.json(
          { error: 'Group is full' },
          { status: 400 }
        );
      }

      const updated = await prisma.studyGroup.update({
        where: { id: params.groupId },
        data: {
          members: {
            connect: { id: user.id },
          },
        },
        include: {
          _count: { select: { members: true } },
        },
      });

      return NextResponse.json(updated);
    } else {
      const updated = await prisma.studyGroup.update({
        where: { id: params.groupId },
        data: {
          members: {
            disconnect: { id: user.id },
          },
        },
      });

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('[Study Group Action]', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
