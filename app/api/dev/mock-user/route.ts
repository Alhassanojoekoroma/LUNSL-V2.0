import { NextResponse } from 'next/server';

// Development mock user endpoint
// Returns a demo user without database requirement
export async function GET() {
  return NextResponse.json({
    data: {
      id: 'dev-user-123',
      email: 'test@example.com',
      name: 'Demo User',
      image: null,
      role: 'STUDENT',
      subscriptionTier: 'FREE',
      totalTokensEarned: 500,
      enrollments: [
        {
          id: 'enroll-1',
          userId: 'dev-user-123',
          courseId: 'course-1',
          enrollmentDate: new Date().toISOString(),
          completionDate: null,
          status: 'ACTIVE',
          progressPercentage: 45,
          totalHoursSpent: 12.5,
          course: {
            id: 'course-1',
            title: 'Introduction to Web Development',
            category: 'Technology',
            slug: 'intro-web-dev',
          },
        },
        {
          id: 'enroll-2',
          userId: 'dev-user-123',
          courseId: 'course-2',
          enrollmentDate: new Date().toISOString(),
          completionDate: null,
          status: 'ACTIVE',
          progressPercentage: 70,
          totalHoursSpent: 25.0,
          course: {
            id: 'course-2',
            title: 'Advanced JavaScript',
            category: 'Technology',
            slug: 'advanced-js',
          },
        },
      ],
      badges: [],
      certificates: [],
      profile: null,
    },
  });
}
