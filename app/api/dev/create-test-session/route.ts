import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Explicitly use Node.js runtime for Prisma support
export const runtime = 'nodejs';

/**
 * Development-only endpoint to create a test user and session
 * This should ONLY be used in development environment
 */
export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    // Create or get a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: { lastLogin: new Date() },
      create: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'STUDENT',
        subscriptionTier: 'FREE',
        emailVerified: new Date(),
      },
    });

    console.log('[TEST-SESSION] Created/updated user:', testUser.id, testUser.email);

    // Create a session record for the test user
    const session = await prisma.session.create({
      data: {
        sessionToken: `test-session-${Date.now()}`,
        userId: testUser.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    console.log('[TEST-SESSION] Created session:', session.sessionToken, 'for user:', testUser.id);

    // Set NextAuth database session cookie so browser requests authenticate
    const maxAge = 30 * 24 * 60 * 60; // seconds
    const cookieValue = session.sessionToken;

    const res = NextResponse.json({
      success: true,
      user: testUser,
      message: 'Test user and session created; session cookie set.',
      instructions: 'Go to http://localhost:3000/dashboard to access the dashboard',
    });

    // Use Response cookies API when available
    try {
      res.cookies.set('next-auth.session-token', cookieValue, {
        httpOnly: true,
        path: '/',
        maxAge,
      });
      console.log('[TEST-SESSION] Cookie set:', cookieValue);
      // Also set legacy cookie name for NextAuth compatibility
      res.cookies.set('next-auth.session-token', cookieValue, {
        httpOnly: true,
        path: '/',
        maxAge,
      });
    } catch (e) {
      console.error('[TEST-SESSION] Failed to set cookie via cookies API:', e);
      // Fallback to header if cookies API isn't available
      const cookieHeader = `next-auth.session-token=${cookieValue}; Path=/; HttpOnly; Max-Age=${maxAge}`;
      res.headers.set('Set-Cookie', cookieHeader);
      console.log('[TEST-SESSION] Cookie set via header fallback');
    }

    return res;
  } catch (error) {
    console.error('Error creating test session:', error);
    return NextResponse.json(
      { error: 'Failed to create test session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
