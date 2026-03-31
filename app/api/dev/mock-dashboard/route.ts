import { NextResponse } from 'next/server';

// Development mock dashboard endpoint
// Returns demo dashboard data without database requirement
export async function GET() {
  return NextResponse.json({
    data: {
      role: 'STUDENT',
      timestamp: new Date(),
      student: {
        enrolledCourses: 2,
        completedCourses: 0,
        averageProgress: 58,
        badges: 3,
        tokenBalance: 500,
        completedContent: 5,
        recentEnrollments: [
          {
            id: 'enroll-1',
            userId: 'dev-user-123',
            courseId: 'course-1',
            enrollmentDate: new Date().toISOString(),
            progressPercentage: 45,
            status: 'ACTIVE',
            course: {
              id: 'course-1',
              title: 'Introduction to Web Development',
              category: 'Technology',
              totalEnrollments: 234,
            },
          },
          {
            id: 'enroll-2',
            userId: 'dev-user-123',
            courseId: 'course-2',
            enrollmentDate: new Date().toISOString(),
            progressPercentage: 70,
            status: 'ACTIVE',
            course: {
              id: 'course-2',
              title: 'Advanced JavaScript',
              category: 'Technology',
              totalEnrollments: 156,
            },
          },
        ],
        recentCertificates: [],
      },
    },
  });
}
