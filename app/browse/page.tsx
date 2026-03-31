'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  Grid,
  List,
  ChevronRight,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Users
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { courseAPI } from '@/lib/api-client'
import { format } from 'date-fns'

interface Course {
  id: string
  title: string
  description?: string
  instructor_id: string
  instructor?: {
    full_name: string
  }
  created_at: string
  updated_at: string
  status?: string
}

export default function BrowsePage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!authLoading && user) {
      loadCourses()
    }
  }, [user, authLoading])

  const loadCourses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await courseAPI.getCourses(1, 100)
      setCourses(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load courses:', err)
      setError('Failed to load courses. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter courses based on search
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || isLoading) {
    return (
      <AppShell title="Browse Courses">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!user) {
    return (
      <AppShell title="Browse Courses">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to browse courses.
          </AlertDescription>
        </Alert>
      </AppShell>
    )
  }

  return (
    <AppShell title="Browse Courses">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Browse Courses
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore all available courses and enroll to start learning
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={loadCourses}>
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" onClick={loadCourses} className="ml-4">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Courses Grid/List */}
        {filteredCourses.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <div key={course.id}>
                  <Link href={`/courses/${course.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-baseline justify-between mb-2">
                          <Badge variant="outline" className="capitalize">
                            {course.status || 'active'}
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {course.instructor?.full_name || 'Unknown Instructor'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {course.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {course.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                          <span>{format(new Date(course.created_at), 'MMM d, yyyy')}</span>
                          <Users className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{course.title}</h3>
                            <Badge variant="outline" className="capitalize">
                              {course.status || 'active'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.instructor?.full_name || 'Unknown Instructor'}
                          </p>
                          {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(course.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'No courses are currently available'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
