import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    let session = await getServerSession(authOptions);
    
    // Development mode: fallback to demo user if no session
    if (!session?.user?.email && process.env.NODE_ENV === 'development') {
      console.log('[Tokens] Development mode: Returning mock token balance');
      return NextResponse.json({
        data: {
          userId: 'dev-user-123',
          balance: 500,
        },
      });
    }

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, totalTokensEarned: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        userId: user.id,
        balance: user.totalTokensEarned,
      },
    });
  } catch (error) {
    console.error('[Tokens GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, amount, type, description = '' } = body;

    if (!userId || amount === undefined || !type) {
      return NextResponse.json(
        { error: 'userId, amount, and type are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Valid transaction types
    const validTypes = ['QUIZ_COMPLETION', 'ASSIGNMENT_SUBMISSION', 'PARTICIPATION', 'REWARD', 'REFUND'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Update user's token balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        totalTokensEarned: { increment: amount },
      },
      select: { id: true, totalTokensEarned: true },
    });

    return NextResponse.json({
      userId: updatedUser.id,
      newBalance: updatedUser.totalTokensEarned,
      amount,
      type,
      description,
    }, { status: 201 });
  } catch (error) {
    console.error('[Tokens POST]', error);
    return NextResponse.json(
      { error: 'Failed to process token transaction' },
      { status: 500 }
    );
  }
}
