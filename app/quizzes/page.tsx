'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Zap,
  ChevronRight,
  Play,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { enrollmentAPI } from '@/lib/api-client'
import { format, isPast } from 'date-fns'

interface Quiz {
  id: string
  title: string
  description?: string
  course_id: string
  duration_minutes: number
  total_questions: number
  passing_score: number
  created_at: string
  updated_at: string
}

interface QuizAttempt {
  id: string
  quiz_id: string
  score?: number
  percentage?: number
  status: 'completed' | 'pending' | 'in_progress'
  started_at?: string
  completed_at?: string
}

export default function QuizzesPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [quizStarted, setQuizStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [quizStarted, timeLeft])

  if (!mounted || !user) return null

  const mockQuizzes = [
    {
      id: 1,
      title: 'Calculus I - Limits & Continuity',
      module: 'MATH 101',
      faculty: 'FICT',
      questions: 20,
      duration: 30,
      difficulty: 'medium',
      attempts: 2,
      maxAttempts: 3,
      bestScore: 85,
      status: 'completed',
      dueDate: '2026-04-15',
      passingScore: 70,
    },
    {
      id: 2,
      title: 'Web Development - JavaScript Basics',
      module: 'CS 201',
      faculty: 'FICT',
      questions: 25,
      duration: 45,
      difficulty: 'easy',
      attempts: 0,
      maxAttempts: 3,
      bestScore: null,
      status: 'pending',
      dueDate: '2026-03-30',
      passingScore: 60,
    },
    {
      id: 3,
      title: 'Data Structures - Trees & Graphs',
      module: 'CS 301',
      faculty: 'FICT',
      questions: 30,
      duration: 60,
      difficulty: 'hard',
      attempts: 1,
      maxAttempts: 3,
      bestScore: 55,
      status: 'failed',
      dueDate: '2026-04-10',
      passingScore: 70,
    },
    {
      id: 4,
      title: 'Physics I - Motion & Forces',
      module: 'PHYS 101',
      faculty: 'FST',
      questions: 15,
      duration: 20,
      difficulty: 'easy',
      attempts: 1,
      maxAttempts: 2,
      bestScore: 92,
      status: 'completed',
      dueDate: '2026-03-25',
      passingScore: 60,
    },
    {
      id: 5,
      title: 'Chemistry - Periodic Table & Reactions',
      module: 'CHEM 102',
      faculty: 'FST',
      questions: 22,
      duration: 35,
      difficulty: 'medium',
      attempts: 0,
      maxAttempts: 3,
      bestScore: null,
      status: 'pending',
      dueDate: '2026-04-20',
      passingScore: 70,
    },
  ]

  const quizQuestions = [
    {
      id: 1,
      question: 'What is the limit of (x² - 1)/(x - 1) as x approaches 1?',
      type: 'multiple-choice',
      options: ['0', '1', '2', 'Undefined'],
      correctAnswer: '2',
    },
    {
      id: 2,
      question: 'Which of the following is NOT a JavaScript data type?',
      type: 'multiple-choice',
      options: ['String', 'Number', 'Boolean', 'Character'],
      correctAnswer: 'Character',
    },
    {
      id: 3,
      question: 'Define continuity at a point.',
      type: 'essay',
      options: [],
      correctAnswer: 'A function is continuous at a point if the limit equals the function value',
    },
  ]

  const filteredQuizzes = mockQuizzes.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'completed') return matchSearch && q.status === 'completed'
    if (filter === 'pending') return matchSearch && q.status === 'pending'
    if (filter === 'failed') return matchSearch && q.status === 'failed'
    return matchSearch
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuizData = activeQuiz ? mockQuizzes.find((q) => q.id === activeQuiz) : null
  const currentQuestionData = quizQuestions[currentQuestion]

  const handleAnswerChange = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }))
  }

  const handleSubmitQuiz = () => {
    const correct = Object.entries(answers).filter(
      ([idx, ans]) => quizQuestions[parseInt(idx)].correctAnswer === ans
    ).length
    const score = Math.round((correct / quizQuestions.length) * 100)
    setQuizStarted(false)
    setActiveQuiz(null)
    setCurrentQuestion(0)
    setAnswers({})
    alert(`Quiz submitted! Your score: ${score}%`)
  }

  if (activeQuiz && quizStarted && currentQuizData) {
    return (
      <AppShell title="Quiz">
        <div className="space-y-4">
          {/* Quiz Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{currentQuizData.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              timeLeft > 300 ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress */}
          <Card>
            <CardContent className="p-4">
              <Progress value={(currentQuestion / quizQuestions.length) * 100} />
            </CardContent>
          </Card>

          {/* Question */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-6">{currentQuestionData.question}</h2>

              <RadioGroup value={answers[currentQuestion] || ''} onValueChange={handleAnswerChange}>
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
              disabled={currentQuestion === 0}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>

            <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
              {currentQuestion < quizQuestions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion((p) => p + 1)}
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  if (activeQuiz && !quizStarted && currentQuizData) {
    return (
      <AppShell title="Quiz">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentQuizData.title}</CardTitle>
              <CardDescription>{currentQuizData.module}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" />
                    {currentQuizData.duration} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                    <BookOpen className="w-4 h-4" />
                    {currentQuizData.questions} questions
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <Badge className="mt-1 capitalize" variant="outline">
                    {currentQuizData.difficulty}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pass Score</p>
                  <p className="text-lg font-semibold mt-1">{currentQuizData.passingScore}%</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Attempt Status</h3>
                <p className="text-sm text-muted-foreground">
                  Attempts: {currentQuizData.attempts} / {currentQuizData.maxAttempts}
                </p>
                {currentQuizData.bestScore !== null && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Best Score: <span className="font-semibold text-primary">{currentQuizData.bestScore}%</span>
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground italic">
                ⚠️ Once you start the quiz, you'll have {currentQuizData.duration} minutes to complete it.
              </p>

              <div className="flex gap-3 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setActiveQuiz(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setQuizStarted(true)}
                  className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4" />
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Quizzes & Assessments">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quizzes & Assessments</h1>
          <p className="text-sm text-muted-foreground mt-1">Test your knowledge and track progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Completed</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {filteredQuizzes.filter((q) => q.status === 'completed').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Pending</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {filteredQuizzes.filter((q) => q.status === 'pending').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Avg Score</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {filteredQuizzes.filter((q) => q.bestScore).length > 0
                  ? Math.round(
                      filteredQuizzes
                        .filter((q) => q.bestScore)
                        .reduce((sum, q) => sum + (q.bestScore || 0), 0) /
                        filteredQuizzes.filter((q) => q.bestScore).length
                    )
                  : '-'}
                %
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Pass Rate</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {filteredQuizzes.filter((q) => q.status === 'completed').length > 0
                  ? Math.round(
                      (filteredQuizzes.filter((q) => q.status === 'completed' && q.bestScore! >= q.passingScore).length /
                        filteredQuizzes.filter((q) => q.status === 'completed').length) *
                        100
                    )
                  : '-'}
                %
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
                <TabsTrigger value="failed" className="text-xs sm:text-sm">Failed</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quizzes List */}
        <div className="space-y-3">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base">{quiz.title}</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {quiz.status}
                      </Badge>
                      <Badge
                        variant={
                          quiz.difficulty === 'easy'
                            ? 'secondary'
                            : quiz.difficulty === 'medium'
                              ? 'default'
                              : 'destructive'
                        }
                        className="text-xs capitalize"
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {quiz.module} • {quiz.questions} questions • {quiz.duration} min
                    </p>
                    {quiz.bestScore !== null && (
                      <div className="flex items-center gap-2 mt-2">
                        {quiz.bestScore >= quiz.passingScore ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-xs font-semibold">
                          Best: {quiz.bestScore}% {quiz.bestScore >= quiz.passingScore ? '✓ Passed' : '✗ Failed'}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setActiveQuiz(quiz.id)
                      setQuizStarted(false)
                    }}
                    className="w-full sm:w-auto gap-2"
                    disabled={quiz.attempts >= quiz.maxAttempts && quiz.status === 'pending'}
                  >
                    {quiz.status === 'pending' ? (
                      <>
                        <Play className="w-4 h-4" />
                        <span className="hidden sm:inline">Start Quiz</span>
                        <span className="sm:hidden">Take</span>
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        <span className="hidden sm:inline">View Results</span>
                        <span className="sm:hidden">View</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
