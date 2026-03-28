"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  BookOpen, 
  FileText, 
  Video, 
  Presentation,
  Bot,
  Calendar,
  User,
  Clock,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { mockContents, mockModules } from '@/lib/mock-data'
import { useAuthStore, useAIChatStore } from '@/lib/store'
import { CONTENT_TYPE_ICONS } from '@/lib/constants'
import type { Content } from '@/lib/types'

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { addSource, currentSources } = useAIChatStore()
  const [content, setContent] = useState<Content | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    }
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const found = mockContents.find(c => c.id === params.id)
    if (found) {
      setContent(found)
    }
  }, [params.id])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!content) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Content Not Found</h2>
            <p className="text-muted-foreground mb-4">The content you are looking for does not exist.</p>
            <Button onClick={() => router.push('/browse')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Browse
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  const module = mockModules.find(m => m.id === content.module_id)
  const isInSources = currentSources.some(s => s.id === content.id)

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'lecture_note': return FileText
      case 'assignment': return BookOpen
      case 'tutorial': return Video
      case 'presentation': return Presentation
      default: return FileText
    }
  }

  const ContentIcon = getContentIcon(content.content_type)

  const handleAddToAI = () => {
    addSource(content)
    router.push('/ai-assistant')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {/* Content Header */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ContentIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="secondary" className="capitalize">
                  {content.content_type.replace('_', ' ')}
                </Badge>
                {module && (
                  <Badge variant="outline">{module.code}</Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {content.title}
              </h1>
              {content.description && (
                <p className="text-muted-foreground">{content.description}</p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{content.lecturer_name || 'Unknown Lecturer'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(content.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{content.view_count} views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span>{content.download_count} downloads</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button 
              variant="outline" 
              onClick={handleAddToAI}
              className="flex-1 sm:flex-none"
            >
              <Bot className="w-4 h-4 mr-2" /> 
              {isInSources ? 'Open in AI Assistant' : 'Study with AI'}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-primary" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="related">Related Content</TabsTrigger>
          </TabsList>

          <TabsContent value="preview">
            <Card style={{ boxShadow: 'none' }}>
              <CardContent className="p-6">
                {/* Simulated Content Preview */}
                <div className="bg-muted/50 rounded-lg p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                  <ContentIcon className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {content.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    This is a preview of the content. In production, the actual document, 
                    video, or presentation would be displayed here.
                  </p>
                  <div className="flex gap-3">
                    <Button>
                      <Download className="w-4 h-4 mr-2" /> Download File
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open in New Tab
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card style={{ boxShadow: 'none' }}>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Content Information</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Type</dt>
                        <dd className="text-foreground capitalize">{content.content_type.replace('_', ' ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Module</dt>
                        <dd className="text-foreground">{module?.name || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Module Code</dt>
                        <dd className="text-foreground">{module?.code || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Uploaded By</dt>
                        <dd className="text-foreground">{content.lecturer_name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Upload Date</dt>
                        <dd className="text-foreground">{formatDate(content.created_at)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Statistics</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Total Views</dt>
                        <dd className="text-foreground">{content.view_count}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Total Downloads</dt>
                        <dd className="text-foreground">{content.download_count}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">File Size</dt>
                        <dd className="text-foreground">2.4 MB</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">File Format</dt>
                        <dd className="text-foreground">PDF</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="related">
            <div className="grid gap-4 sm:grid-cols-2">
              {mockContents
                .filter(c => c.module_id === content.module_id && c.id !== content.id)
                .slice(0, 4)
                .map(related => {
                  const RelatedIcon = getContentIcon(related.content_type)
                  return (
                    <Card 
                      key={related.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      style={{ boxShadow: 'none' }}
                      onClick={() => router.push(`/content/${related.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <RelatedIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {related.title}
                            </h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {related.content_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              {mockContents.filter(c => c.module_id === content.module_id && c.id !== content.id).length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No related content found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
