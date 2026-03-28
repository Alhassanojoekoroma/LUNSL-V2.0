'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Coins,
  Check,
  Zap,
  Gift,
  CreditCard,
  Wallet,
} from 'lucide-react'
import { useAuthStore, useTokenStore } from '@/lib/store'

export default function TokensPage() {
  const { user } = useAuthStore()
  const { balance } = useTokenStore()
  const [mounted, setMounted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('100')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const tokenPlans = [
    {
      id: '50',
      tokens: 50,
      price: '$5.99',
      originalPrice: '$7.99',
      savings: 25,
      popular: false,
      icon: Coins,
    },
    {
      id: '100',
      tokens: 100,
      price: '$9.99',
      originalPrice: '$14.99',
      savings: 33,
      popular: true,
      icon: Zap,
    },
    {
      id: '500',
      tokens: 500,
      price: '$39.99',
      originalPrice: '$74.99',
      savings: 47,
      popular: false,
      icon: Gift,
    },
    {
      id: '1000',
      tokens: 1000,
      price: '$69.99',
      originalPrice: '$149.99',
      savings: 53,
      popular: false,
      icon: Coins,
    },
  ]

  const mockTransactionHistory = [
    { id: 1, type: 'purchase', tokens: 100, amount: '$9.99', date: '2026-03-25' },
    { id: 2, type: 'used', tokens: 15, amount: 'AI Chat', date: '2026-03-24' },
    { id: 3, type: 'purchase', tokens: 50, amount: '$5.99', date: '2026-03-20' },
    { id: 4, type: 'used', tokens: 10, amount: 'AI Analysis', date: '2026-03-19' },
  ]

  const handlePurchase = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
  }

  const selectedTokens = tokenPlans.find((p) => p.id === selectedPlan)

  return (
    <AppShell title="Purchase Tokens">
      <div className="space-y-6">
        {/* Current Balance */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-4xl font-bold text-primary mt-2">{balance?.available ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Tokens available for AI features</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Coins className="w-10 h-10 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token Plans */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tokenPlans.map((plan) => {
                  const Icon = plan.icon
                  return (
                    <div
                      key={plan.id}
                      className="relative"
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          MOST POPULAR
                        </Badge>
                      )}
                      <Card
                        className={`cursor-pointer transition-all ${
                          selectedPlan === plan.id
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'hover:border-primary/50'
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold">{plan.tokens}</h3>
                              <p className="text-xs text-muted-foreground">Tokens</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold">{plan.price}</span>
                              <span className="text-sm line-through text-muted-foreground">
                                {plan.originalPrice}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-green-600">
                              Save {plan.savings}%
                            </p>
                          </div>

                          {selectedPlan === plan.id && (
                            <div className="w-full h-10 rounded-lg bg-primary flex items-center justify-center text-white font-semibold">
                              <Check className="w-4 h-4 mr-2" />
                              Selected
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-3 flex-1 cursor-pointer">
                        <CreditCard className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard, AmEx</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex items-center gap-3 flex-1 cursor-pointer">
                        <Wallet className="w-5 h-5" />
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-xs text-muted-foreground">Fast and secure</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="font-semibold">{selectedTokens?.tokens}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">{selectedTokens?.price}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{selectedTokens?.price}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Purchase Tokens'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent token transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockTransactionHistory.map((trans) => (
                <div key={trans.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        trans.type === 'purchase'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {trans.type === 'purchase' ? 'Purchased' : 'Used'} {trans.tokens} Tokens
                      </p>
                      <p className="text-xs text-muted-foreground">{trans.amount}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{trans.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
