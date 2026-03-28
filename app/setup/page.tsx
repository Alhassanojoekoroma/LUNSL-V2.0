"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { GraduationCap, BookOpen, Shield, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { FACULTIES, SEMESTERS, STUDENT_ID_PREFIX, STUDENT_ID_MIN_LENGTH } from '@/lib/constants'
import { useAuthStore } from '@/lib/store'
import type { UserRole, User } from '@/lib/types'

type Step = 'role' | 'details' | 'confirm'

export default function UserSetupPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<UserRole | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [faculty, setFaculty] = useState('')
  const [semester, setSemester] = useState('')
  const [program, setProgram] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [showTerms, setShowTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const selectedFaculty = FACULTIES.find((f) => f.code === faculty)
  const programs = selectedFaculty?.programs || []

  const validateStudentId = (id: string) => {
    if (!id.startsWith(STUDENT_ID_PREFIX)) {
      return `Student ID must start with ${STUDENT_ID_PREFIX}`
    }
    if (id.length < STUDENT_ID_MIN_LENGTH) {
      return `Student ID must be at least ${STUDENT_ID_MIN_LENGTH} characters`
    }
    return null
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 'details') {
      if (!fullName.trim()) newErrors.fullName = 'Full name is required'
      if (!email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format'

      if (role === 'student') {
        const studentIdError = validateStudentId(studentId)
        if (studentIdError) newErrors.studentId = studentIdError
        if (!faculty) newErrors.faculty = 'Please select your faculty'
        if (!semester) newErrors.semester = 'Please select your semester'
        if (!program) newErrors.program = 'Please select your program'
      } else if (role === 'lecturer' || role === 'admin') {
        if (!accessCode.trim()) newErrors.accessCode = 'Access code is required'
        if (role === 'lecturer' && !faculty) newErrors.faculty = 'Please select your faculty'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 'role' && role) {
      setStep('details')
    } else if (step === 'details' && validateStep()) {
      setStep('confirm')
    }
  }

  const handleBack = () => {
    if (step === 'details') setStep('role')
    else if (step === 'confirm') setStep('details')
  }

  const handleComplete = async () => {
    if (!termsAccepted) {
      setShowTerms(true)
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const user: User = {
      id: `usr_${Date.now()}`,
      email,
      full_name: fullName,
      role: role!,
      user_type: role!,
      faculty: faculty || undefined,
      semester: semester ? parseInt(semester) : undefined,
      program: program || undefined,
      student_id: role === 'student' ? studentId : undefined,
      avatar_url: '',
      terms_accepted: true,
      referral_code: `${fullName.split(' ')[0].toUpperCase()}${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    }

    setUser(user)
    setIsLoading(false)

    // Redirect based on role
    if (role === 'student') router.push('/dashboard')
    else if (role === 'lecturer') router.push('/lecturer/dashboard')
    else if (role === 'admin') router.push('/admin/dashboard')
  }

  const roleOptions = [
    {
      value: 'student' as UserRole,
      icon: GraduationCap,
      title: 'Student',
      description: 'Access course materials, AI assistant, and track your progress',
    },
    {
      value: 'lecturer' as UserRole,
      icon: BookOpen,
      title: 'Lecturer',
      description: 'Upload course materials and manage content for your students',
    },
    {
      value: 'admin' as UserRole,
      icon: Shield,
      title: 'Administrator',
      description: 'Manage users, content, and platform settings',
    },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to LUSL Notepad</h1>
          <p className="text-muted-foreground">Limkokwing University Sierra Leone - Student Learning Platform</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['role', 'details', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : ['role', 'details', 'confirm'].indexOf(step) > i
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {['role', 'details', 'confirm'].indexOf(step) > i ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    ['role', 'details', 'confirm'].indexOf(step) > i ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Role Selection */}
        {step === 'role' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Select your role</h2>
            <div className="grid gap-4">
              {roleOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    role === option.value ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  style={{ boxShadow: 'none' }}
                  onClick={() => setRole(option.value)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        role === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <option.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {role === option.value && <CheckCircle className="w-5 h-5 text-primary" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details Form */}
        {step === 'details' && (
          <div className="animate-fade-in">
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader>
                <CardTitle>Enter your details</CardTitle>
                <CardDescription>
                  {role === 'student'
                    ? 'Please provide your student information'
                    : role === 'lecturer'
                    ? 'Please provide your lecturer information'
                    : 'Please provide your administrator credentials'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={errors.fullName ? 'border-destructive' : ''}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.fullName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@lusl.edu.sl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        placeholder="e.g., 905001234"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className={errors.studentId ? 'border-destructive' : ''}
                      />
                      {errors.studentId && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.studentId}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Must start with {STUDENT_ID_PREFIX}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Faculty</Label>
                        <Select value={faculty} onValueChange={(v) => { setFaculty(v); setProgram('') }}>
                          <SelectTrigger className={errors.faculty ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select faculty" />
                          </SelectTrigger>
                          <SelectContent>
                            {FACULTIES.map((f) => (
                              <SelectItem key={f.code} value={f.code}>
                                {f.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.faculty && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.faculty}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Semester</Label>
                        <Select value={semester} onValueChange={setSemester}>
                          <SelectTrigger className={errors.semester ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {SEMESTERS.map((s) => (
                              <SelectItem key={s} value={s.toString()}>
                                Semester {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.semester && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.semester}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Program</Label>
                        <Select value={program} onValueChange={setProgram} disabled={!faculty}>
                          <SelectTrigger className={errors.program ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {programs.map((p) => (
                              <SelectItem key={p.code} value={p.code}>
                                {p.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.program && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.program}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {(role === 'lecturer' || role === 'admin') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="accessCode">{role === 'lecturer' ? 'Lecturer' : 'Admin'} Access Code</Label>
                      <Input
                        id="accessCode"
                        type="password"
                        placeholder="Enter your access code"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        className={errors.accessCode ? 'border-destructive' : ''}
                      />
                      {errors.accessCode && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.accessCode}
                        </p>
                      )}
                    </div>
                    {role === 'lecturer' && (
                      <div className="space-y-2">
                        <Label>Faculty</Label>
                        <Select value={faculty} onValueChange={setFaculty}>
                          <SelectTrigger className={errors.faculty ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select your faculty" />
                          </SelectTrigger>
                          <SelectContent>
                            {FACULTIES.map((f) => (
                              <SelectItem key={f.code} value={f.code}>
                                {f.code} - {f.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.faculty && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.faculty}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <div className="animate-fade-in">
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader>
                <CardTitle>Confirm your information</CardTitle>
                <CardDescription>Please review your details before completing registration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                      <p className="font-medium text-foreground">{fullName}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="font-medium text-foreground">{email}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Role</p>
                      <p className="font-medium text-foreground capitalize">{role}</p>
                    </div>
                    {role === 'student' && (
                      <>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Student ID</p>
                          <p className="font-medium text-foreground">{studentId}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Faculty</p>
                          <p className="font-medium text-foreground">{selectedFaculty?.name}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Program</p>
                          <p className="font-medium text-foreground">
                            {programs.find((p) => p.code === program)?.name} ({program})
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Semester</p>
                          <p className="font-medium text-foreground">Semester {semester}</p>
                        </div>
                      </>
                    )}
                    {role === 'lecturer' && faculty && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Faculty</p>
                        <p className="font-medium text-foreground">{selectedFaculty?.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 'role'}
            className={step === 'role' ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step !== 'confirm' ? (
            <Button onClick={handleNext} disabled={step === 'role' && !role}>
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Complete Setup'}
            </Button>
          )}
        </div>

        {/* Terms of Service Modal */}
        <Dialog open={showTerms} onOpenChange={setShowTerms}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Terms of Service</DialogTitle>
              <DialogDescription>Please read and accept our terms to continue</DialogDescription>
            </DialogHeader>
            <div className="max-h-64 overflow-y-auto text-sm text-muted-foreground space-y-4 p-4 bg-muted/50 rounded-lg">
              <p>
                By using LUSL Notepad, you agree to the following terms and conditions:
              </p>
              <p>
                <strong className="text-foreground">1. Academic Integrity:</strong> You agree to use the platform and
                its AI features for legitimate educational purposes only. Plagiarism and academic dishonesty are
                strictly prohibited.
              </p>
              <p>
                <strong className="text-foreground">2. Content Usage:</strong> All course materials are provided for
                personal educational use. Redistribution or commercial use is not permitted.
              </p>
              <p>
                <strong className="text-foreground">3. Privacy:</strong> We collect and process your data in accordance
                with our privacy policy. Your personal information is protected and used only for platform functionality.
              </p>
              <p>
                <strong className="text-foreground">4. AI Assistant:</strong> AI-generated content is for learning
                assistance only and should not be submitted as your own work.
              </p>
              <p>
                <strong className="text-foreground">5. Token Purchases:</strong> Token purchases are non-refundable.
                Tokens are used for AI queries beyond the free tier limit.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I accept the Terms of Service
                </label>
              </div>
              <Button onClick={() => { setShowTerms(false); if (termsAccepted) handleComplete(); }} disabled={!termsAccepted}>
                Accept and Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
