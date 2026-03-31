import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Explicitly use Node.js runtime for full Prisma support
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Debug: Log all incoming headers
    const allHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    console.log('[DEBUG] All incoming headers:', JSON.stringify(allHeaders, null, 2));
    console.log('[DEBUG] Cookie header value:', request.headers.get('cookie'));
    
    // 1. Get the raw cookie from the request - try both methods
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('next-auth.session-token')?.value;
    const cookieFromRequest = request.cookies.get('next-auth.session-token')?.value;
    
    console.log('[DEBUG] Session token from cookies():', sessionToken);
    console.log('[DEBUG] Session token from request.cookies:', cookieFromRequest);
    console.log('[DEBUG] All cookies from cookieStore:', Array.from(cookieStore.getAll()).map(c => `${c.name}=${c.value}`).join('; '));
    console.log('[DEBUG] All cookies from request.cookies:', Array.from(request.cookies.getAll()).map(c => `${c.name}=${c.value}`).join('; '));
    
    // Use whichever method works
    const actualToken = sessionToken || cookieFromRequest;
    
    // 2. Try to query the session directly from the database
    let dbSession = null;
    let dbSessionUser = null;
    
    if (actualToken) {
      dbSession = await prisma.session.findUnique({
        where: { sessionToken: actualToken },
        include: { user: true },
      });
      console.log('[DEBUG] Session from DB query:', JSON.stringify(dbSession, null, 2));
      
      if (dbSession) {
        dbSessionUser = dbSession.user;
      }
    }
    
    // 3. Try getServerSession
    const session = await getServerSession(authOptions);
    console.log('[DEBUG SESSION] Raw session object from getServerSession:', JSON.stringify(session, null, 2));
    
    return NextResponse.json({
      cookieStep: {
        rawCookieHeader: request.headers.get('cookie'),
        cookieExists: !!actualToken,
        cookieValue: actualToken,
        methodUsed: sessionToken ? 'cookies()' : 'request.cookies',
      },
      databaseStep: {
        dbSessionExists: !!dbSession,
        dbSessionToken: dbSession?.sessionToken,
        dbSessionExpires: dbSession?.expires,
        dbSessionUserId: dbSession?.userId,
        dbSessionUserEmail: dbSessionUser?.email,
        dbSessionUserFound: !!dbSessionUser,
        fullDbSession: dbSession,
      },
      nextAuthStep: {
        sessionExists: !!session,
        fullSession: session,
        sessionSummary: session ? {
          userEmail: session.user?.email,
          userName: session.user?.name,
          userId: (session.user as any)?.id,
          userRole: (session.user as any)?.role,
          expires: session.expires,
          allUserKeys: Object.keys(session.user || {}),
        } : null,
      },
      diagnosis: {
        cookieFound: !!actualToken,
        databaseSessionFound: !!dbSession,
        databaseExpired: dbSession ? new Date() > dbSession.expires : null,
        nextAuthWorking: !!session,
        blockingPoint: !actualToken ? 'Cookie not sent' : !dbSession ? 'Database session not found' : 'Database session exists but getServerSession returns null',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DEBUG SESSION] Error:', error);
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Also allow POST to test sending data
  return GET(request);
}
