'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  MoreVertical,
  FileText,
  Video,
  FileAudio,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/lib/store'

export default function AdminContentPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockContent = [
    {
      id: 1,
      title: 'Calculus Lecture - Limits',
      type: 'video',
      lecturer: 'Dr. Sarah Williams',
      dateSubmitted: '2026-01-20',
      status: 'pending',
      views: 0,
    },
    {
      id: 2,
      title: 'Database Design Fundamentals',
      type: 'document',
      lecturer: 'Prof. David Bangura',
      dateSubmitted: '2026-01-18',
      status: 'approved',
      views: 245,
    },
    {
      id: 3,
      title: 'Web Development Bootcamp',
      type: 'video',
      lecturer: 'Dr. Sarah Williams',
      dateSubmitted: '2026-01-19',
      status: 'pending',
      views: 0,
    },
    {
      id: 4,
      title: 'Data Structures Assignment',
      type: 'document',
      lecturer: 'Prof. David Bangura',
      dateSubmitted: '2026-01-15',
      status: 'rejected',
      views: 0,
    },
    {
      id: 5,
      title: 'Physics Lab Report Guide',
      type: 'audio',
      lecturer: 'Dr. Jane Smith',
      dateSubmitted: '2026-01-17',
      status: 'approved',
      views: 89,
    },
  ]

  const filteredContent = mockContent.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lecturer.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'pending') return matchSearch && item.status === 'pending'
    if (filter === 'approved') return matchSearch && item.status === 'approved'
    if (filter === 'rejected') return matchSearch && item.status === 'rejected'
    return matchSearch
  })

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'document':
        return <FileText className="w-4 h-4" />
      case 'audio':
        return <FileAudio className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleApprove = () => {
    setShowDialog(false)
    setSelectedItem(null)
  }

  const handleReject = () => {
    setShowDialog(false)
    setSelectedItem(null)
  }

  return (
    <AppShell title="Content Moderation">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Content Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage uploaded content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {mockContent.filter((c) => c.status === 'pending').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Approved
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {mockContent.filter((c) => c.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Rejected
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {mockContent.filter((c) => c.status === 'rejected').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {mockContent.reduce((sum, c) => sum + c.views, 0)}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-4">
              <TabsList>
                <TabsTrigger value="all">All ({mockContent.length})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({mockContent.filter((c) => c.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({mockContent.filter((c) => c.status === 'approved').length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({mockContent.filter((c) => c.status === 'rejected').length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Content Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Type</th>
                    <th className="text-left p-4 font-semibold">Title</th>
                    <th className="text-left p-4 font-semibold">Lecturer</th>
                    <th className="text-left p-4 font-semibold">Submitted</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Views</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getContentIcon(item.type)}
                          <span className="text-xs capitalize text-muted-foreground">
                            {item.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{item.title}</td>
                      <td className="p-4 text-muted-foreground">{item.lecturer}</td>
                      <td className="p-4 text-muted-foreground">{item.dateSubmitted}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            item.status === 'approved'
                              ? 'default'
                              : item.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{item.views}</td>
                      <td className="p-4">
                        {item.status === 'pending' ? (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-green-600 hover:text-green-700"
                              onClick={() => handleApprove()}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-red-600 hover:text-red-700"
                              onClick={() => handleReject()}
                            >
                              <AlertCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve/reject this content? This action can be undone
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
