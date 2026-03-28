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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = request.nextUrl.searchParams.get('userId') || user.id;

    // Get user's certificates
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true } },
      },
      orderBy: { awardedAt: 'desc' },
    });

    // Get user's progress records
    const progress = await prisma.progressRecord.findMany({
      where: { userId },
      include: {
        content: { select: { id: true, title: true, type: true } },
      },
      orderBy: { completedAt: 'desc' },
    });

    // Get user's enrollment info
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Calculate overall stats
    const stats = {
      totalCourses: enrollments.length,
      completedCourses: certificates.length,
      totalContentCompleted: progress.filter(p => p.status === 'COMPLETED').length,
      averageProgressPercentage:
        enrollments.length > 0
          ? Math.round(
              enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) /
                enrollments.length
            )
          : 0,
    };

    return NextResponse.json({
      certificates,
      progress,
      enrollments,
      stats,
    });
  } catch (error) {
    console.error('[Progress GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
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
    const { userId, courseId, action } = body;

    if (!userId || !courseId || !action) {
      return NextResponse.json(
        { error: 'userId, courseId, and action are required' },
        { status: 400 }
      );
    }

    if (!['complete_course', 'update_progress', 'mark_content'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Verify enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'User not enrolled in course' },
        { status: 404 }
      );
    }

    if (action === 'complete_course') {
      // Create certificate
      const certificate = await prisma.certificate.create({
        data: {
          userId,
          courseId,
          certificateNumber: `CERT-${Date.now()}-${userId.slice(0, 4)}`.toUpperCase(),
          awardedAt: new Date(),
        },
        include: {
          course: { select: { id: true, title: true } },
        },
      });

      // Update enrollment status
      await prisma.courseEnrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progressPercentage: 100,
        },
      });

      return NextResponse.json(certificate, { status: 201 });
    } else if (action === 'update_progress') {
      const { progressPercentage, status } = body;

      const updated = await prisma.courseEnrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          progressPercentage: Math.min(100, progressPercentage || 0),
          status: status || 'ACTIVE',
        },
      });

      return NextResponse.json(updated);
    } else if (action === 'mark_content') {
      const { contentId } = body;

      if (!contentId) {
        return NextResponse.json(
          { error: 'contentId is required' },
          { status: 400 }
        );
      }

      const progressRecord = await prisma.progressRecord.create({
        data: {
          userId,
          contentId,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return NextResponse.json(progressRecord, { status: 201 });
    }
  } catch (error) {
    console.error('[Progress POST]', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
