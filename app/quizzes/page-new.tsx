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
  const { user, isLoading: authLoading } = useAuthStore()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')

  useEffect(() => {
    if (!authLoading && user) {
      loadQuizzes()
    }
  }, [user, authLoading])

  const loadQuizzes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load enrollments to get associated quizzes
      const enrollments = await enrollmentAPI.getEnrollments()
      
      // In a real scenario, we would fetch quizzes from each course
      // For now, we'll use the enrollments to show the structure
      setQuizzes([])
      setAttempts([])
    } catch (err) {
      console.error('Failed to load quizzes:', err)
      setError('Failed to load quizzes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getQuizStatus = (quiz: Quiz) => {
    const attempt = attempts.find((a) => a.quiz_id === quiz.id)
    if (!attempt) return 'pending'
    return attempt.status
  }

  const getQuizScore = (quiz: Quiz) => {
    const attempt = attempts.find((a) => a.quiz_id === quiz.id)
    if (!attempt) return null
    return attempt.percentage
  }

  // Filter quizzes
  let filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    
    const status = getQuizStatus(quiz)
    return matchesSearch && status === filter
  })

  if (authLoading || isLoading) {
    return (
      <AppShell title="Quizzes">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading quizzes...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!user) {
    return (
      <AppShell title="Quizzes">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access quizzes.
          </AlertDescription>
        </Alert>
      </AppShell>
    )
  }

  return (
    <AppShell title="Quizzes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quizzes & Assessments
            </h1>
            <p className="text-muted-foreground mt-1">
              Test your knowledge and track your progress
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline" onClick={loadQuizzes}>
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Quizzes</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4 mt-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button variant="outline" size="sm" onClick={loadQuizzes} className="ml-4">
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {filteredQuizzes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchQuery ? 'No quizzes found' : 'No quizzes available'}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchQuery
                      ? 'Try adjusting your search criteria'
                      : 'Quizzes will appear here once available in your courses'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredQuizzes.map((quiz) => {
                  const status = getQuizStatus(quiz)
                  const score = getQuizScore(quiz)
                  const isPassed = score ? score >= quiz.passing_score : false

                  return (
                    <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {quiz.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  status === 'completed'
                                    ? isPassed
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                }
                              >
                                {status === 'completed'
                                  ? isPassed
                                    ? 'Passed'
                                    : 'Failed'
                                  : 'Pending'}
                              </Badge>
                            </div>
                            {quiz.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {quiz.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{quiz.duration_minutes} mins</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                <span>{quiz.total_questions} questions</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                <span>Pass: {quiz.passing_score}%</span>
                              </div>
                            </div>
                            {status === 'completed' && score !== null && score !== undefined && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">Your Score</span>
                                  <span className="text-sm font-bold text-primary">
                                    {score.toFixed(1)}%
                                  </span>
                                </div>
                                <Progress value={score} className="h-2" />
                              </div>
                            )}
                          </div>
                          {status === 'pending' ? (
                            <Button asChild>
                              <Link href={`/quizzes/${quiz.id}`}>
                                <Play className="w-4 h-4 mr-2" />
                                Start Quiz
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" asChild>
                              <Link href={`/quizzes/${quiz.id}`}>
                                {score ? 'Retake' : 'Review'}
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Tips Card */}
        <Card className="bg-info/5 border-info/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-info" />
              Quiz Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>✓ Read each question carefully before answering</p>
            <p>✓ Manage your time wisely during the quiz</p>
            <p>✓ You can retake most quizzes to improve your score</p>
            <p>✓ Review answers before submitting</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
