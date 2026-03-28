'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  BookOpen,
  FileText,
  Award,
  MessageSquare,
  Zap,
  TrendingUp,
  Users,
  CheckCircle,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

export default function ActivityFeedPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<'all' | 'your-activity' | 'following' | 'trending'>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockActivities = [
    {
      id: 1,
      type: 'quiz_passed',
      user: 'Ayo Sesay',
      avatar: 'AS',
      action: 'Passed Calculus I - Limits & Continuity',
      details: 'Score: 92%',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      icon: Award,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'content_downloaded',
      user: 'Mary Koroma',
      avatar: 'MK',
      action: 'Downloaded lecture notes',
      details: 'Web Development - JavaScript Basics',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      id: 3,
      type: 'joined_group',
      user: 'John Conteh',
      avatar: 'JC',
      action: 'Joined study group',
      details: 'Physics Problem Solvers',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      icon: Users,
      color: 'text-purple-600',
    },
    {
      id: 4,
      type: 'answered_question',
      user: 'Dr. Sarah Williams',
      avatar: 'SW',
      action: 'Answered question',
      details: 'How to apply the chain rule effectively?',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      icon: MessageSquare,
      color: 'text-orange-600',
    },
    {
      id: 5,
      type: 'earned_badge',
      user: 'Fatima Singh',
      avatar: 'FS',
      action: 'Earned badge',
      details: 'Quick Learner - Completed first 5 quizzes',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      icon: Award,
      color: 'text-yellow-600',
    },
    {
      id: 6,
      type: 'achieved_milestone',
      user: 'Prof. Bangura',
      avatar: 'PB',
      action: 'Reached milestone',
      details: '1000 total views on uploaded content',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      icon: TrendingUp,
      color: 'text-red-600',
    },
    {
      id: 7,
      type: 'content_uploaded',
      user: 'Dr. Jane Smith',
      avatar: 'JS',
      action: 'Uploaded new content',
      details: 'Physics Lab Report - Complete Guide (PDF)',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      icon: BookOpen,
      color: 'text-teal-600',
    },
    {
      id: 8,
      type: 'streak_milestone',
      user: 'You',
      avatar: 'AS',
      action: 'Milestone reached',
      details: '7-day study streak completed! 🎉',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: Zap,
      color: 'text-yellow-600',
    },
  ]

  const filteredActivities = mockActivities.filter((activity) => {
    if (filter === 'your-activity') return activity.user === 'You' || activity.user === user?.full_name
    if (filter === 'following') return Math.random() > 0.4 // Simulated following
    if (filter === 'trending') return activity.type === 'quiz_passed' || activity.type === 'earned_badge'
    return true
  })

  return (
    <AppShell title="Activity Feed">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Activity Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with the community's latest activities
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Total Events</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{mockActivities.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Your Activity</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockActivities.filter((a) => a.user === 'You').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Quizzes Passed</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockActivities.filter((a) => a.type === 'quiz_passed').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Badges Earned</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockActivities.filter((a) => a.type === 'earned_badge').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="your-activity" className="text-xs sm:text-sm">
              Your Activity
            </TabsTrigger>
            <TabsTrigger value="following" className="text-xs sm:text-sm">
              Following
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs sm:text-sm">
              Trending
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Activity Timeline */}
        <div className="space-y-3">
          {filteredActivities.map((activity, index) => {
            const IconComponent = activity.icon
            return (
              <Card key={activity.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold">
                          {activity.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {index < filteredActivities.length - 1 && (
                        <div className="w-0.5 h-12 bg-border my-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activity.color}`} />
                          <p className="font-semibold text-sm sm:text-base">
                            {activity.user === 'You' ? `You ${activity.action.toLowerCase()}` : `${activity.user} ${activity.action.toLowerCase()}`}
                          </p>
                        </div>
                        {activity.user === 'You' && (
                          <Badge className="text-xs bg-blue-600">Your Activity</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 break-words">{activity.details}</p>

                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredActivities.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No activities to display</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
