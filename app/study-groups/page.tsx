'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Search,
  Users,
  MessageSquare,
  Plus,
  Share2,
  Calendar,
  BookOpen,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

export default function StudyGroupsPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'my-groups' | 'all'>('my-groups')
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockGroups = [
    {
      id: 1,
      name: 'Calculus I Study Crew',
      category: 'Mathematics',
      description: 'Focused on mastering limits, derivatives, and integrals',
      members: 8,
      owner: 'Ayo Sesay',
      avatar: 'CS',
      isMember: true,
      messages: 145,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      schedule: 'Tuesdays 6 PM',
      tags: ['Math', 'Calculus', 'First Semester'],
    },
    {
      id: 2,
      name: 'Web Dev Mastery',
      category: 'Computer Science',
      description: 'JavaScript, React, and full-stack development discussion',
      members: 12,
      owner: 'Dr. Sarah Williams',
      avatar: 'WD',
      isMember: true,
      messages: 342,
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
      schedule: 'Thursdays 5 PM',
      tags: ['JavaScript', 'React', 'Web'],
    },
    {
      id: 3,
      name: 'Physics Problem Solvers',
      category: 'Physics',
      description: 'Collaborative problem-solving for Physics I & II',
      members: 6,
      owner: 'Jane Smith',
      avatar: 'PP',
      isMember: false,
      messages: 89,
      lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
      schedule: 'Mondays 7 PM',
      tags: ['Physics', 'Problem Solving', 'STEM'],
    },
    {
      id: 4,
      name: 'Chemistry Exam Prep',
      category: 'Chemistry',
      description: 'Preparation for upcoming chemistry exams',
      members: 15,
      owner: 'Prof. Bangura',
      avatar: 'CE',
      isMember: true,
      messages: 267,
      lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000),
      schedule: 'Saturdays 4 PM',
      tags: ['Chemistry', 'Exam Prep', 'FST'],
    },
    {
      id: 5,
      name: 'Data Structures Deep Dive',
      category: 'Computer Science',
      description: 'Advanced algorithms and data structures',
      members: 9,
      owner: 'David Bangura',
      avatar: 'DD',
      isMember: false,
      messages: 198,
      lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000),
      schedule: 'Wednesdays 5 PM',
      tags: ['Algorithms', 'Data Structures', 'CS'],
    },
  ]

  const filteredGroups = mockGroups.filter((group) => {
    const matchSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'my-groups') return matchSearch && group.isMember
    return matchSearch
  })

  const selectedGroupData = selectedGroup ? mockGroups.find((g) => g.id === selectedGroup) : null

  const mockMessages = [
    {
      id: 1,
      sender: 'Ayo Sesay',
      content: 'Anyone free tomorrow for a study session?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: 'AS',
    },
    {
      id: 2,
      sender: 'Mary Koroma',
      content: 'Yes! I can join at 6 PM. Can we focus on chain rule?',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      avatar: 'MK',
    },
    {
      id: 3,
      sender: 'John Conteh',
      content: 'Count me in! I need help with arc length calculations.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      avatar: 'JC',
    },
  ]

  if (selectedGroup && selectedGroupData) {
    return (
      <AppShell title="Study Group">
        <div className="space-y-4">
          {/* Group Header */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{selectedGroupData.name}</h1>
                  <p className="text-muted-foreground text-sm mt-2">{selectedGroupData.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedGroupData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                  <Button className="w-full sm:w-auto">
                    {selectedGroupData.isMember ? 'Leave Group' : 'Join Group'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-tight">Members</p>
                <p className="text-xl sm:text-2xl font-bold mt-2 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedGroupData.members}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-tight">Messages</p>
                <p className="text-xl sm:text-2xl font-bold mt-2 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {selectedGroupData.messages}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-tight">Schedule</p>
                <p className="text-xs sm:text-sm font-bold mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  {selectedGroupData.schedule}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-tight">Owner</p>
                <p className="text-xs sm:text-sm font-bold mt-2">{selectedGroupData.owner}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="chat" className="text-xs sm:text-sm">Chat</TabsTrigger>
              <TabsTrigger value="members" className="text-xs sm:text-sm">Members</TabsTrigger>
              <TabsTrigger value="resources" className="text-xs sm:text-sm">Resources</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <Card className="flex flex-col h-[500px]">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mockMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-xs">{msg.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold">{msg.sender}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                          {msg.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>

                <div className="border-t p-4 flex gap-2">
                  <Input placeholder="Send a message..." className="flex-1 h-8 text-sm" />
                  <Button size="sm">Send</Button>
                </div>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {['Ayo Sesay', 'Mary Koroma', 'John Conteh', 'Dr. Sarah Williams'].map((member) => (
                      <div key={member} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-primary/10">
                              {member.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{member}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources">
              <Card>
                <CardContent className="p-4 space-y-3">
                  {[
                    { title: 'Calculus I Study Guide', type: 'PDF' },
                    { title: 'Practice Problems Set 5', type: 'Document' },
                    { title: 'Video Tutorial: Chain Rule', type: 'Video' },
                  ].map((resource, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">{resource.type}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            variant="outline"
            onClick={() => setSelectedGroup(null)}
            className="w-full"
          >
            Back to Groups
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Study Groups">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Study Groups</h1>
            <p className="text-sm text-muted-foreground mt-1">Collaborate and learn together</p>
          </div>
          <Button className="w-full sm:w-auto gap-2">
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">My Groups</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockGroups.filter((g) => g.isMember).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">All Groups</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{mockGroups.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-tight">Total Members</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {mockGroups.reduce((sum, g) => sum + g.members, 0)}
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
                placeholder="Search study groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="my-groups" className="text-xs sm:text-sm">My Groups</TabsTrigger>
                <TabsTrigger value="all" className="text-xs sm:text-sm">All Groups</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <Card
              key={group.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedGroup(group.id)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg">{group.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {group.description}
                    </p>
                  </div>
                  {!group.isMember && (
                    <Badge variant="outline" className="text-xs">
                      Join
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {group.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2 text-xs sm:text-sm mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {group.members} members
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    {group.messages} messages
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {group.schedule}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Active {formatDistanceToNow(group.lastActivity, { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
