'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Clock,
  BookOpen,
  Grid,
  List,
  ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { mockContents } from '@/lib/mock-data'
import { FACULTIES, CONTENT_TYPES } from '@/lib/constants'
import { format, parseISO } from 'date-fns'
import type { Content, ContentType } from '@/lib/types'

export default function BrowsePage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [contentType, setContentType] = useState<ContentType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string | 'all'>('all')
  const [semesterFilter, setSemesterFilter] = useState<string | 'all'>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  // Default to user's faculty if student
  const defaultFaculty = user.role === 'student' ? user.faculty : 'all'
  const currentFaculty = selectedFacultyFilter === 'all' ? defaultFaculty : selectedFacultyFilter

  // Filter contents
  let filteredContents = mockContents.filter((content) => {
    const matchesFaculty = currentFaculty === 'all' || content.faculty === currentFaculty
    const matchesSemester = semesterFilter === 'all' || content.semester.toString() === semesterFilter
    const matchesType = contentType === 'all' || content.content_type === contentType
    const matchesSearch =
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.module.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFaculty && matchesSemester && matchesType && matchesSearch && content.is_active
  })

  const facultyInfo = FACULTIES.find((f) => f.code === currentFaculty)

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return '📄'
      case 'pptx':
        return '📊'
      case 'docx':
        return '📝'
      case 'image':
        return '🖼️'
      default:
        return '📎'
    }
  }

  const getContentTypeColor = (type: ContentType) => {
    const colors: Record<ContentType, string> = {
      lecture_notes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      assignment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      timetable: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      tutorial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      project: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      lab: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    }
    return colors[type]
  }

  const ContentCard = ({ content }: { content: Content }) => (
    <Link href={`/content/${content.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-3xl">{getFileIcon(content.file_type)}</span>
            <Badge variant="outline" className={getContentTypeColor(content.content_type)}>
              {content.content_type.replace('_', ' ')}
            </Badge>
          </div>
          <CardTitle className="line-clamp-2 text-base">{content.title}</CardTitle>
          <CardDescription className="line-clamp-1">
            {content.module} ({content.module_code})
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          {content.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {content.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>By {content.lecturer_name}</span>
            <span className="text-primary font-medium">{content.file_type.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{content.view_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{content.download_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{format(parseISO(content.created_at), 'MMM d')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <AppShell title="Browse Materials">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Browse Learning Materials
            </h1>
            <p className="text-muted-foreground mt-1">
              {facultyInfo && user.role === 'student'
                ? `${facultyInfo.name} - Semester ${user.semester}`
                : 'Explore all available course materials'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by title, module, or lecturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.role !== 'student' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Faculty</label>
                    <Select value={selectedFacultyFilter} onValueChange={setSelectedFacultyFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Faculties</SelectItem>
                        {FACULTIES.map((faculty) => (
                          <SelectItem key={faculty.code} value={faculty.code}>
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Semester</label>
                  <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content Type</label>
                  <Select
                    value={contentType}
                    onValueChange={(value) => setContentType(value as ContentType | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found <span className="font-semibold text-foreground">{filteredContents.length}</span> materials
          </p>
        </div>

        {/* Content Display */}
        {filteredContents.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No materials found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Try adjusting your search filters or check back later for new materials
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
