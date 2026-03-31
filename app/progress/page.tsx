'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  TrendingUp,
  Award,
  Target,
  Clock,
  BookOpen,
  Brain,
  Zap,
} from 'lucide-react'
import { useAuthStore, useProgressStore } from '@/lib/store'

export default function ProgressPage() {
  const { user } = useAuthStore()
  const { quizScores, learningGoals } = useProgressStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockProgressData = [
    { week: 'Week 1', score: 65, target: 80 },
    { week: 'Week 2', score: 72, target: 80 },
    { week: 'Week 3', score: 78, target: 80 },
    { week: 'Week 4', score: 89, target: 80 },
    { week: 'Week 5', score: 92, target: 80 },
  ]

  const mockQuizzes = [
    { id: 1, title: 'Database Fundamentals', score: 92, date: '2026-03-25', status: 'passed' },
    { id: 2, title: 'OOP Concepts', score: 88, date: '2026-03-23', status: 'passed' },
    { id: 3, title: 'Web Development Basics', score: 95, date: '2026-03-20', status: 'passed' },
    { id: 4, title: 'Data Structures', score: 82, date: '2026-03-18', status: 'passed' },
  ]

  const mockLearningGoals = [
    { id: 1, title: 'Complete Database Module', progress: 85 },
    { id: 2, title: 'Learn Advanced JavaScript', progress: 60 },
    { id: 3, title: 'Master Web Development', progress: 45 },
    { id: 4, title: 'Complete 10 Assignments', progress: 70 },
  ]

  const stats = [
    { label: 'Study Streak', value: '12 days', icon: Zap, color: 'text-yellow-500' },
    { label: 'Quizzes Passed', value: mockQuizzes.length, icon: Award, color: 'text-green-500' },
    { label: 'Goals In Progress', value: mockLearningGoals.length, icon: Target, color: 'text-blue-500' },
    { label: 'Avg. Score', value: '89%', icon: TrendingUp, color: 'text-purple-500' },
  ]

  return (
    <AppShell title="My Progress">
      <div className="space-y-6">
        {/* Stats Grid - Optimized for mobile with 2-column layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Trends</CardTitle>
                <CardDescription>Your quiz scores over the last 5 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#6c5ce7"
                        name="Your Score"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#10b981"
                        name="Target"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Path</CardTitle>
                <CardDescription>Progress towards your learning goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockLearningGoals.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <span className="text-sm font-semibold text-primary">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
                <CardDescription>Your recent quiz performances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{quiz.title}</h4>
                          <p className="text-xs text-muted-foreground">{quiz.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="bg-green-500">{quiz.score}%</Badge>
                        <Badge variant="outline">Passed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Learning Goals</CardTitle>
                <CardDescription>Track your learning objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockLearningGoals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant={goal.progress === 100 ? 'default' : 'secondary'}>
                        {goal.progress === 100 ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">{goal.progress}% complete</p>
                  </div>
                ))}
                <Button className="w-full mt-4">Add New Goal</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
