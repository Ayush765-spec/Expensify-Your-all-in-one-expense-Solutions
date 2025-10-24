'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { useBitcoinData } from '@/hooks/useBitcoinData'
import { formatINR, cn } from '@/lib/utils'
import { Bitcoin, LineChartIcon, ShieldCheck, Coins, ArrowUpRight, Sparkles, CheckCircle2, RefreshCw, Wallet, Plus } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const integrityConfig = {
  price: {
    label: 'Price (₹)',
    color: 'var(--chart-2)',
  },
}

const walletTypeOptions = ['Hardware', 'Lightning', 'Custodial', 'Software']

export default function BitcoinIntegrityView() {
  const { holdings, history, integrityMetrics, riskSignals, hedgeStrategies, custodyChecklist, wallets, addWallet } = useBitcoinData()
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [isStrategyDialogOpen, setIsStrategyDialogOpen] = useState(false)
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false)
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running'>('idle')
  const [lastExecutedStrategy, setLastExecutedStrategy] = useState<string | null>(null)
  const [metrics, setMetrics] = useState(integrityMetrics)
  const [riskData, setRiskData] = useState(riskSignals)
  const [isRefreshingMetrics, setIsRefreshingMetrics] = useState(false)
  const [isDownloadingReport, setIsDownloadingReport] = useState(false)
  const [walletForm, setWalletForm] = useState({
    name: '',
    type: walletTypeOptions[0],
    custodian: '',
    address: '',
    balanceBtc: '',
  })
  const [checklistState, setChecklistState] = useState(() =>
    custodyChecklist.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.id] = item.completed
      return acc
    }, {})
  )

  const activeStrategy = hedgeStrategies.find((strategy) => strategy.id === selectedStrategy)
  const checklistCompletion =
    Object.values(checklistState).filter(Boolean).length / Object.keys(checklistState).length
  const checklistPercent = Math.round(checklistCompletion * 100)

  function recommendationForScore(score: number) {
    if (score >= 80) return 'Maintain'
    if (score >= 65) return 'Monitor'
    return 'Reduce'
  }

  function handleSelectStrategy(id: string) {
    setSelectedStrategy(id)
    setIsStrategyDialogOpen(true)
    setExecutionStatus('idle')
  }

  function handleExecuteStrategy() {
    if (!activeStrategy) {
      return
    }
    setExecutionStatus('running')
    setTimeout(() => {
      setExecutionStatus('idle')
      setIsStrategyDialogOpen(false)
      setLastExecutedStrategy(activeStrategy.label)
      toast.success(`${activeStrategy.label} executed`, {
        description: `Estimated hedge cost ${formatINR(activeStrategy.estimatedCost)} with ${(activeStrategy.effectiveness * 100).toFixed(0)}% coverage`,
      })
    }, 1200)
  }

  function handleChecklistToggle(id: string) {
    setChecklistState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  function handleChecklistSave() {
    setIsChecklistDialogOpen(false)
    toast.success('Custody checklist updated', {
      description: `${checklistPercent}% complete`,
    })
  }

  function handleRefreshMetrics() {
    setIsRefreshingMetrics(true)
    setTimeout(() => {
      setMetrics((prev) =>
        prev.map((metric) => {
          const delta = Math.max(-6, Math.min(6, Math.round((Math.random() - 0.5) * 10)))
          const nextValue = Math.max(40, Math.min(100, metric.value + delta))
          return { ...metric, value: nextValue, change: delta }
        })
      )
      setRiskData((prev) =>
        prev.map((signal) => {
          const delta = (Math.random() - 0.5) * 10
          const nextScore = Math.max(45, Math.min(95, Math.round(signal.score + delta)))
          return {
            ...signal,
            score: nextScore,
            recommendation: recommendationForScore(nextScore),
          }
        })
      )
      setIsRefreshingMetrics(false)
      toast.info('Integrity metrics refreshed')
    }, 900)
  }

  function handleDownloadReport() {
    setIsDownloadingReport(true)
    setTimeout(() => {
      setIsDownloadingReport(false)
      toast.success('Risk report queued for delivery', {
        description: 'We will email the INR report to your registered address shortly.',
      })
    }, 1400)
  }

  function handleWalletSubmit() {
    const balance = Number(walletForm.balanceBtc)
    if (!walletForm.name || !walletForm.address || Number.isNaN(balance) || balance < 0) {
      return
    }
    const name = walletForm.name
    addWallet({
      name,
      type: walletForm.type,
      custodian: walletForm.custodian,
      address: walletForm.address,
      balanceBtc: balance,
    })
    setIsWalletDialogOpen(false)
    setWalletForm({
      name: '',
      type: walletTypeOptions[0],
      custodian: '',
      address: '',
      balanceBtc: '',
    })
    toast.success('Wallet added', {
      description: `${name} added with ${balance.toFixed(4)} BTC`,
    })
  }

  const totalWalletBalance = wallets.reduce((acc, wallet) => acc + wallet.balanceBtc, 0)
  const totalWalletValue = formatINR(totalWalletBalance * holdings.currentPriceInr)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bitcoin className="h-6 w-6 text-primary" />
              Bitcoin Integrity Overview
            </CardTitle>
            <CardDescription>Real-time health metrics and INR denominated valuations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-3xl font-semibold text-primary">{holdings.formattedValue}</p>
              <p className="text-xs text-muted-foreground">
                {holdings.coinsHeld} BTC • last updated {new Date(holdings.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4">
              <p className="text-sm text-muted-foreground">Realised Gain</p>
              <p className="text-3xl font-semibold text-emerald-500">{holdings.formattedGain}</p>
              <p className="text-xs text-muted-foreground">Allocation {(holdings.allocationPercent * 100).toFixed(0)}% of portfolio</p>
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-background/80 p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Latest hedge activity</p>
                <p className="text-sm">
                  {lastExecutedStrategy ? `Executed ${lastExecutedStrategy}` : 'No hedge actions executed yet'}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (hedgeStrategies[0]) {
                    handleSelectStrategy(hedgeStrategies[0].id)
                  }
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Recommend hedge
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Integrity Actions</CardTitle>
            <CardDescription>Strengthen your BTC posture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hedgeStrategies.map((strategy) => (
              <Button
                key={strategy.id}
                className="w-full justify-between"
                variant={selectedStrategy === strategy.id ? 'default' : 'outline'}
                onClick={() => handleSelectStrategy(strategy.id)}
              >
                <span>{strategy.label}</span>
                {lastExecutedStrategy === strategy.label && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </Button>
            ))}
            <Button
              className="w-full"
              variant="ghost"
              onClick={() => setIsChecklistDialogOpen(true)}
            >
              View custody checklist
            </Button>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-muted-foreground">
              Regularly review the integrity dashboard to ensure on-chain health remains above 80%.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Price Strength (INR)
          </CardTitle>
          <CardDescription>Daily close price trend in rupees</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-72" config={integrityConfig}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${(value / 100000).toFixed(1)}L`} tickLine={false} axisLine={false} width={52} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="price" stroke="var(--chart-2)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Network Integrity
            </CardTitle>
            <CardDescription>Hash rate, node distribution, and liquidity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last refreshed</span>
              <span>{holdings.formattedIntegrityCheck}</span>
            </div>
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-primary/15 bg-primary/5 p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{metric.label}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{metric.value} {metric.unit}</span>
                    <span className={cn('font-medium', metric.change >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}
                    </span>
                  </div>
                </div>
                <Progress value={metric.value} className="mt-2 h-2" />
              </div>
            ))}
            <Button
              className="w-full"
              variant="outline"
              onClick={handleRefreshMetrics}
              disabled={isRefreshingMetrics}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshingMetrics && 'animate-spin')} />
              {isRefreshingMetrics ? 'Refreshing...' : 'Refresh integrity metrics'}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Risk Signals
            </CardTitle>
            <CardDescription>Monitoring external risk factors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer
              className="h-64"
              config={{ risk: { label: 'Risk Score', color: 'var(--chart-4)' } }}
            >
              <ResponsiveContainer>
                <ScatterChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="score"
                    name="Score"
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: number) => `${value}%`} />
                  <Scatter dataKey="score" fill="var(--chart-4)" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="space-y-2">
              {riskData.map((signal) => (
                <div key={signal.name} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 p-3 text-sm">
                  <div>
                    <p className="font-medium">{signal.name}</p>
                    <p className="text-xs text-muted-foreground">Recommendation: {signal.recommendation}</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {signal.score}%
                  </Badge>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => handleSelectStrategy('rebalance')}
              >
                Simulate rebalance
              </Button>
              <Button
                className="flex-1"
                variant="ghost"
                onClick={handleDownloadReport}
                disabled={isDownloadingReport}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                {isDownloadingReport ? 'Preparing report…' : 'Download risk report'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Bitcoin Wallets
            </CardTitle>
            <CardDescription>Custody footprint across holdings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">{wallets.length} active</div>
              <div className="text-right">
                <p className="font-semibold">{totalWalletBalance.toFixed(4)} BTC</p>
                <p className="text-xs text-muted-foreground">≈ {totalWalletValue}</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Custodian</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{wallet.name}</span>
                          <span className="text-xs text-muted-foreground">{wallet.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>{wallet.type}</TableCell>
                      <TableCell>{wallet.custodian || '—'}</TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p>{wallet.formattedBalanceBtc}</p>
                          <p className="text-xs text-muted-foreground">{wallet.formattedBalanceInr}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button className="w-full" variant="outline" onClick={() => {
              setWalletForm({
                name: '',
                type: walletTypeOptions[0],
                custodian: '',
                address: '',
                balanceBtc: '',
              })
              setIsWalletDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add wallet
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add bitcoin wallet</DialogTitle>
            <DialogDescription>Register a custody location to monitor balances in INR.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Name</Label>
                <Input
                  id="wallet-name"
                  placeholder="e.g. Cold Storage Vault"
                  value={walletForm.name}
                  onChange={(event) => setWalletForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={walletForm.type}
                  onValueChange={(value) => setWalletForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wallet-custodian">Custodian</Label>
                <Input
                  id="wallet-custodian"
                  placeholder="e.g. Ledger Nano X"
                  value={walletForm.custodian}
                  onChange={(event) => setWalletForm((prev) => ({ ...prev, custodian: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-balance">Balance (BTC)</Label>
                <Input
                  id="wallet-balance"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={walletForm.balanceBtc}
                  onChange={(event) => setWalletForm((prev) => ({ ...prev, balanceBtc: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Address or identifier</Label>
              <Input
                id="wallet-address"
                placeholder="bc1q..."
                value={walletForm.address}
                onChange={(event) => setWalletForm((prev) => ({ ...prev, address: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWalletDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWalletSubmit}>Add wallet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
