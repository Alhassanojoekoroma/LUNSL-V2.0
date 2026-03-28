"use client"

import { useState, useEffect, useRef } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Bot,
  Send,
  Settings,
  FileText,
  Plus,
  Trash2,
  BookOpen,
  HelpCircle,
  Edit,
  Link,
  CheckCircle,
  Lightbulb,
  Calendar,
  Headphones,
  GraduationCap,
  Coins,
  History,
  Sparkles,
  ChevronRight,
  X,
  Search,
  RefreshCw,
  Star
} from 'lucide-react'
import { useAuthStore, useAIChatStore, useTokenStore, useContentStore } from '@/lib/store'
import { mockContents, mockTokenBalance } from '@/lib/mock-data'
import { AI_LEARNING_TOOLS, LEARNING_LEVELS, FREE_QUERIES_PER_DAY } from '@/lib/constants'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import type { AIInteraction, AIQueryType, LearningLevel, Content } from '@/lib/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  HelpCircle,
  Edit,
  Link,
  CheckCircle,
  Lightbulb,
  Calendar,
  Headphones,
  GraduationCap,
  FileText,
}

export default function AIAssistantPage() {
  const { user } = useAuthStore()
  const { interactions, currentSources, config, addInteraction, clearInteractions, setSources, addSource, removeSource, setConfig } = useAIChatStore()
  const { balance, setBalance, deductToken } = useTokenStore()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sourcesSheetOpen, setSourcesSheetOpen] = useState(false)
  const [toolsSheetOpen, setToolsSheetOpen] = useState(false)
  const [historySheetOpen, setHistorySheetOpen] = useState(false)
  const [configSheetOpen, setConfigSheetOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<AIQueryType>('chat')
  const [mounted, setMounted] = useState(false)
  const [availableContent, setAvailableContent] = useState<Content[]>([])
  const [sourceSearch, setSourceSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Free queries tracking (simulated)
  const [freeQueriesUsed, setFreeQueriesUsed] = useState(5)
  const freeQueriesRemaining = FREE_QUERIES_PER_DAY - freeQueriesUsed

  useEffect(() => {
    setMounted(true)
    if (!balance) {
      setBalance(mockTokenBalance)
    }
    // Load available content for sources
    if (user) {
      const filtered = mockContents.filter(
        (c) => c.faculty === user.faculty && c.semester === user.semester && c.is_active
      )
      setAvailableContent(filtered)
    }
  }, [user, balance, setBalance])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [interactions])

  if (!mounted || !user) return null

  const filteredSources = availableContent.filter(
    (c) => c.title.toLowerCase().includes(sourceSearch.toLowerCase()) || c.module.toLowerCase().includes(sourceSearch.toLowerCase())
  )

  const handleSendMessage = async () => {
    if (!query.trim()) return
    if (freeQueriesRemaining <= 0 && (!balance || balance.available <= 0)) {
      // No tokens available
      return
    }

    setIsLoading(true)

    // Deduct token if no free queries
    if (freeQueriesRemaining <= 0 && balance && balance.available > 0) {
      deductToken()
    } else {
      setFreeQueriesUsed((prev) => prev + 1)
    }

    // Simulate AI response
    const toolInfo = AI_LEARNING_TOOLS.find((t) => t.id === selectedTool)
    const toolName = toolInfo?.name || 'Chat'

    // Generate mock response based on tool type
    let mockResponse = ''
    switch (selectedTool) {
      case 'study_guide':
        mockResponse = `# Study Guide: ${query}\n\n## Key Concepts\n1. **Concept 1**: Description of the first key concept...\n2. **Concept 2**: Description of the second key concept...\n\n## Learning Objectives\n- Understand the fundamental principles\n- Apply concepts to practical scenarios\n- Analyze and evaluate related problems\n\n## Summary\nThis topic covers important fundamentals that are essential for your understanding...`
        break
      case 'practice_quiz':
        mockResponse = `# Practice Quiz: ${query}\n\n**Question 1:** What is the primary purpose of...?\na) Option A\nb) Option B\nc) Option C\nd) Option D\n\n**Answer:** c) Option C\n**Explanation:** This is correct because...\n\n**Question 2:** Which of the following best describes...?\na) Option A\nb) Option B\nc) Option C\nd) Option D\n\n**Answer:** b) Option B\n**Explanation:** The correct answer is B because...`
        break
      case 'note_summary':
        mockResponse = `# Note Summary: ${query}\n\n## Overview\n- **Main Topic**: Brief description\n- **Key Points**: Important highlights\n\n## Detailed Notes\n- Point 1: Detailed explanation...\n- Point 2: Important consideration...\n- Point 3: Key takeaway...\n\n## Conclusion\nThe main takeaway from this topic is...`
        break
      default:
        mockResponse = `Based on your question about "${query}", here's what I found:\n\nThis is a simulated AI response. In the actual implementation, this would be powered by an AI model that analyzes your selected source materials and provides detailed, contextual answers.\n\n**Key Points:**\n1. First important point about your query\n2. Second relevant detail\n3. Additional context and explanation\n\nWould you like me to elaborate on any specific aspect?`
    }

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const interaction: AIInteraction = {
      id: `ai_${Date.now()}`,
      user_id: user.id,
      query: `[${toolName}] ${query}`,
      response: mockResponse,
      source_content_ids: currentSources.map((s) => s.id),
      query_type: selectedTool,
      response_time: 1500,
      created_at: new Date().toISOString(),
    }

    addInteraction(interaction)
    setQuery('')
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectTool = (toolId: string) => {
    setSelectedTool(toolId as AIQueryType)
    setToolsSheetOpen(false)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <AppShell title="AI Study Assistant">
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              AI Study Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentSources.length > 0 
                ? `${currentSources.length} source${currentSources.length > 1 ? 's' : ''} selected` 
                : 'Select sources to get started'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Token Balance */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{balance?.available ?? 0} tokens</span>
            </div>
            
            {/* Free Queries */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{freeQueriesRemaining}/{FREE_QUERIES_PER_DAY} free</span>
            </div>

            {/* Config Button */}
            <Sheet open={configSheetOpen} onOpenChange={setConfigSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>AI Configuration</SheetTitle>
                  <SheetDescription>Customize how the AI responds to your queries</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Learning Level</Label>
                    <Select
                      value={config.learningLevel}
                      onValueChange={(v) => setConfig({ learningLevel: v as LearningLevel })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEARNING_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <p className="font-medium">{level.label}</p>
                              <p className="text-xs text-muted-foreground">{level.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Response Length</Label>
                    <Select
                      value={config.responseLength}
                      onValueChange={(v) => setConfig({ responseLength: v as 'default' | 'shorter' | 'longer' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shorter">Shorter</SelectItem>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="longer">Longer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Instructions (optional)</Label>
                    <Textarea
                      placeholder="Add any specific instructions for the AI..."
                      value={config.customInstructions || ''}
                      onChange={(e) => setConfig({ customInstructions: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* History Button */}
            <Sheet open={historySheetOpen} onOpenChange={setHistorySheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Chat History</SheetTitle>
                  <SheetDescription>Your past AI conversations</SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  {interactions.length > 0 ? (
                    <>
                      <Button variant="outline" size="sm" className="w-full mb-4" onClick={clearInteractions}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear History
                      </Button>
                      <ScrollArea className="h-[calc(100vh-16rem)]">
                        <div className="space-y-3">
                          {interactions.slice().reverse().map((interaction) => (
                            <Card key={interaction.id} style={{ boxShadow: 'none' }}>
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {interaction.query_type.replace('_', ' ')}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(parseISO(interaction.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground mt-2 line-clamp-2">
                                  {interaction.query.replace(/\[.*?\]\s*/, '')}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No history yet</p>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Sources Panel (Desktop) */}
          <Card className="hidden lg:flex flex-col w-64 flex-shrink-0" style={{ boxShadow: 'none' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Sources</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSourcesSheetOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {currentSources.length > 0 ? (
                <div className="space-y-2">
                  {currentSources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border"
                    >
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-foreground truncate flex-1">{source.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => removeSource(source.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No sources selected</p>
                  <Button variant="link" size="sm" className="mt-1" onClick={() => setSourcesSheetOpen(true)}>
                    Add sources
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Panel */}
          <Card className="flex-1 flex flex-col min-w-0" style={{ boxShadow: 'none' }}>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {interactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to AI Study Assistant</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Select course materials as sources, choose a learning tool, and ask your study questions.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSourcesSheetOpen(true)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Add Sources
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setToolsSheetOpen(true)}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Learning Tools
                      </Button>
                    </div>
                  </div>
                ) : (
                  interactions.map((interaction) => (
                    <div key={interaction.id} className="space-y-4">
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="flex items-start gap-3 max-w-[80%]">
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3">
                            <p className="text-sm whitespace-pre-wrap">
                              {interaction.query.replace(/\[.*?\]\s*/, '')}
                            </p>
                          </div>
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex justify-start">
                        <div className="flex items-start gap-3 max-w-[80%]">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                            <p className="text-sm whitespace-pre-wrap text-foreground">
                              {interaction.response}
                            </p>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                              <span className="text-xs text-muted-foreground">Was this helpful?</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Star className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Generating response...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              {/* Selected Tool */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="cursor-pointer" onClick={() => setToolsSheetOpen(true)}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {AI_LEARNING_TOOLS.find((t) => t.id === selectedTool)?.name || 'Chat'}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Badge>
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSourcesSheetOpen(true)}>
                  <FileText className="w-4 h-4 mr-1" />
                  {currentSources.length} sources
                </Button>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder={`Ask a question using ${AI_LEARNING_TOOLS.find((t) => t.id === selectedTool)?.name || 'Chat'}...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows={1}
                  className="min-h-[44px] max-h-32 resize-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!query.trim() || isLoading || (freeQueriesRemaining <= 0 && (!balance || balance.available <= 0))}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Warning if no tokens/queries */}
              {freeQueriesRemaining <= 0 && (!balance || balance.available <= 0) && (
                <p className="text-xs text-destructive mt-2">
                  No free queries or tokens remaining. Purchase more tokens to continue.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Sources Sheet (Mobile) */}
        <Sheet open={sourcesSheetOpen} onOpenChange={setSourcesSheetOpen}>
          <SheetContent side="left" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Select Sources</SheetTitle>
              <SheetDescription>Choose course materials to inform AI responses</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials..."
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-2">
                  {filteredSources.map((content) => {
                    const isSelected = currentSources.some((s) => s.id === content.id)
                    return (
                      <div
                        key={content.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 border-border hover:border-primary/30'
                        }`}
                        onClick={() => isSelected ? removeSource(content.id) : addSource(content)}
                      >
                        <Checkbox checked={isSelected} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{content.title}</p>
                          <p className="text-xs text-muted-foreground">{content.module}</p>
                        </div>
                        <Badge variant="outline" className="text-xs uppercase">{content.file_type}</Badge>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>

        {/* Learning Tools Sheet */}
        <Sheet open={toolsSheetOpen} onOpenChange={setToolsSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Learning Tools</SheetTitle>
              <SheetDescription>Choose a tool for your study needs</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)] mt-4">
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTool === 'chat' ? 'bg-primary/10 border-primary/30' : 'hover:border-primary/30'
                  }`}
                  onClick={() => selectTool('chat')}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Chat</p>
                    <p className="text-xs text-muted-foreground">Free-form conversation with AI</p>
                  </div>
                  {selectedTool === 'chat' && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                {AI_LEARNING_TOOLS.map((tool) => {
                  const Icon = iconMap[tool.icon] || Sparkles
                  return (
                    <div
                      key={tool.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTool === tool.id ? 'bg-primary/10 border-primary/30' : 'hover:border-primary/30'
                      }`}
                      onClick={() => selectTool(tool.id)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                      {selectedTool === tool.id && <CheckCircle className="w-5 h-5 text-primary" />}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  )
}
