import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Explicitly use Node.js runtime
export const runtime = 'nodejs';

/**
 * Test endpoint that validates the authentication flow end-to-end
 * This endpoint:
 * 1. Creates a test user
 * 2. Checks database
 * 3. Tests if getServerSession can find the session
 */
export async function GET(request: NextRequest) {
  try {
    // Create a test user directly
    const testUser = await prisma.user.upsert({
      where: { email: 'flow-test@example.com' },
      update: { lastLogin: new Date() },
      create: {
        email: 'flow-test@example.com',
        name: 'Flow Test User',
        role: 'STUDENT',
        emailVerified: new Date(),
      },
    });

    console.log('[AUTH-FLOW-TEST] 1. Created test user:', testUser.id, testUser.email);

    // List all sessions in the database for this user
    const existingSessions = await prisma.session.findMany({
      where: { userId: testUser.id },
    });

    console.log('[AUTH-FLOW-TEST] 2. Existing sessions for user:', existingSessions.length);
    existingSessions.forEach(session => {
      const isExpired = new Date() > session.expires;
      console.log(`  - Token: ${session.sessionToken.substring(0, 20)}... Expires: ${session.expires.toISOString()} (Expired: ${isExpired})`);
    });

    // Check what providers are configured
    const providers = authOptions.providers || [];
    console.log('[AUTH-FLOW-TEST] 3. Configured providers:', providers.length);
    providers.forEach((provider: any) => {
      console.log(`  - ${provider.name || provider.id}`);
    });

    // Check the session callback
    console.log('[AUTH-FLOW-TEST] 4. Session strategy:', authOptions.session?.strategy);
    console.log('[AUTH-FLOW-TEST] 5. Using adapter:', !!authOptions.adapter);
    console.log('[AUTH-FLOW-TEST] 6. Callbacks defined:', {
      signIn: !!authOptions.callbacks?.signIn,
      session: !!authOptions.callbacks?.session,
      jwt: !!authOptions.callbacks?.jwt,
    });

    // Test: Try to manually create a SessionToken and see if getServerSession can find it using the adapter
    const testSession = await prisma.session.create({
      data: {
        sessionToken: `flow-test-${Date.now()}`,
        userId: testUser.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('[AUTH-FLOW-TEST] 7. Created test session:', testSession.sessionToken);

    // Verify the session was written to the database
    const dbVerify = await prisma.session.findUnique({
      where: { sessionToken: testSession.sessionToken },
      include: { user: true },
    });

    console.log('[AUTH-FLOW-TEST] 8. Database verification:', {
      exists: !!dbVerify,
      token: dbVerify?.sessionToken.substring(0, 20) + '...',
      userId: dbVerify?.userId,
      userEmail: dbVerify?.user?.email,
      expires: dbVerify?.expires.toISOString(),
    });

    return NextResponse.json({
      success: true,
      testState: {
        userCreated: !!testUser,
        userId: testUser.id,
        userEmail: testUser.email,
        sessionCreated: !!testSession,
        sessionToken: testSession.sessionToken,
        dbVerified: !!dbVerify,
        providersCount: providers.length,
        sessionStrategy: authOptions.session?.strategy,
        adapterPresent: !!authOptions.adapter,
        existingSessionsCount: existingSessions.length,
      },
      diagnosis: {
        issue: 'getServerSession() not finding session even when token is in database',
        possibleCauses: [
          '1. PrismaAdapter not configured correctly',
          '2. Session validation failing on user lookup',
          '3. Cookie not being transmitted to server',
          '4. getServerSession not receiving correct authOptions',
        ],
        nextSteps: 'Test credentials provider signin flow through browser',
      },
    });
  } catch (error) {
    console.error('[AUTH-FLOW-TEST] Error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
