import { NextRequest, NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';

/**
 * Test endpoint to trigger the credentials provider signin flow
 * This simulates what happens when a user clicks the demo login button
 */
export async function POST(request: NextRequest) {
  // We can't use signIn directly from a server-side route handler
  // Instead, queue the test for browser execution
  
  return NextResponse.json({
    message: 'This endpoint must be called from the browser as a POST request to /auth/callback/credentials instead',
    instructions: 'Use the signin page at /auth/signin with credentials provider',
  });
}

// Instead, let's create a test that validates the credentials provider can be called
export async function GET() {
  // This would normally come from body, but for testing we'll just return info
  return NextResponse.json({
    testName: 'Credentials Provider Test',
    instructions: [
      '1. Visit http://localhost:3000/auth/signin',
      '2. Enter email: test@example.com',
      '3. Click "Demo Login" button',
      '4. You should be redirected to /dashboard',
      '5. The credentials provider authorize() function should be called',
      '6. NextAuth should create a session',
    ],
  });
}
