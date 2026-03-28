'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  User,
  Lock,
  Bell,
  Eye,
  Mail,
  Shield,
  LogOut,
  Trash2,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    newContent: false,
    assignments: true,
    messages: true,
    profilePrivate: false,
    allowMessaging: true,
    dataCollection: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    toast.success('Setting updated')
  }

  const handleLogout = () => {
    logout()
    router.push('/setup')
  }

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false)
    toast.error('Account deletion requested. Check email for confirmation.')
  }

  return (
    <AppShell title="Settings">
      <div className="max-w-2xl space-y-6">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={user.full_name} />
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" defaultValue={user.email} />
                </div>

                {user.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label>Student ID</Label>
                      <Input defaultValue={user.student_id} readOnly />
                    </div>

                    <div className="space-y-2">
                      <Label>Faculty</Label>
                      <Input defaultValue={user.faculty} readOnly />
                    </div>

                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Input defaultValue={user.semester?.toString()} readOnly />
                    </div>
                  </>
                )}

                <Button className="w-full">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Type</CardTitle>
                <CardDescription>Your account role and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold capitalize">{user.role} Account</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.role === 'student'
                      ? 'Access to course materials, AI assistant, and progress tracking'
                      : user.role === 'lecturer'
                      ? 'Ability to upload and manage course content'
                      : 'Full admin access to manage users and content'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Control how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">General Notifications</h3>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(v) => handleSettingChange('emailNotifications', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Get instant alerts on your device</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(v) => handleSettingChange('pushNotifications', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Weekly Digest</p>
                      <p className="text-xs text-muted-foreground">Receive weekly summary emails</p>
                    </div>
                    <Switch
                      checked={settings.weeklyDigest}
                      onCheckedChange={(v) => handleSettingChange('weeklyDigest', v)}
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Content Notifications</h3>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">New Content</p>
                      <p className="text-xs text-muted-foreground">When new materials are uploaded</p>
                    </div>
                    <Switch
                      checked={settings.newContent}
                      onCheckedChange={(v) => handleSettingChange('newContent', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Assignments</p>
                      <p className="text-xs text-muted-foreground">Upcoming assignments and deadlines</p>
                    </div>
                    <Switch
                      checked={settings.assignments}
                      onCheckedChange={(v) => handleSettingChange('assignments', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Messages</p>
                      <p className="text-xs text-muted-foreground">New messages and replies</p>
                    </div>
                    <Switch
                      checked={settings.messages}
                      onCheckedChange={(v) => handleSettingChange('messages', v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Privacy Controls
                </CardTitle>
                <CardDescription>Manage your privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Private Profile</p>
                    <p className="text-xs text-muted-foreground">
                      Hide your profile from other users
                    </p>
                  </div>
                  <Switch
                    checked={settings.profilePrivate}
                    onCheckedChange={(v) => handleSettingChange('profilePrivate', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Allow Direct Messages</p>
                    <p className="text-xs text-muted-foreground">
                      Let others message you
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMessaging}
                    onCheckedChange={(v) => handleSettingChange('allowMessaging', v)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Data Collection</p>
                    <p className="text-xs text-muted-foreground">
                      Allow analytics and improvement data
                    </p>
                  </div>
                  <Switch
                    checked={settings.dataCollection}
                    onCheckedChange={(v) => handleSettingChange('dataCollection', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Change Password</h3>
                  <div className="space-y-3">
                    <Input type="password" placeholder="Current Password" />
                    <Input type="password" placeholder="New Password" />
                    <Input type="password" placeholder="Confirm Password" />
                    <Button className="w-full">Update Password</Button>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-sm">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add extra security to your account with 2FA
                  </p>
                  <Button variant="outline" className="w-full">
                    Enable 2FA
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-sm">Active Sessions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Windows Chrome</p>
                      <p className="text-muted-foreground text-xs">
                        Active now • Last active 2 minutes ago
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Sign Out All Other Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  )
}
