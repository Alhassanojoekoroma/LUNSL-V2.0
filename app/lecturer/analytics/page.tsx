'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Eye,
  Download,
  TrendingUp,
  Users,
  Calendar,
  FileText,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function LecturerAnalyticsPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockDataByDay = [
    { name: 'Mon', views: 120, downloads: 40 },
    { name: 'Tue', views: 150, downloads: 60 },
    { name: 'Wed', views: 180, downloads: 75 },
    { name: 'Thu', views: 140, downloads: 50 },
    { name: 'Fri', views: 200, downloads: 90 },
    { name: 'Sat', views: 90, downloads: 30 },
    { name: 'Sun', views: 110, downloads: 40 },
  ]

  const mockContentStats = [
    { name: 'Lecture Notes', value: 45, color: '#6c5ce7' },
    { name: 'Assignments', value: 25, color: '#10b981' },
    { name: 'Tutorials', value: 20, color: '#f59e0b' },
    { name: 'Projects', value: 10, color: '#ef4444' },
  ]

  const mockCourseData = [
    { id: 1, name: 'Database I', uploads: 15, views: 1250, downloads: 420, students: 45 },
    { id: 2, name: 'Programming II', uploads: 12, views: 980, downloads: 350, students: 38 },
    { id: 3, name: 'Web Development', uploads: 8, views: 650, downloads: 280, students: 32 },
  ]

  const stats = [
    { label: 'Total Views', value: '2,890', icon: Eye, color: 'text-blue-500' },
    { label: 'Total Downloads', value: '1,050', icon: Download, color: 'text-green-500' },
    { label: 'Active Students', value: '115', icon: Users, color: 'text-purple-500' },
    { label: 'Content Uploaded', value: '35', icon: FileText, color: 'text-orange-500' },
  ]

  return (
    <AppShell title="Analytics">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
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
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Views & Downloads (Last 7 Days)</CardTitle>
                <CardDescription>Content engagement trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockDataByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#6c5ce7" name="Views" />
                      <Bar dataKey="downloads" fill="#10b981" name="Downloads" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Content Distribution</CardTitle>
                  <CardDescription>By content type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockContentStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mockContentStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Top Content</CardTitle>
                  <CardDescription>Most viewed materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { title: 'Database Fundamentals Lecture', views: 450, downloads: 180 },
                      { title: 'OOP Concepts Tutorial', views: 380, downloads: 140 },
                      { title: 'Web Dev Assignment 1', views: 320, downloads: 120 },
                    ].map((item) => (
                      <div key={item.title} className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {item.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" /> {item.downloads} downloads
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Analytics</CardTitle>
                <CardDescription>Performance by course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCourseData.map((course) => (
                    <div key={course.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{course.name}</h4>
                        <Badge variant="outline">{course.students} students</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground text-xs">Uploads</p>
                          <p className="font-semibold">{course.uploads}</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground text-xs">Views</p>
                          <p className="font-semibold">{course.views}</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground text-xs">Downloads</p>
                          <p className="font-semibold">{course.downloads}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
