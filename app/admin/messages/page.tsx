'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  MessageSquare,
  Send,
  MoreVertical,
  Trash2,
  Flag,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

export default function AdminMessagesPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'flagged' | 'reported'>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockConversations = [
    {
      id: 1,
      sender: 'Ayo Sesay',
      receiverType: 'lecturer',
      subject: 'Assignment Deadline Question',
      preview: 'Can we get an extension for the assignment?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: true,
      flagged: false,
      iframeFlagged: false,
      messageCount: 3,
    },
    {
      id: 2,
      sender: 'Dr. Sarah Williams',
      receiverType: 'admin',
      subject: 'Platform Technical Issue',
      preview: 'The video upload feature is not working properly',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      unread: false,
      flagged: false,
      iframeFlagged: false,
      messageCount: 2,
    },
    {
      id: 3,
      sender: 'Study Group Members',
      receiverType: 'group',
      subject: 'Quiz Preparation Session',
      preview: 'Let us know your availability for the study session',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      unread: false,
      flagged: true,
      iframeFlagged: false,
      messageCount: 12,
    },
    {
      id: 4,
      sender: 'Mary Koroma',
      receiverType: 'lecturer',
      subject: 'Course Content Clarification',
      preview: 'Could you explain the concept discussed in lecture 5?',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unread: false,
      flagged: false,
      iframeFlagged: true,
      messageCount: 4,
    },
    {
      id: 5,
      sender: 'Prof. David Bangura',
      receiverType: 'admin',
      subject: 'New Feature Request',
      preview: 'Would it be possible to add a discussion forum feature?',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      unread: false,
      flagged: false,
      iframeFlagged: false,
      messageCount: 1,
    },
  ]

  const filteredConversations = mockConversations.filter((conv) => {
    const matchSearch =
      conv.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === 'flagged') return matchSearch && conv.flagged
    if (filter === 'reported') return matchSearch && conv.iframeFlagged
    return matchSearch
  })

  const selectedData = selectedConversation
    ? mockConversations.find((c) => c.id === selectedConversation)
    : null

  const mockMessages = [
    {
      id: 1,
      sender: 'Ayo Sesay',
      content: 'Hi Dr. Williams, can we get an extension for the assignment?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 2,
      sender: 'Dr. Sarah Williams',
      content: 'Hi Ayo, the deadline is firm. However, if you have extenuating circumstances, please explain.',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
    {
      id: 3,
      sender: 'Ayo Sesay',
      content: 'Thank you for getting back to me. Will submit by the deadline.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ]

  return (
    <AppShell title="Message Management">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Message Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and moderate platform messages
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Total Messages
                  </p>
                  <p className="text-2xl font-bold mt-1">2,834</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Flagged Messages
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {mockConversations.filter((c) => c.flagged).length}
                  </p>
                </div>
                <Flag className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Reported Issues
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {mockConversations.filter((c) => c.iframeFlagged).length}
                  </p>
                </div>
                <Flag className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Active Conversations
                  </p>
                  <p className="text-2xl font-bold mt-1">{mockConversations.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[500px]">
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-3">
                  <TabsList className="w-full h-8 text-xs">
                    <TabsTrigger value="all" className="text-xs">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="flagged" className="text-xs">
                      Flagged
                    </TabsTrigger>
                    <TabsTrigger value="reported" className="text-xs">
                      Reported
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Conversation Items */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 border-b text-left hover:bg-muted transition-colors ${
                      selectedConversation === conv.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{conv.sender}</p>
                          {conv.unread && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                          {conv.flagged && (
                            <Flag className="w-3 h-3 text-yellow-500" />
                          )}
                          {conv.iframeFlagged && (
                            <Flag className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conv.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(conv.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {conv.messageCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat View */}
          <Card className="col-span-2">
            <CardHeader className="pb-3 border-b flex items-center justify-between flex-row">
              {selectedData ? (
                <div className="flex-1">
                  <CardTitle className="text-lg">{selectedData.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    With {selectedData.sender}
                  </p>
                </div>
              ) : (
                <CardTitle className="text-lg">Select a conversation</CardTitle>
              )}
              {selectedData && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Flag className="w-4 h-4" />
                      Flag Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive">
                      <Trash2 className="w-4 h-4" />
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-[500px]">
              {selectedData ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {mockMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'Ayo Sesay' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            msg.sender === 'Ayo Sesay'
                              ? 'bg-muted text-foreground'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="border-t p-4 flex gap-2">
                    <Input placeholder="Type a response..." className="flex-1" />
                    <Button size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-center">Select a conversation to view messages</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
