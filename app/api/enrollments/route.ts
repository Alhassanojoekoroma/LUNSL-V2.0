import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/enrollments
// Get user's course enrollments
export async function GET(req: NextRequest) {
  try {
    let session = await getServerSession(authOptions);
    
    // Development mode: fallback to demo data if no session
    if (!session?.user?.email && process.env.NODE_ENV === 'development') {
      console.log('[Enrollments] Development mode: Returning mock enrollments');
      return NextResponse.json({
        data: [
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
      });
    }

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: user.id },
      include: {
        course: true,
        progressRecords: true,
      },
      orderBy: { enrollmentDate: "desc" },
    });

    return NextResponse.json({ data: enrollments });
  } catch (error) {
    console.error("Get enrollments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

// POST /api/enrollments
// Enroll in a course
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: user.id,
        courseId,
      },
      include: { course: true },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "ENROLLMENT",
        title: "Course Enrollment",
        message: `You've successfully enrolled in ${course.title}`,
        link: `/courses/${courseId}`,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
