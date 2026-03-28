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
      include: {
        _count: { select: { tokenTransactions: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get token balance
    const transactions = await prisma.tokenTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const balance = transactions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      userId: user.id,
      balance,
      totalTransactions: user._count.tokenTransactions,
      recentTransactions: transactions,
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
    const { userId, amount, type, description, relatedId } = body;

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

    const transaction = await prisma.tokenTransaction.create({
      data: {
        userId,
        amount,
        type,
        description: description || '',
        relatedId: relatedId || null,
      },
    });

    // Get updated balance
    const allTransactions = await prisma.tokenTransaction.findMany({
      where: { userId },
    });

    const newBalance = allTransactions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      transaction,
      newBalance,
    }, { status: 201 });
  } catch (error) {
    console.error('[Tokens POST]', error);
    return NextResponse.json(
      { error: 'Failed to process token transaction' },
      { status: 500 }
    );
  }
}
