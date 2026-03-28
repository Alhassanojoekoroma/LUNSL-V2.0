'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  Users,
  Gift,
  CheckCircle,
  Share2,
  TrendingUp,
  Mail,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'

export default function ReferralPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const referralCode = 'LUSL-' + user.referral_code
  const referralLink = `https://lusl-notepad.com?ref=${referralCode}`

  const mockReferrals = [
    {
      id: 1,
      name: 'Ayo Sesay',
      email: 'ayo.sesay@student.lusl.edu.sl',
      date: '2026-03-20',
      status: 'active',
      rewards: 50,
    },
    {
      id: 2,
      name: 'Mary Koroma',
      email: 'mary.koroma@student.lusl.edu.sl',
      date: '2026-03-15',
      status: 'active',
      rewards: 50,
    },
    {
      id: 3,
      name: 'Ibrahim Bangura',
      email: 'ibrahim.bangura@student.lusl.edu.sl',
      date: '2026-03-10',
      status: 'pending',
      rewards: 0,
    },
  ]

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Referral code copied!')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast.success('Referral link copied!')
  }

  const totalRewards = mockReferrals
    .filter((r) => r.status === 'active')
    .reduce((sum, r) => sum + r.rewards, 0)
  const activeReferrals = mockReferrals.filter((r) => r.status === 'active').length

  return (
    <AppShell title="Referral Program">
      <div className="space-y-6">
        {/* Program Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Referrals</p>
                  <p className="text-3xl font-bold mt-2">{activeReferrals}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tokens Earned</p>
                  <p className="text-3xl font-bold mt-2">{totalRewards}</p>
                </div>
                <Gift className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold mt-2">
                    {mockReferrals.filter((r) => r.status === 'pending').length}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Share your referral code and earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Share Your Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Share your unique referral code with friends and classmates
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">They Sign Up</h4>
                  <p className="text-sm text-muted-foreground">
                    Your friend signs up using your referral code
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Earn Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Both you and your friend get 50 tokens as a reward!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Referral */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Share this with friends to earn tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Code</label>
              <div className="flex gap-2">
                <Input value={referralCode} readOnly className="font-mono" />
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  size="icon"
                  title={copied ? 'Copied!' : 'Copy code'}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Link</label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="text-xs" />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button className="w-full gap-2" variant="outline">
                <Mail className="w-4 h-4" />
                Share via Email
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Share2 className="w-4 h-4" />
                Share on Social Media
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>People who signed up using your code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockReferrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{ref.name}</h4>
                    <p className="text-sm text-muted-foreground">{ref.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={ref.status === 'active' ? 'default' : 'secondary'}
                    >
                      {ref.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        'Pending'
                      )}
                    </Badge>
                    <div className="text-right">
                      <p className="font-semibold text-primary">+{ref.rewards}</p>
                      <p className="text-xs text-muted-foreground">tokens</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
