'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { UserProfile } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { useExpenseData } from '@/hooks/useExpenseData'
import { formatINR } from '@/lib/utils'
import { Download, Bell, Shield, Settings, Database } from 'lucide-react'

const notificationOptions = [
  { key: 'emailAlerts', label: 'Email alerts for large spends' },
  { key: 'smsReminders', label: 'SMS reminders for bill payments' },
  { key: 'btcSignals', label: 'Bitcoin integrity updates' },
  { key: 'weeklyDigest', label: 'Weekly expense digest' },
] as const

type NotificationKey = (typeof notificationOptions)[number]['key']

export default function ManageView() {
  const { resolvedTheme } = useTheme()
  const { summary } = useExpenseData()
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    emailAlerts: true,
    smsReminders: false,
    btcSignals: true,
    weeklyDigest: true,
  })
  const [defaultAccount, setDefaultAccount] = useState('hdfc')
  const [isSeeding, setIsSeeding] = useState(false)

  function toggleNotification(key: NotificationKey) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSeed() {
    setIsSeeding(true)
    try {
      const response = await fetch('/api/seed-for-current-user', { method: 'POST' })
      if (!response.ok) {
        console.error('Failed to seed data')
      }
      // Optionally, you can add a toast notification here to inform the user
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5 text-primary" />
              Account Preferences
            </CardTitle>
            <CardDescription>Control how Expensify manages your INR accounts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-sm text-muted-foreground">Default settlement account</Label>
              <Select value={defaultAccount} onValueChange={setDefaultAccount}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hdfc">HDFC Bank Savings</SelectItem>
                  <SelectItem value="axis">Axis Atlas Credit</SelectItem>
                  <SelectItem value="icici">ICICI Coral Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-sm text-muted-foreground">Current surplus</p>
              <p className="text-2xl font-semibold text-primary">{formatINR(summary.netCashflow)}</p>
              <p className="text-xs text-muted-foreground">Savings rate {(summary.savingsRate * 100).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-primary" />
              Security Posture
            </CardTitle>
            <CardDescription>Key protections in place</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span>2FA enforcement</span>
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600">Active</Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Device approvals</span>
              <Badge variant="secondary">Required</Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Last security review</span>
              <Badge variant="outline">7 days ago</Badge>
            </div>
            <Button variant="outline" className="w-full mt-4">Launch security checklist</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Developer Actions
          </CardTitle>
          <CardDescription>Actions for development and testing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeed} disabled={isSeeding}>
            {isSeeding ? 'Seeding...' : 'Seed Data for Current User'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will add sample accounts, categories, and transactions for your user.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Notification Centre
          </CardTitle>
          <CardDescription>Fine-tune how Expensify keeps you informed</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {notificationOptions.map((option) => (
            <div key={option.key} className="flex items-start justify-between gap-4 rounded-lg border border-primary/10 bg-secondary/60 p-4">
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">Stay on top of rupee flows and BTC signals</p>
              </div>
              <Switch checked={notifications[option.key]} onCheckedChange={() => toggleNotification(option.key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-primary" />
            Data & Exports
          </CardTitle>
          <CardDescription>Export INR statements or schedule compliance reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>Export monthly ledger</Button>
            <Button variant="outline">Schedule GST-ready CSV</Button>
            <Button variant="ghost">Connect to Tally</Button>
          </div>
          <Separator className="my-2" />
          <p className="text-xs text-muted-foreground">
            Exports are generated in Indian Rupees with precision rounded to the nearest rupee.
          </p>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-background/80 p-4">
        <UserProfile
          routing="hash"
          appearance={{
            baseTheme: (resolvedTheme === 'dark' ? 'dark' : 'light') as any,
            variables: {
              colorPrimary: '#d4af37',
              colorText: resolvedTheme === 'dark' ? '#f4e6bf' : '#1c1408',
            },
            elements: {
              card: {
                background: 'transparent',
                boxShadow: 'none',
              },
              headerSubtitle: {
                color: resolvedTheme === 'dark' ? '#d0b773' : '#7a6424',
              },
              badge: {
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                color: resolvedTheme === 'dark' ? '#f6d37b' : '#d4af37',
              },
            },
          }}
        />
      </div>
    </div>
  )
}