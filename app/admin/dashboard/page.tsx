'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockChart = [
    { month: 'Jan', users: 400, content: 240 },
    { month: 'Feb', users: 520, content: 290 },
    { month: 'Mar', users: 680, content: 380 },
    { month: 'Apr', users: 750, content: 450 },
    { month: 'May', users: 920, content: 520 },
    { month: 'Jun', users: 1050, content: 680 },
  ]

  const stats = [
    { label: 'Total Users', value: '1,250', icon: Users, color: 'text-blue-500' },
    { label: 'Content Items', value: '450+', icon: BookOpen, color: 'text-purple-500' },
    { label: 'Active Users', value: '892', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Alerts', value: '3', icon: AlertCircle, color: 'text-red-500' },
  ]

  return (
    <AppShell title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Grid - Optimized for mobile with 2-column layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>User and content growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#6c5ce7" name="Users" />
                  <Bar dataKey="content" fill="#10b981" name="Content" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: 'Ayo Sesay', role: 'Student' },
                  { name: 'Dr. Sarah Williams', role: 'Lecturer' },
                  { name: 'Mary Koroma', role: 'Student' },
                ].map((u) => (
                  <div key={u.name} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">{u.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View All Users
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 rounded text-sm">
                  High CPU usage detected
                </div>
                <div className="p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded text-sm">
                  Storage at 75% capacity
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded text-sm">
                  3 pending content reviews
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View All Alerts
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Create Announcement
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Review Flagged Content
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Generate Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
