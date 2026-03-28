'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  Users,
  BookOpen,
  Activity,
  MessageSquare,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function AdminAnalyticsPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  // Growth data over 6 months
  const growthData = [
    { month: 'Jul', users: 320, content: 42, activeUsers: 280, engagement: 65 },
    { month: 'Aug', users: 450, content: 78, activeUsers: 380, engagement: 72 },
    { month: 'Sep', users: 650, content: 125, activeUsers: 520, engagement: 78 },
    { month: 'Oct', users: 890, content: 210, activeUsers: 720, engagement: 82 },
    { month: 'Nov', users: 1050, content: 350, activeUsers: 820, engagement: 85 },
    { month: 'Dec', users: 1250, content: 450, activeUsers: 892, engagement: 88 },
  ]

  // User role distribution
  const roleData = [
    { name: 'Students', value: 950 },
    { name: 'Lecturers', value: 280 },
    { name: 'Admins', value: 20 },
  ]

  // Content type distribution
  const contentData = [
    { name: 'Videos', value: 180 },
    { name: 'Documents', value: 150 },
    { name: 'Assignments', value: 80 },
    { name: 'Quizzes', value: 40 },
  ]

  // Daily activity heatmap data
  const activityData = [
    { day: 'Mon', logins: 240, contentViews: 450, submissions: 180 },
    { day: 'Tue', logins: 380, contentViews: 520, submissions: 220 },
    { day: 'Wed', logins: 290, contentViews: 380, submissions: 160 },
    { day: 'Thu', logins: 420, contentViews: 680, submissions: 310 },
    { day: 'Fri', logins: 510, contentViews: 720, submissions: 420 },
    { day: 'Sat', logins: 180, contentViews: 240, submissions: 80 },
    { day: 'Sun', logins: 150, contentViews: 190, submissions: 60 },
  ]

  // Top courses data
  const topCoursesData = [
    { name: 'Calculus I', students: 320, views: 4500, avgScore: 78 },
    { name: 'Web Development', students: 280, views: 3800, avgScore: 82 },
    { name: 'Data Structures', students: 250, views: 3200, avgScore: 75 },
    { name: 'Physics I', students: 180, views: 2100, avgScore: 71 },
    { name: 'Chemistry Basics', students: 160, views: 1800, avgScore: 73 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  const ROLE_COLORS = ['#6c5ce7', '#00b894', '#fdcb6e']

  return (
    <AppShell title="Platform Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive platform insights and performance metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold mt-1">1,250</p>
                  <p className="text-xs text-green-600 mt-1">↑ 19% from last month</p>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Content Items
                  </p>
                  <p className="text-2xl font-bold mt-1">450+</p>
                  <p className="text-xs text-green-600 mt-1">↑ 29% from last month</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Active Daily Users
                  </p>
                  <p className="text-2xl font-bold mt-1">892</p>
                  <p className="text-xs text-green-600 mt-1">↑ 9% from last week</p>
                </div>
                <Activity className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Total Interactions
                  </p>
                  <p className="text-2xl font-bold mt-1">18.5K</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% from last week</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="growth" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="growth">Growth Trend</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="activity">Daily Activity</TabsTrigger>
            <TabsTrigger value="courses">Top Courses</TabsTrigger>
          </TabsList>

          {/* Growth Trend */}
          <TabsContent value="growth">
            <Card>
              <CardHeader>
                <CardTitle>Platform Growth (Last 6 Months)</CardTitle>
                <CardDescription>User growth and content expansion trends</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#6c5ce7"
                      name="Total Users"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="content"
                      stroke="#10b981"
                      name="Content Items"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#f59e0b"
                      name="Active Users"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#3b82f6"
                      name="Engagement %"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution */}
          <TabsContent value="distribution">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Role Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Type Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Daily Activity */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Daily Platform Activity</CardTitle>
                <CardDescription>User interactions throughout the week</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="logins" fill="#6c5ce7" name="Logins" />
                    <Bar dataKey="contentViews" fill="#10b981" name="Content Views" />
                    <Bar dataKey="submissions" fill="#f59e0b" name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Courses */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Courses</CardTitle>
                <CardDescription>Courses with highest engagement and performance</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Course Name</th>
                        <th className="text-left p-4 font-semibold">Enrolled Students</th>
                        <th className="text-left p-4 font-semibold">Total Views</th>
                        <th className="text-left p-4 font-semibold">Avg Score</th>
                        <th className="text-left p-4 font-semibold">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCoursesData.map((course, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-medium">{course.name}</td>
                          <td className="p-4 text-muted-foreground">{course.students}</td>
                          <td className="p-4 text-muted-foreground">{course.views.toLocaleString()}</td>
                          <td className="p-4 font-medium">{course.avgScore}%</td>
                          <td className="p-4">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${course.avgScore}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
