'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, useContentStore } from '@/lib/store'
import { courseAPI } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AppError } from '@/lib/api-utils'

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Load dashboard data based on user role
        const data = await courseAPI.getCourses(1, 5)
        setDashboardData(data)
      } catch (err) {
        const errorMessage = err instanceof AppError ? err.message : 'Failed to load dashboard'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [user, toast])

  if (authLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Authenticated</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view your dashboard</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.full_name}</CardTitle>
          <CardDescription>Role: {user.role.toUpperCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your dashboard data is being loaded from the backend.
          </p>
        </CardContent>
      </Card>

      {dashboardData && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(dashboardData) && dashboardData.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.map((course: any) => (
                  <div
                    key={course.id}
                    className="p-3 border rounded hover:bg-accent cursor-pointer transition"
                  >
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No courses found</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
