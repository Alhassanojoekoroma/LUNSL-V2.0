import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('[Dashboard] Request headers:', {
      cookie: request.headers.get('cookie')?.slice(0, 100),
      authorization: request.headers.get('authorization'),
    });

    // Try to get session
    let session = await getServerSession(authOptions);
    console.log('[Dashboard] Session found:', !!session, session?.user?.email);
    
    // Development mode: fallback to demo user if no session
    if (!session?.user?.email && process.env.NODE_ENV === 'development') {
      console.log('[Dashboard] Development mode: Using mock data');
      
      // Return mock dashboard data directly
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
                user_id: 'dev-user-123',
                course_id: 'course-1',
                enrolled_at: new Date().toISOString(),
                progress_percentage: 45,
                status: 'ACTIVE',
                course: {
                  id: 'course-1',
                  title: 'Introduction to Web Development',
                  description: 'Learn the fundamentals of web development',
                  progress_percentage: 45,
                },
              },
              {
                id: 'enroll-2',
                user_id: 'dev-user-123',
                course_id: 'course-2',
                enrolled_at: new Date().toISOString(),
                progress_percentage: 70,
                status: 'ACTIVE',
                course: {
                  id: 'course-2',
                  title: 'Advanced JavaScript',
                  description: 'Master advanced JavaScript concepts',
                  progress_percentage: 70,
                },
              },
            ],
            recentCertificates: [],
          },
        },
      });
    }

    if (!session?.user?.email) {
      console.log('[Dashboard] No session found, returning 401');
      return NextResponse.json({ error: 'Unauthorized', debug: 'No active session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let data: any = {
      role: user.role,
      timestamp: new Date(),
    };

    if (user.role === 'STUDENT') {
      // Student dashboard
      const [enrollments, certificates, badges, progress, userStats] =
        await Promise.all([
          prisma.courseEnrollment.findMany({
            where: { userId: user.id },
            include: {
              course: { select: { id: true, title: true, category: true } },
            },
            orderBy: { enrollmentDate: 'desc' },
            take: 10,
          }),
          prisma.certificate.findMany({
            where: { userId: user.id },
            orderBy: { issueDate: 'desc' },
            take: 5,
          }),
          prisma.userBadge.findMany({
            where: { userId: user.id },
            include: { badge: { select: { name: true, icon: true } } },
          }),
          prisma.progressRecord.findMany({
            where: { userId: user.id },
          }),
          prisma.user.findUnique({
            where: { id: user.id },
            select: { totalTokensEarned: true },
          }),
        ]);

      const completedContent = progress.filter(p => p.status === 'COMPLETED').length;

      data.student = {
        enrolledCourses: enrollments.length,
        completedCourses: certificates.length,
        averageProgress: enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / enrollments.length)
          : 0,
        badges: badges.length,
        tokenBalance: userStats?.totalTokensEarned || 0,
        completedContent,
        recentEnrollments: enrollments,
        recentCertificates: certificates,
      };
    } else if (user.role === 'LECTURER') {
      // Lecturer dashboard - get courses created by this user (through Content)
      const createdContents = await prisma.content.findMany({
        where: { createdById: user.id },
        include: { course: { select: { id: true, title: true } } },
      });

      const uniqueCourses = Array.from(
        new Map(createdContents.map(c => [c.course.id, c.course])).values()
      );

      const contentByCoursId = new Map<string, number>();
      const enrollmentsByCoursId = new Map<string, number>();

      // Count enrollments per course
      for (const course of uniqueCourses) {
        const count = await prisma.courseEnrollment.count({
          where: { courseId: course.id },
        });
        enrollmentsByCoursId.set(course.id, count);
      }

      // Count content per course
      for (const course of uniqueCourses) {
        const count = await prisma.content.count({
          where: { courseId: course.id },
        });
        contentByCoursId.set(course.id, count);
      }

      data.lecturer = {
        totalCourses: uniqueCourses.length,
        totalStudents: enrollmentsByCoursId.size,
        totalContent: createdContents.length,
        totalQuizzes: 0,
        forumPostsPending: 0,
        courses: uniqueCourses.map(c => ({
          id: c.id,
          title: c.title,
          students: enrollmentsByCoursId.get(c.id) || 0,
          content: contentByCoursId.get(c.id) || 0,
          quizzes: 0,
        })),
      };
    } else if (user.role === 'ADMIN') {
      // Admin dashboard
      const [
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalQuizzes,
        usersByRole,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.courseEnrollment.count(),
        prisma.quiz.count(),
        prisma.user.groupBy({
          by: ['role'],
          _count: { id: true },
        }),
      ]);

      const topCourses = await prisma.course.findMany({
        include: { _count: { select: { enrollments: true } } },
        orderBy: { enrollments: { _count: 'desc' } },
        take: 5,
      });

      const roleDistribution = usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.id;
        return acc;
      }, {} as Record<string, number>);

      data.admin = {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalQuizzes,
        roleDistribution,
        topCourses: topCourses.map(c => ({
          id: c.id,
          title: c.title,
          enrollments: c._count.enrollments,
        })),
      };
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[Dashboard GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
