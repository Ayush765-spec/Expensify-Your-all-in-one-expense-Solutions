'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatINR } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react'
import { useExpenseContext } from '@/contexts/ExpenseContext'

export default function SidebarQuickStats() {
  const { summary, insights } = useExpenseContext()

  return (
    <div className="grid gap-3">
      <Card className="bg-secondary/70 border border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm text-muted-foreground">
            Net Cashflow
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-primary">
            {summary.formatted.netCashflow}
          </p>
          <p className="text-muted-foreground text-xs">
            Savings rate {(summary.savingsRate * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>
      <Card className="border border-emerald-500/40 bg-emerald-500/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            Monthly Income
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{summary.formatted.income}</p>
        </CardContent>
      </Card>
      <Card className="border border-rose-500/40 bg-rose-500/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            Monthly Spend
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{summary.formatted.expenses}</p>
          <p className="text-muted-foreground text-xs">
            Top outflow {insights.topCategory?.name}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
