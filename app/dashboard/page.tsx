"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BookOpen,
  Bot,
  Calendar,
  CheckSquare,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
  FileText,
  Users,
  Coins,
  Bell,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuthStore, useTokenStore } from '@/lib/store'
import { enrollmentAPI, dashboardAPI, courseAPI } from '@/lib/api-client'
import { format } from 'date-fns'

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  course: {
    id: string
    title: string
    description?: string
    progress_percentage?: number
  }
  progress_percentage: number
  status: string
  enrolled_at: string
}

interface DashboardData {
  user_stats: {
    total_courses: number
    completed_courses: number
    in_progress_courses: number
    total_study_hours: number
    average_score: number
  }
  enrollments: Enrollment[]
  recent_activity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

export default function StudentDashboard() {
  const { user, loadUser, isLoading: authLoading } = useAuthStore()
  const { balance, loadBalance } = useTokenStore()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user on mount
  useEffect(() => {
    if (!user && !authLoading) {
      loadUser()
    }
  }, [user, authLoading, loadUser])

  // Load dashboard data once user is loaded
  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData()
    }
  }, [user, authLoading])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load dashboard data
      const dashboard = await dashboardAPI.getDashboard()
      setDashboardData(dashboard)

      // Load enrollments
      const enrollmentData = await enrollmentAPI.getEnrollments()
      setEnrollments(Array.isArray(enrollmentData) ? enrollmentData : [])

      // Load token balance
      await loadBalance()
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (authLoading || isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!user) {
    return (
      <AppShell>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Not logged in. Please log in to continue.
          </AlertDescription>
        </Alert>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={loadDashboardData} className="ml-4">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </AppShell>
    )
  }

  const stats = dashboardData?.user_stats || {
    total_courses: 0,
    completed_courses: 0,
    in_progress_courses: 0,
    total_study_hours: 0,
    average_score: 0,
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20" style={{ boxShadow: 'none' }}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {getGreeting()}, {user.full_name.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground">
                  {user.role} | {user.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">AI Tokens</p>
                  <p className="text-2xl font-bold text-primary">{balance?.available ?? 0}</p>
                </div>
                <Button asChild>
                  <Link href="/ai-assistant">
                    <Bot className="w-4 h-4 mr-2" />
                    AI Assistant
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Responsive mobile design */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Courses</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total_courses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Completed</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.completed_courses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">In Progress</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.in_progress_courses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Avg Score</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.average_score.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Enrolled Courses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrolled Courses */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Enrolled Courses
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/browse">
                    Browse More <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {enrollments && enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.slice(0, 5).map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{enrollment.course.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Progress: {enrollment.progress_percentage || 0}%
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {enrollment.status}
                          </Badge>
                        </div>
                        <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            Enrolled {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/courses/${enrollment.course_id}`}>
                              Continue Learning <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No courses enrolled yet</p>
                    <Button className="mt-4" asChild>
                      <Link href="/browse">
                        Browse Courses
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recent_activity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize">{activity.type}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions and Token Balance */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/browse">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="text-xs">Browse Courses</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/ai-assistant">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="text-xs">AI Chat</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/progress">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-xs">Progress</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/notifications">
                    <Bell className="w-5 h-5 text-primary" />
                    <span className="text-xs">Notifications</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Token Balance */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" style={{ boxShadow: 'none' }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AI Tokens Balance</p>
                    <p className="text-2xl font-bold text-foreground">{balance?.available ?? 0}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  <p>Used: {balance?.used ?? 0}</p>
                  <p>Bonus: {balance?.bonus ?? 0}</p>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/tokens">
                    Buy More Tokens
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Study Statistics */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Study Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Study Hours</span>
                      <span className="text-lg font-bold text-foreground">{stats.total_study_hours}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Average Score</span>
                      <span className="text-lg font-bold text-foreground">{stats.average_score.toFixed(0)}%</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/progress">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
