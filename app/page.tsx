"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  GraduationCap, 
  BookOpen, 
  Bot, 
  Users, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Shield,
  Smartphone
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Wait for Zustand store to hydrate from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    
    // Check if already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    }
    
    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (hydrated && isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'student') router.push('/dashboard')
      else if (user.role === 'lecturer') router.push('/lecturer/dashboard')
      else if (user.role === 'admin') router.push('/admin/dashboard')
    }
  }, [hydrated, isAuthenticated, user, router])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Course Materials',
      description: 'Access lecture notes, assignments, tutorials, and more - all organized by faculty and semester.',
    },
    {
      icon: Bot,
      title: 'AI Study Assistant',
      description: '10 powerful learning tools including study guides, practice quizzes, and audio overviews.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Work together on tasks, share notes, and communicate with lecturers and peers.',
    },
    {
      icon: Sparkles,
      title: 'Track Progress',
      description: 'Monitor your quiz scores, set learning goals, and track your academic journey.',
    },
  ]

  const benefits = [
    'Access materials 24/7 from any device',
    'Free AI queries every day',
    'Personalized learning experience',
    'Mobile money token purchases',
    'Referral rewards program',
    'Dark mode for comfortable studying',
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Official LUSL Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
              LUSL <span className="text-primary">Notepad</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-2">
              Limkokwing University Sierra Leone
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Your digital learning companion. Access course materials, study with AI assistance, 
              track your progress, and collaborate with peers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/setup')} className="w-full sm:w-auto">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/setup')} className="w-full sm:w-auto">
                <Smartphone className="w-4 h-4 mr-2" /> Continue on Mobile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Everything you need to succeed
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A comprehensive platform designed specifically for Limkokwing University students and lecturers.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card/50 backdrop-blur" style={{ boxShadow: 'none' }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Why choose LUSL Notepad?
              </h2>
              <div className="grid gap-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="border-border bg-card" style={{ boxShadow: 'none' }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">AI Study Assistant</h4>
                      <p className="text-sm text-muted-foreground">10 learning tools at your fingertips</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {['Study Guide', 'Practice Quiz', 'Fill in Blanks', 'Matching Quiz', 'True/False', 'Concept Explainer', 'Study Plan', 'Audio Overview', 'Exam Prep', 'Note Summary'].map((tool) => (
                      <div key={tool} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{tool}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Built for everyone
          </h2>
          <p className="text-muted-foreground">
            Role-based dashboards for students, lecturers, and administrators
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-border bg-card/50" style={{ boxShadow: 'none' }}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Students</h3>
              <p className="text-sm text-muted-foreground">
                Browse materials, use AI assistant, manage tasks, track progress, and purchase tokens.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50" style={{ boxShadow: 'none' }}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-info/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-info" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Lecturers</h3>
              <p className="text-sm text-muted-foreground">
                Upload course materials, manage content, view analytics, and communicate with students.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50" style={{ boxShadow: 'none' }}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Administrators</h3>
              <p className="text-sm text-muted-foreground">
                Manage users, monitor platform activity, send bulk messages, and oversee operations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-primary/5 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to start your learning journey?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join hundreds of Limkokwing students already using LUSL Notepad to excel in their studies.
          </p>
          <Button size="lg" onClick={() => router.push('/setup')}>
            Create Your Account <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">LUSL Notepad</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Limkokwing University Sierra Leone - Student Learning Platform
            </p>
            <p className="text-sm text-muted-foreground">
              Version 1.0 - March 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
