'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  MessageCircle,
  ThumbsUp,
  Flag,
  Plus,
  Eye,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

export default function ForumsPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'my-posts' | 'unanswered' | 'trending'>('all')
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockThreads = [
    {
      id: 1,
      title: 'How to apply the chain rule to compositions of more than 3 functions?',
      author: 'Ayo Sesay',
      avatar: 'AS',
      views: 342,
      replies: 12,
      likes: 28,
      tags: ['calculus', 'derivatives', 'chain-rule'],
      posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      solved: true,
      category: 'Mathematics',
    },
    {
      id: 2,
      title: 'React hooks best practices for data fetching in 2026',
      author: 'Mary Koroma',
      avatar: 'MK',
      views: 521,
      replies: 24,
      likes: 67,
      tags: ['react', 'hooks', 'javascript', 'web-dev'],
      posted: new Date(Date.now() - 5 * 60 * 60 * 1000),
      solved: false,
      category: 'Computer Science',
    },
    {
      id: 3,
      title: 'Physics momentum conservation problem help needed',
      author: 'John Conteh',
      avatar: 'JC',
      views: 198,
      replies: 8,
      likes: 15,
      tags: ['physics', 'momentum', 'forces'],
      posted: new Date(Date.now() - 1 * 60 * 60 * 1000),
      solved: false,
      category: 'Physics',
    },
    {
      id: 4,
      title: 'Best way to balance chemical equations step by step?',
      author: 'Fatima Singh',
      avatar: 'FS',
      views: 267,
      replies: 5,
      likes: 19,
      tags: ['chemistry', 'equations', 'balancing'],
      posted: new Date(Date.now() - 12 * 60 * 60 * 1000),
      solved: true,
      category: 'Chemistry',
    },
    {
      id: 5,
      title: 'Data structures interview preparation resources',
      author: 'Dr. Sarah Williams',
      avatar: 'SW',
      views: 445,
      replies: 31,
      likes: 89,
      tags: ['data-structures', 'interviews', 'algorithms'],
      posted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      solved: false,
      category: 'Computer Science',
    },
  ]

  const mockReplies = [
    {
      id: 1,
      author: 'Dr. Sarah Williams',
      avatar: 'SW',
      content:
        "Good question! For compositions with more than 3 functions, you apply the chain rule recursively. Just work from the outside in, multiplying derivatives as you go. Here's the pattern: d/dx[f(g(h(x)))] = f'(g(h(x))) * g'(h(x)) * h'(x)",
      likes: 28,
      helpful: true,
      posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      author: 'Prof. Bangura',
      avatar: 'PB',
      content:
        'I agree with Dr. Williams. The key is understanding that each function in the composition has its own derivative, and you multiply them together. Practice with some examples to solidify the concept.',
      likes: 12,
      helpful: false,
      posted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]

  const filteredThreads = mockThreads.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'my-posts') return matchSearch && t.author === user?.full_name
    if (filter === 'unanswered') return matchSearch && t.replies === 0
    if (filter === 'trending') return matchSearch && (t.views > 400 || t.likes > 50)
    return matchSearch
  })

  const selectedThread = selectedThreadId ? mockThreads.find((t) => t.id === selectedThreadId) : null

  if (selectedThread) {
    return (
      <AppShell title="Forum">
        <div className="space-y-4">
          {/* Thread Header */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10">{selectedThread.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold">{selectedThread.title}</h1>
                  <div className="flex flex-wrap gap-2 items-center mt-2">
                    <p className="text-sm text-muted-foreground">
                      Asked by <span className="font-semibold">{selectedThread.author}</span>
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {selectedThread.category}
                    </Badge>
                    {selectedThread.solved && (
                      <Badge className="text-xs bg-green-600">Solved</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(selectedThread.posted, { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm mb-4 pb-4 border-b">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {selectedThread.views} views
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  {selectedThread.replies} replies
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ThumbsUp className="w-4 h-4" />
                  {selectedThread.likes} helpful
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedThread.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 flex-col sm:flex-row">
                <Button variant="outline" className="flex-1 sm:flex-none gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none gap-2">
                  <Flag className="w-4 h-4" />
                  Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm sm:text-base">
              {selectedThread.replies} Replies
            </h2>
            {mockReplies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {reply.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm">{reply.author}</p>
                        {reply.helpful && (
                          <Badge className="text-xs bg-green-600">Marked Helpful</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(reply.posted, { addSuffix: true })}
                      </p>
                      <p className="text-sm mt-3 break-words">{reply.content}</p>
                      <div className="flex gap-3 mt-3">
                        <Button variant="ghost" size="sm" className="gap-2 text-xs">
                          <ThumbsUp className="w-4 h-4" />
                          Helpful {reply.likes > 0 && `(${reply.likes})`}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-xs">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Share your knowledge and help others..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-24 text-sm"
              />
              <div className="flex gap-2 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setSelectedThreadId(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!replyText.trim()}
                  className="w-full sm:w-auto"
                >
                  Post Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Discussion Forums">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Discussion Forums</h1>
            <p className="text-sm text-muted-foreground mt-1">Ask questions, share knowledge, help peers</p>
          </div>
          <Button className="w-full sm:w-auto gap-2">
            <Plus className="w-4 h-4" />
            New Question
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Total Questions</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{mockThreads.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Answered</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockThreads.filter((t) => t.replies > 0).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Total Replies</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockThreads.reduce((sum, t) => sum + t.replies, 0)}
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
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="my-posts" className="text-xs sm:text-sm">My Posts</TabsTrigger>
                <TabsTrigger value="unanswered" className="text-xs sm:text-sm">Unanswered</TabsTrigger>
                <TabsTrigger value="trending" className="text-xs sm:text-sm">Trending</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Threads List */}
        <div className="space-y-3">
          {filteredThreads.map((thread) => (
            <Card
              key={thread.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedThreadId(thread.id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3 sm:gap-4">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-xs">{thread.avatar}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{thread.title}</h3>
                    <div className="flex flex-wrap gap-2 items-center mt-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">{thread.author}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {thread.category}
                      </Badge>
                      {thread.solved && (
                        <Badge className="text-xs bg-green-600">Solved</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {thread.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        {thread.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        {thread.replies}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        {thread.likes}
                      </div>
                      <p>{formatDistanceToNow(thread.posted, { addSuffix: true })}</p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
