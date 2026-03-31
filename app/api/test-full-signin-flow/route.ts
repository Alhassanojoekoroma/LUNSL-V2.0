import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Explicitly use Node.js runtime
export const runtime = 'nodejs';

/**
 * Test endpoint that simulates a complete signin flow programmatically
 * This endpoint:
 * 1. Simulates calling the credentials provider
 * 2. Creates the necessary database records
 * 3. Tests if getServerSession can retrieve the session
 */
export async function GET(request: NextRequest) {
  try {
    // Step 0: Log what we have
    console.log('[FULL-FLOW-TEST] authOptions.providers:', authOptions.providers?.length,  'providers');

    // Step 1: Get the credentials provider from authOptions
    const credentialsProvider = authOptions.providers?.find(
      (p: any) => p.id === 'credentials' || p.name === 'Demo Login'
    ) as any;

    if (!credentialsProvider) {
      console.log('[FULL-FLOW-TEST] Credentials provider not found!');
      console.log('[FULL-FLOW-TEST] ProviderIDs:', authOptions.providers?.map((p: any) => p.id || p.name));
      return NextResponse.json({
        error: 'Credentials provider not found',
        providers: authOptions.providers?.map((p: any) => ({ id: p.id, name: p.name })),
      }, { status: 400 });
    }

    console.log('[FULL-FLOW-TEST] 1. Credentials provider found:', credentialsProvider.name || credentialsProvider.id);
    console.log('[FULL-FLOW-TEST] 2. Authorize function exists:', typeof credentialsProvider.authorize);

    // Step 2: Call the authorize function directly (manually, not through NextAuth)
    let authorizedUser = null;
    try {
      // The credentials object should match the format from the form
      const credentials = {
        email: 'full-flow-test@example.com',
      };
      
      console.log('[FULL-FLOW-TEST] 3. About to call authorize with:', credentials);
      
      // Call authorize directly
      const result = await credentialsProvider.authorize(credentials);
      
      authorizedUser = result;
      console.log('[FULL-FLOW-TEST] 4. Authorize returned:', result);
    } catch (err) {
      console.error('[FULL-FLOW-TEST] 4. Authorize threw error:', err);
      return NextResponse.json({
        error: 'Authorize failed',
        message: err instanceof Error ? err.message : String(err),
      }, { status: 400 });
    }

    // Step 3: If authorize succeeded, check if SESSION was created by NextAuth
    // (This wouldn't happen in a real signin flow since we're not going through NextAuth)
    const potentialSession = await prisma.session.findFirst({
      where: { user: { email: 'full-flow-test@example.com' } },
      include: { user: true },
    });

    console.log('[FULL-FLOW-TEST] 5. Session in DB:', potentialSession ? 'found' : 'not found');

    return NextResponse.json({
      success: true,
      flowState: {
        credentialsProviderFound: !!credentialsProvider,
        authorizeSucceeded: !!authorizedUser,
        authorizedUser: {
          id: authorizedUser?.id,
          email: authorizedUser?.email,
          name: authorizedUser?.name,
        },
        sessionFoundInDB: !!potentialSession,
      },
      diagnosis: {
        status: 'Credentials provider authorize function works',
        note: 'Full session creation  only happens through NextAuth signin endpoint',
        nextStep: 'Test through /auth/callback/credentials or browser signin page',
      },
    });
  } catch (error) {
    console.error('[FULL-FLOW-TEST] Error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
