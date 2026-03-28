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
      const [enrollments, certificates, badges, tokens, progress] =
        await Promise.all([
          prisma.courseEnrollment.findMany({
            where: { userId: user.id },
            include: {
              course: { select: { id: true, title: true, category: true } },
            },
          }),
          prisma.certificate.findMany({
            where: { userId: user.id },
            include: { course: { select: { title: true } } },
          }),
          prisma.userBadge.findMany({
            where: { userId: user.id },
          }),
          prisma.tokenTransaction.findMany({
            where: { userId: user.id },
          }),
          prisma.progressRecord.findMany({
            where: { userId: user.id },
            include: { content: { select: { title: true, type: true } } },
          }),
        ]);

      const tokenBalance = tokens.reduce((sum, t) => sum + t.amount, 0);
      const completedContent = progress.filter(p => p.status === 'COMPLETED').length;

      data.student = {
        enrolledCourses: enrollments.length,
        completedCourses: certificates.length,
        averageProgress: enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / enrollments.length)
          : 0,
        badges: badges.length,
        tokenBalance,
        completedContent,
        recentEnrollments: enrollments.slice(0, 5),
        recentCertificates: certificates.slice(0, 5),
      };
    } else if (user.role === 'LECTURER') {
      // Lecturer dashboard
      const [courses, studentsEnrolled, totalQuizzes, reviewPending] =
        await Promise.all([
          prisma.course.findMany({
            where: { lecturerId: user.id },
            include: {
              _count: {
                select: { enrollments: true, content: true, quizzes: true },
              },
            },
          }),
          prisma.courseEnrollment.findMany({
            where: {
              course: { lecturerId: user.id },
            },
            select: { userId: true },
            distinct: ['userId'],
          }),
          prisma.quiz.findMany({
            where: {
              course: { lecturerId: user.id },
            },
          }),
          prisma.forumPost.findMany({
            where: {
              course: { lecturerId: user.id },
            },
            include: { _count: { select: { comments: true } } },
          }),
        ]);

      data.lecturer = {
        totalCourses: courses.length,
        totalStudents: studentsEnrolled.length,
        totalContent: courses.reduce((sum, c) => sum + (c._count.content || 0), 0),
        totalQuizzes: totalQuizzes.length,
        forumPostsPending: reviewPending.length,
        courses: courses.map(c => ({
          id: c.id,
          title: c.title,
          students: c._count.enrollments,
          content: c._count.content,
          quizzes: c._count.quizzes,
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Dashboard GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
