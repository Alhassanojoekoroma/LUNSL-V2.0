"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Plus,
  ChevronRight
} from 'lucide-react'
import { useAuthStore, useTasksStore, useScheduleStore, useMessagesStore, useTokenStore, useProgressStore } from '@/lib/store'
import { mockTasks, mockScheduleEntries, mockMessages, mockTokenBalance, mockQuizScores, mockLearningGoals, mockContents } from '@/lib/mock-data'
import { PRIORITY_COLORS, FACULTIES } from '@/lib/constants'
import { formatDistanceToNow, format, isToday, isTomorrow, parseISO, differenceInHours } from 'date-fns'
import type { Task, ScheduleEntry } from '@/lib/types'

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const { tasks, setTasks } = useTasksStore()
  const { entries, setEntries } = useScheduleStore()
  const { messages, setMessages } = useMessagesStore()
  const { balance, setBalance } = useTokenStore()
  const { quizScores, learningGoals } = useProgressStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initialize with mock data
    setTasks(mockTasks)
    setEntries(mockScheduleEntries)
    setMessages(mockMessages)
    setBalance(mockTokenBalance)
  }, [setTasks, setEntries, setMessages, setBalance])

  if (!mounted || !user) return null

  const facultyInfo = FACULTIES.find((f) => f.code === user.faculty)
  const programInfo = facultyInfo?.programs.find((p) => p.code === user.program)

  // Get today's schedule
  const today = format(new Date(), 'EEEE').toLowerCase() as ScheduleEntry['day']
  const todaySchedule = entries.filter((e) => e.day === today).sort((a, b) => a.start_time.localeCompare(b.start_time))

  // Get upcoming tasks (not completed)
  const upcomingTasks = tasks
    .filter((t) => t.status !== 'completed' && t.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 4)

  // Get unread messages
  const unreadMessages = messages.filter((m) => !m.is_read && m.recipient_id === user.id)

  // Recent content for the user's faculty/semester
  const recentContent = mockContents
    .filter((c) => c.faculty === user.faculty && c.semester === user.semester)
    .slice(0, 3)

  // Calculate average quiz score
  const avgScore = mockQuizScores.length > 0
    ? Math.round(mockQuizScores.reduce((acc, q) => acc + q.percentage, 0) / mockQuizScores.length)
    : 0

  // Active learning goals
  const activeGoals = mockLearningGoals.filter((g) => g.status === 'active').slice(0, 2)

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = parseISO(deadline)
    const hoursLeft = differenceInHours(deadlineDate, new Date())
    
    if (hoursLeft < 0) return { text: 'Overdue', color: 'text-destructive' }
    if (hoursLeft < 24) return { text: `${hoursLeft}h left`, color: 'text-destructive' }
    if (hoursLeft < 72) return { text: formatDistanceToNow(deadlineDate, { addSuffix: true }), color: 'text-warning' }
    return { text: formatDistanceToNow(deadlineDate, { addSuffix: true }), color: 'text-muted-foreground' }
  }

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
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
                  {programInfo?.name} ({user.program}) | {facultyInfo?.code} | Semester {user.semester}
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

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tasks.filter((t) => t.status !== 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classes Today</p>
                  <p className="text-2xl font-bold text-foreground">{todaySchedule.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold text-foreground">{unreadMessages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
                  <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Tasks and Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Today&apos;s Schedule
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/schedule">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {todaySchedule.length > 0 ? (
                  <div className="space-y-3">
                    {todaySchedule.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-semibold text-foreground">{entry.start_time}</p>
                          <p className="text-xs text-muted-foreground">{entry.end_time}</p>
                        </div>
                        <div className="w-px h-10 bg-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{entry.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.location} - <span className="capitalize">{entry.type}</span>
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {entry.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No classes scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  Upcoming Tasks
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/tasks">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => {
                      const deadlineStatus = task.deadline ? getDeadlineStatus(task.deadline) : null
                      const priorityColor = PRIORITY_COLORS[task.priority]

                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border"
                        >
                          <div className={`w-2 h-2 rounded-full ${priorityColor.bg.replace('/10', '')}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${priorityColor.bg} ${priorityColor.text} border-0`}>
                              {task.priority}
                            </Badge>
                            {deadlineStatus && (
                              <p className={`text-xs mt-1 ${deadlineStatus.color}`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {deadlineStatus.text}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No upcoming tasks</p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link href="/tasks">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Content */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Recent Materials
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/browse">
                    Browse All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentContent.map((content) => (
                    <div
                      key={content.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center file-badge-${content.file_type}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{content.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {content.module} | {content.lecturer_name}
                        </p>
                      </div>
                      <Badge variant="outline" className="uppercase text-xs">
                        {content.file_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions and Progress */}
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
                    <span className="text-xs">Browse Materials</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/ai-assistant">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="text-xs">AI Assistant</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/tasks">
                    <CheckSquare className="w-5 h-5 text-primary" />
                    <span className="text-xs">My Tasks</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/referrals">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-xs">Refer Friends</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Learning Goals
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/progress">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {activeGoals.length > 0 ? (
                  <div className="space-y-4">
                    {activeGoals.map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{goal.title}</p>
                          <span className="text-sm text-primary font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No active goals</p>
                  </div>
                )}
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
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Used: {balance?.used ?? 0}</span>
                  <span className="text-muted-foreground">Bonus: {balance?.bonus ?? 0}</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/tokens">
                    Purchase More Tokens
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Recent Messages
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/messages">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {messages.slice(0, 3).map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg border mb-2 last:mb-0 ${
                      message.is_read ? 'bg-muted/30 border-border' : 'bg-primary/5 border-primary/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{message.sender_name}</p>
                      {!message.is_read && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground truncate">{message.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(parseISO(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
