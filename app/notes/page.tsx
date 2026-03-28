'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Star,
  Folder,
  Download,
  Archive,
  Tag,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

export default function NotesPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'favorites' | 'archived'>('all')
  const [selectedNote, setSelectedNote] = useState<number | null>(null)
  const [showNewNote, setShowNewNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingNote, setEditingNote] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockNotes = [
    {
      id: 1,
      title: 'Calculus - Chain Rule Mastery',
      content:
        'Remember: d/dx[f(g(x))] = f\'(g(x)) * g\'(x). Apply from outside to inside. Practice with 3+ compositions.',
      category: 'Mathematics',
      tags: ['calculus', 'derivatives', 'chain-rule'],
      isFavorite: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      wordCount: 45,
    },
    {
      id: 2,
      title: 'React Hooks - useEffect Guide',
      content:
        'useEffect runs after render. Put functions in dependencies array. Watch out for infinite loops. Use cleanup functions for subscriptions.',
      category: 'Computer Science',
      tags: ['react', 'hooks', 'javascript'],
      isFavorite: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      wordCount: 52,
    },
    {
      id: 3,
      title: 'Physics - Newton\'s Laws Summary',
      content:
        '1st Law: Object at rest stays at rest. 2nd Law: F=ma. 3rd Law: Action = Reaction. Important for momentum and force problems.',
      category: 'Physics',
      tags: ['physics', 'laws', 'forces'],
      isFavorite: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      wordCount: 38,
    },
    {
      id: 4,
      title: 'Chemistry - Balancing Equations',
      content:
        'Count atoms on both sides. Balance metals first, then non-metals, then oxygen, finally hydrogen. Check coefficient ratios.',
      category: 'Chemistry',
      tags: ['chemistry', 'equations', 'balancing'],
      isFavorite: false,
      isArchived: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      wordCount: 41,
    },
    {
      id: 5,
      title: 'Data Structures - Big O Complexity',
      content:
        'Arrays: O(1) access, O(n) search. Linked Lists: O(n) access. Hash Tables: O(1) average. Trees: O(log n) balanced. Know your trade-offs.',
      category: 'Computer Science',
      tags: ['data-structures', 'complexity', 'algorithms'],
      isFavorite: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      wordCount: 56,
    },
  ]

  const filteredNotes = mockNotes.filter((note) => {
    const matchSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'favorites') return matchSearch && note.isFavorite
    if (filter === 'archived') return matchSearch && note.isArchived
    return matchSearch && !note.isArchived
  })

  const selectedNote_ = selectedNote ? mockNotes.find((n) => n.id === selectedNote) : null

  if (selectedNote && selectedNote_) {
    return (
      <AppShell title="Notes">
        <div className="space-y-4">
          {/* Note Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{selectedNote_.title}</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Created {formatDistanceToNow(selectedNote_.createdAt, { addSuffix: true })} • Updated{' '}
                {formatDistanceToNow(selectedNote_.updatedAt, { addSuffix: true })}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedNote(null)}
              className="w-full sm:w-auto"
            >
              Back
            </Button>
          </div>

          {/* Note Content */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedNote_.content}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Meta */}
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">Category</h3>
                <Badge variant="outline">{selectedNote_.category}</Badge>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNote_.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {selectedNote_.wordCount} words
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 flex-col sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Favorite</span>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export as PDF</span>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto gap-2 text-destructive">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  if (showNewNote) {
    return (
      <AppShell title="New Note">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold">Create New Note</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNewNote(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Title</label>
                <Input
                  placeholder="Note title..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="text-base"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Content</label>
                <Textarea
                  placeholder="Write your note here..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="min-h-40 sm:min-h-56 text-sm sm:text-base"
                />
              </div>

              <div className="flex gap-2 flex-col sm:flex-row pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowNewNote(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!newNoteTitle.trim() || !newNoteContent.trim()}
                  className="w-full sm:w-auto"
                >
                  Save Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Notes & Collections">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Notes</h1>
            <p className="text-sm text-muted-foreground mt-1">Organize and manage your study notes</p>
          </div>
          <Button
            onClick={() => setShowNewNote(true)}
            className="w-full sm:w-auto gap-2"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Total Notes</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockNotes.filter((n) => !n.isArchived).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Favorites</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockNotes.filter((n) => n.isFavorite).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Archived</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockNotes.filter((n) => n.isArchived).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Total Words</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockNotes.reduce((sum, n) => sum + n.wordCount, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="favorites" className="text-xs sm:text-sm">⭐ Favorites</TabsTrigger>
                <TabsTrigger value="archived" className="text-xs sm:text-sm">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="hover:border-primary/50 transition-colors cursor-pointer flex flex-col"
              onClick={() => setSelectedNote(note.id)}
            >
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-sm sm:text-base line-clamp-2 flex-1">
                    {note.title}
                  </h3>
                  {note.isFavorite && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
                </div>

                <Badge variant="outline" className="w-fit text-xs mb-3">
                  {note.category}
                </Badge>

                <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-3">
                  {note.content}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {note.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground border-t pt-3">
                  {note.wordCount} words • Updated{' '}
                  {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                </div>
              </CardContent>

              <CardContent className="p-4 pt-0 border-t flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-xs gap-1 h-8"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-xs gap-1 h-8"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No notes found</p>
              <Button onClick={() => setShowNewNote(true)} gap-2>
                <Plus className="w-4 h-4" />
                Create your first note
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
