'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail,
  MapPin,
  GraduationCap,
  User,
  Edit,
  Share2,
  Award,
  TrendingUp,
  BookOpen,
  Users,
} from 'lucide-react'
import { useAuthStore, useProgressStore } from '@/lib/store'

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { quizScores } = useProgressStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const mockAchievements = [
    { id: 1, name: 'Quick Learner', icon: '⚡', description: 'Completed 5 courses in a month' },
    { id: 2, name: 'Quiz Master', icon: '🎯', description: 'Scored 90+ on 10 quizzes' },
    { id: 3, name: 'Content Explorer', icon: '📚', description: 'Viewed 100+ materials' },
    { id: 4, name: 'Social Butterfly', icon: '🦋', description: 'Referred 5 friends' },
  ]

  const mockActivity = [
    { id: 1, action: 'Completed quiz', subject: 'Database Fundamentals', date: '2 hours ago' },
    { id: 2, action: 'Viewed', subject: 'Web Development Lecture Notes', date: '5 hours ago' },
    { id: 3, action: 'Downloaded', subject: 'OOP Assignment', date: '1 day ago' },
    { id: 4, action: 'Joined study group', subject: 'Programming Masters', date: '2 days ago' },
  ]

  return (
    <AppShell title="Profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  <AvatarFallback className="bg-primary text-white text-xl font-bold">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{user.full_name}</h1>
                  <Badge className="mt-2 capitalize">{user.role}</Badge>

                  <div className="space-y-1 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    {user.role === 'student' && (
                      <>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          {user.faculty} • Semester {user.semester}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {user.program}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => router.push('/settings')}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {user.role === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Study Streak</p>
                    <p className="text-2xl font-bold mt-1">12 days</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-orange-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quizzes Passed</p>
                    <p className="text-2xl font-bold mt-1">{quizScores.length}</p>
                  </div>
                  <Award className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Score</p>
                    <p className="text-2xl font-bold mt-1">89%</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            {user.role === 'student' && (
              <>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="groups">Study Groups</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Badges</CardTitle>
                <CardDescription>Badges you have earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAchievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div>
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            Unlocked
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivity.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {activity.action} <span className="text-primary">{activity.subject}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          {user.role === 'student' && (
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                  <CardDescription>Courses you are currently taking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Database Systems', 'Programming II', 'Web Development', 'Data Structures'].map(
                      (course) => (
                        <div key={course} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                          <h4 className="font-semibold text-sm">{course}</h4>
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>65%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '65%' }} />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Study Groups Tab */}
          {user.role === 'student' && (
            <TabsContent value="groups">
              <Card>
                <CardHeader>
                  <CardTitle>Study Groups</CardTitle>
                  <CardDescription>Groups you are a member of</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Programming Masters', members: 12, active: true },
                      { name: 'Database Enthusiasts', members: 8, active: true },
                      { name: 'Web Dev Circle', members: 15, active: false },
                    ].map((group) => (
                      <div key={group.name} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <h4 className="font-semibold text-sm">{group.name}</h4>
                              <p className="text-xs text-muted-foreground">{group.members} members</p>
                            </div>
                          </div>
                          <Badge variant={group.active ? 'default' : 'secondary'}>
                            {group.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppShell>
  )
}
