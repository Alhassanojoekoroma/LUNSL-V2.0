'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  MessageSquare,
  FileText,
  AlertCircle,
  CheckCircle,
  Trash2,
  ArchiveX,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockNotifications = [
    {
      id: 1,
      type: 'message',
      title: 'New Message from Dr. Sarah Williams',
      message: 'Check the new lecture notes on databases uploaded today',
      timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
      read: false,
      icon: MessageSquare,
      color: 'text-blue-600',
    },
    {
      id: 2,
      type: 'assignment',
      title: 'Assignment Submission Received',
      message: 'Your Database Assignment has been received and is being reviewed',
      timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
      read: false,
      icon: FileText,
      color: 'text-green-600',
    },
    {
      id: 3,
      type: 'content',
      title: 'New Content Posted',
      message: 'New Data Structures lecture notes have been posted by Prof. David Bangura',
      timestamp: new Date(Date.now() - 5 * 3600000), // 5 hours ago
      read: true,
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      id: 4,
      type: 'alert',
      title: 'Upcoming Assignment Deadline',
      message: 'Programming II Assignment is due in 2 days',
      timestamp: new Date(Date.now() - 1 * 86400000), // 1 day ago
      read: true,
      icon: AlertCircle,
      color: 'text-orange-600',
    },
    {
      id: 5,
      type: 'message',
      title: 'Study Group Invitation',
      message: 'You have been invited to join the "Programming Masters" study group',
      timestamp: new Date(Date.now() - 2 * 86400000), // 2 days ago
      read: true,
      icon: MessageSquare,
      color: 'text-pink-600',
    },
    {
      id: 6,
      type: 'content',
      title: 'Content Recommended',
      message: 'Based on your interests, we recommend "Advanced OOP Concepts" by Prof. Ibrahim',
      timestamp: new Date(Date.now() - 3 * 86400000), // 3 days ago
      read: true,
      icon: FileText,
      color: 'text-indigo-600',
    },
  ]

  const filteredNotifications = mockNotifications.filter((notif) => {
    if (filter === 'unread') return !notif.read
    if (filter === 'read') return notif.read
    return true
  })

  const unreadCount = mockNotifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: number) => {
    // In real app, update notification status
  }

  const handleDeleteNotification = (id: number) => {
    // In real app, delete notification
  }

  const handleClearAll = () => {
    // In real app, clear all notifications
  }

  return (
    <AppShell title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="mt-2">{unreadCount} unread</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="gap-2"
          >
            <ArchiveX className="w-4 h-4" />
            Clear All
          </Button>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">
              All ({mockNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({mockNotifications.filter((n) => n.read).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const Icon = notif.icon
              return (
                <Card
                  key={notif.id}
                  className={`transition-colors ${
                    !notif.read ? 'bg-primary/5 border-primary/30' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          !notif.read
                            ? 'bg-primary/10'
                            : 'bg-muted'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${notif.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm line-clamp-1 ${
                              !notif.read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notif.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {notif.message}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                          </span>
                          <div className="flex items-center gap-2">
                            {!notif.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => handleMarkAsRead(notif.id)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark as read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDeleteNotification(notif.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">No notifications</p>
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread'
                    ? 'You are all caught up!'
                    : 'Check back later for updates'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notification Settings Link */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Manage Notification Preferences</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Customize which notifications you want to receive
              </p>
            </div>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
