"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  Users, 
  Eye, 
  Download,
  TrendingUp,
  BarChart3,
  Plus,
  Clock,
  BookOpen,
  MessageSquare,
  Settings,
  ChevronRight,
  Calendar
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { useAuthStore } from '@/lib/store'
import { mockContents, mockModules } from '@/lib/mock-data'

export default function LecturerDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    }
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    return () => unsubscribe()
  }, [])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const lecturerContents = mockContents.filter(c => c.lecturer_id === user?.id || true).slice(0, 10)
  const totalViews = lecturerContents.reduce((sum, c) => sum + c.view_count, 0)
  const totalDownloads = lecturerContents.reduce((sum, c) => sum + c.download_count, 0)

  const stats = [
    { label: 'Total Uploads', value: lecturerContents.length, icon: FileText, color: 'text-primary' },
    { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-info' },
    { label: 'Downloads', value: totalDownloads, icon: Download, color: 'text-success' },
    { label: 'Students Reached', value: 156, icon: Users, color: 'text-warning' },
  ]

  const recentUploads = lecturerContents.slice(0, 5)

  const moduleStats = mockModules.slice(0, 4).map(module => ({
    ...module,
    uploads: lecturerContents.filter(c => c.module_id === module.id).length,
    views: lecturerContents.filter(c => c.module_id === module.id).reduce((sum, c) => sum + c.view_count, 0),
  }))

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lecturer Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.full_name || 'Lecturer'}
            </p>
          </div>
          <Button onClick={() => router.push('/lecturer/upload')}>
            <Plus className="w-4 h-4 mr-2" /> Upload Content
          </Button>
        </div>

        {/* Stats Grid - Responsive mobile design */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} style={{ boxShadow: 'none' }}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Uploads */}
          <div className="lg:col-span-2">
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Recent Uploads</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push('/lecturer/content')}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUploads.map((content) => {
                    const module = mockModules.find(m => m.id === content.module_id)
                    return (
                      <div 
                        key={content.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => router.push(`/lecturer/content/${content.id}`)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{content.title}</h4>
                          <p className="text-sm text-muted-foreground">{module?.code || 'Unknown Module'}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" /> {content.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" /> {content.download_count}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => router.push('/lecturer/upload')}
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload New Content
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/lecturer/content')}
                >
                  <FileText className="w-4 h-4 mr-2" /> Manage Content
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/messages')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Messages
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/lecturer/analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" /> View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Module Performance */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Module Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {moduleStats.map((module) => (
                  <div key={module.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{module.code}</span>
                      <span className="text-sm text-muted-foreground">{module.views} views</span>
                    </div>
                    <Progress value={Math.min((module.views / 500) * 100, 100)} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Overview */}
        <Card style={{ boxShadow: 'none' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-info" />
                  <span className="text-sm text-muted-foreground">Views This Week</span>
                </div>
                <p className="text-2xl font-bold text-foreground">1,247</p>
                <p className="text-sm text-success">+12% from last week</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Downloads This Week</span>
                </div>
                <p className="text-2xl font-bold text-foreground">342</p>
                <p className="text-sm text-success">+8% from last week</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Active Students</span>
                </div>
                <p className="text-2xl font-bold text-foreground">89</p>
                <p className="text-sm text-muted-foreground">Across all modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
