'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Send,
  Smile,
  Paperclip,
  Archive,
  Trash2,
  MessageCircle,
  Pin,
  Bell,
} from 'lucide-react'
import { useAuthStore, useMessagesStore } from '@/lib/store'
import { format } from 'date-fns'

export default function MessagesPage() {
  const { user } = useAuthStore()
  const { messages } = useMessagesStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const [isMobileListVisible, setIsMobileListVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'unread') return matchesSearch && !msg.is_read
    return matchesSearch
  })

  const mockConversations = [
    {
      id: 'conv_1',
      name: 'Dr. Sarah Williams',
      lastMessage: 'Check the new lecture notes on databases',
      avatar: 'SW',
      unreadCount: 2,
      timestamp: new Date('2026-03-28T14:30:00'),
    },
    {
      id: 'conv_2',
      name: 'Study Group - Programming',
      lastMessage: 'Who wants to work on the assignment together?',
      avatar: 'SG',
      unreadCount: 5,
      timestamp: new Date('2026-03-28T12:15:00'),
    },
    {
      id: 'conv_3',
      name: 'Prof. David Bangura',
      lastMessage: 'Your assignment submission was received',
      avatar: 'DB',
      unreadCount: 0,
      timestamp: new Date('2026-03-27T09:00:00'),
    },
    {
      id: 'conv_4',
      name: 'Faculty Office',
      lastMessage: 'Semester 3 timetable has been published',
      avatar: 'FO',
      unreadCount: 0,
      timestamp: new Date('2026-03-26T16:45:00'),
    },
  ]

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText('')
    }
  }

  return (
    <AppShell title="Messages">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className={`lg:col-span-1 ${isMobileListVisible ? 'block' : 'hidden'} lg:block`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Messages</CardTitle>
            <CardDescription>Your conversations</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
              <TabsList className="w-full rounded-none border-t">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                <TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger>
              </TabsList>
            </Tabs>

            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="p-2 space-y-2">
                {mockConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedChat(conv.id)
                      setIsMobileListVisible(false)
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === conv.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {conv.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm truncate">{conv.name}</h3>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">{conv.unreadCount}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(conv.timestamp, 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className={`lg:col-span-2 flex flex-col ${!isMobileListVisible ? 'block' : 'hidden'} lg:block`}>
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {mockConversations.find((c) => c.id === selectedChat)?.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden"
                      onClick={() => setIsMobileListVisible(true)}
                    >
                      Back
                    </Button>
                    <Button variant="outline" size="icon">
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          i % 2 === 0
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm">Sample message content here...</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSendMessage()
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Select a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </AppShell>
  )
}
