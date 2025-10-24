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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatINR } from '@/lib/utils'
import { useExpenseContext } from '@/contexts/ExpenseContext'
import { useBitcoinData } from '@/hooks/useBitcoinData'
import { ArrowUpRight, ArrowDownRight, Bitcoin } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts'

const categoryColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  '#c08b28',
  '#f5c16f',
  '#f7d89c',
]

export default function DashboardView() {
  const { summary, monthlyTrend, categoryBreakdown, recentTransactions, insights } = useExpenseContext()
  const { holdings, history, riskSignals } = useBitcoinData()

  const latest = monthlyTrend[monthlyTrend.length - 1]
  const previous = monthlyTrend[monthlyTrend.length - 2]
  const incomeDeltaPercent = previous ? ((latest.income - previous.income) / previous.income) * 100 : 0
  const expenseDeltaPercent = previous ? ((latest.expenses - previous.expenses) / previous.expenses) * 100 : 0

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">
              {summary.formatted.income}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              <span>{incomeDeltaPercent >= 0 ? '+' : ''}{incomeDeltaPercent.toFixed(1)}% vs last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spend</CardDescription>
            <CardTitle className="text-3xl text-rose-500">
              {summary.formatted.expenses}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
              <span>{expenseDeltaPercent >= 0 ? '+' : ''}{expenseDeltaPercent.toFixed(1)}% vs last month</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Top category {insights.topCategory?.name ?? 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Cashflow</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {summary.formatted.netCashflow}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <span>Savings rate {(summary.savingsRate * 100).toFixed(1)}%</span>
            <p className="mt-1 text-xs text-muted-foreground">Emergency fund {formatINR(insights.emergencyFund)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bitcoin Holdings</CardDescription>
            <CardTitle className="text-3xl text-amber-600">
              {holdings.formattedValue}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <span>{holdings.coinsHeld} BTC • {holdings.formattedGain} realised gain</span>
            <p className="mt-1 text-xs text-muted-foreground">Portfolio allocation {(holdings.allocationPercent * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly cashflow trend in INR</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer
              className="h-80"
              config={{
                income: { label: 'Income', color: 'var(--chart-1)' },
                expenses: { label: 'Expenses', color: 'var(--chart-3)' },
              }}
            >
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="income" stroke="var(--chart-1)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="var(--chart-3)" strokeWidth={3} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <CardDescription>Top outflows by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Tooltip
                  formatter={(value: number, name: string) => [formatINR(value), name]}
                />
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={index} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid gap-2">
              {categoryBreakdown.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">{formatINR(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest inflows and outflows</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.id}</TableCell>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell>
                      <Badge variant={txn.type === 'Income' ? 'outline' : 'secondary'} className={txn.type === 'Income' ? 'border-emerald-600 text-emerald-700' : 'bg-primary/15 text-primary'}>
                        {txn.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{txn.account}</TableCell>
                    <TableCell className={`text-right font-semibold ${txn.type === 'Income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {formatINR(txn.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" asChild>
                <a href="/transactions">View all transactions</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-primary" />
              Bitcoin Integrity
            </CardTitle>
            <CardDescription>Network and risk signals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-lg font-semibold">{holdings.formattedPrice}</p>
            </div>
            {riskSignals.map((signal) => (
              <div key={signal.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{signal.name}</span>
                  <span className="text-muted-foreground">{signal.score}%</span>
                </div>
                <Progress value={signal.score} className="h-2" />
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <a href="/bitcoin">Go to integrity view</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bitcoin Performance</CardTitle>
          <CardDescription>Price trend against INR</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-72"
            config={{ price: { label: 'BTC Price', color: 'var(--chart-2)' } }}
          >
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${(value / 100000).toFixed(1)}L`} tickLine={false} axisLine={false} width={52} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="price" radius={[8, 8, 0, 0]} fill="var(--chart-2)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
