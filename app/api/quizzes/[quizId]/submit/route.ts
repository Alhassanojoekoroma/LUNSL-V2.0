import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface QuizSubmission {
  [questionId: string]: string | string[]; // Answer(s) for each question
}

// POST /api/quizzes/[quizId]/submit
// Submit quiz answers and get score
export async function POST(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
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
    const { answers, duration } = body as {
      answers: QuizSubmission;
      duration: number;
    };

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Check attempt limit
    const attemptCount = await prisma.quizAttempt.count({
      where: {
        quizId: params.quizId,
        userId: user.id,
      },
    });

    if (attemptCount >= quiz.maxAttempts) {
      return NextResponse.json(
        { error: "Maximum attempts exceeded" },
        { status: 403 }
      );
    }

    // Create quiz attempt
    let totalScore = 0;
    let totalPoints = 0;
    const answerResults = [];

    // Grade the quiz
    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      const userAnswers = Array.isArray(userAnswer)
        ? userAnswer
        : [userAnswer];

      // Check if answer is correct
      const isCorrect = userAnswers.every((ans: string) =>
        question.correctAnswers.includes(ans)
      );

      const points = isCorrect ? question.points : 0;
      totalScore += points;
      totalPoints += question.points;

      answerResults.push({
        questionId: question.id,
        userAnswer: userAnswers,
        isCorrect,
        points,
        correctAnswers: question.correctAnswers,
      });
    }

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: params.quizId,
        userId: user.id,
        score: totalScore,
        totalPoints,
        duration,
        isPassed: totalScore >= (quiz.passingScore || 70),
      },
    });

    // Save individual answers
    for (const result of answerResults) {
      await prisma.quizAttemptAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: result.questionId,
          answer: Array.isArray(result.userAnswer)
            ? result.userAnswer.join(",")
            : result.userAnswer,
          isCorrect: result.isCorrect,
          points: result.points,
        },
      });
    }

    // Award tokens if passed
    if (attempt.isPassed) {
      const tokensEarned = Math.floor(totalPoints / 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { totalTokensEarned: { increment: tokensEarned } },
      });

      await prisma.tokenTransaction.create({
        data: {
          userId: user.id,
          amount: tokensEarned,
          type: "earned",
          reason: "Quiz completion",
          relatedEntityId: params.quizId,
          relatedEntityType: "quiz",
        },
      });
    }

    const percentage = (totalScore / totalPoints) * 100;

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: totalScore,
      totalPoints,
      percentage: Math.round(percentage),
      passed: attempt.isPassed,
      tokensEarned: attempt.isPassed ? Math.floor(totalPoints / 10) : 0,
      answers: answerResults,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

// GET /api/quizzes/[quizId]/results/[attemptId]
// Get quiz attempt results
export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string; attemptId: string } }
) {
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

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        answers: {
          include: { question: true },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    // Ensure user can only see their own results
    if (attempt.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId },
    });

    return NextResponse.json({
      attempt,
      quiz,
      answers: attempt.answers.map((ans) => ({
        question: ans.question,
        userAnswer: ans.answer,
        isCorrect: ans.isCorrect,
        points: ans.points,
      })),
    });
  } catch (error) {
    console.error("Get results error:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
