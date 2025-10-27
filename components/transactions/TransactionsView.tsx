'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatINR } from '@/lib/utils'
import { useExpenseContext } from '@/contexts/ExpenseContext'
import {
  Calendar,
  Filter,
  RefreshCw,
  IndianRupee,
  Plus,
  MoreHorizontal,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import type { Transaction } from '@/lib/data/transactions'

const statusOptions: Transaction['status'][] = ['Cleared', 'Pending']
const typeOptions: Transaction['type'][] = ['Income', 'Expense']

type FormState = {
  date: string
  account: string
  category: string
  type: Transaction['type']
  amount: string
  status: Transaction['status']
  notes: string
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

const blankForm: FormState = {
  date: getToday(),
  account: '',
  category: '',
  type: 'Expense',
  amount: '',
  status: 'Cleared',
  notes: '',
}

export default function TransactionsView() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loading, error } = useExpenseContext()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formState, setFormState] = useState<FormState>(blankForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)

  const categoryOptions = useMemo(() => {
    const unique = new Set(transactions.map((txn) => txn.category))
    return ['All', ...Array.from(unique)]
  }, [transactions])

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch = `${txn.id} ${txn.account} ${txn.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesCategory = category === 'All' || txn.category === category
      return matchesSearch && matchesCategory
    })
  }, [transactions, search, category])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, txn) => {
        if (txn.type === 'Income') {
          acc.income += txn.amount
        } else {
          acc.expense += txn.amount
        }
        return acc
      },
      { income: 0, expense: 0 }
    )
  }, [filtered])

  const incomeCount = useMemo(() => filtered.filter((txn) => txn.type === 'Income').length, [filtered])
  const expenseCount = useMemo(() => filtered.filter((txn) => txn.type === 'Expense').length, [filtered])

  const transactionCategories = useMemo(() => Array.from(new Set(transactions.map((txn) => txn.category))), [transactions])

  const handleOpenCreate = useCallback(() => {
    setFormState(blankForm)
    setEditingId(null)
    setIsDialogOpen(true)
  }, [])

  const handleEdit = useCallback((txn: Transaction) => {
    setFormState({
      date: txn.date,
      account: txn.account,
      category: txn.category,
      type: txn.type,
      amount: txn.amount.toString(),
      status: txn.status,
      notes: txn.notes ?? '',
    })
    setEditingId(txn.id)
    setIsDialogOpen(true)
  }, [])

  const handleSubmit = useCallback(() => {
    const amountValue = Number(formState.amount)
    if (!formState.account || !formState.category || Number.isNaN(amountValue) || amountValue <= 0) {
      return
    }
    const payload = {
      date: formState.date,
      account: formState.account,
      category: formState.category,
      type: formState.type,
      amount: amountValue,
      status: formState.status,
      notes: formState.notes.trim() ? formState.notes.trim() : undefined,
    }
    if (editingId) {
      updateTransaction(editingId, payload)
    } else {
      addTransaction(payload)
    }
    setIsDialogOpen(false)
    setFormState(blankForm)
    setEditingId(null)
  }, [formState, editingId, addTransaction, updateTransaction])

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      deleteTransaction(deleteTarget.id)
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleteTransaction])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="h-6 w-48 bg-muted animate-pulse rounded mx-auto mb-2"></div>
              <div className="h-4 w-32 bg-muted animate-pulse rounded mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Failed to load transactions</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Records</CardDescription>
            <CardTitle className="text-3xl">{filtered.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Showing filtered transactions
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{formatINR(totals.income)}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Across {incomeCount} entries
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expense</CardDescription>
            <CardTitle className="text-2xl text-rose-500">{formatINR(totals.expense)}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Across {expenseCount} entries
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-3">
            <span>Filters</span>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>October 2025 snapshot</span>
            </div>
          </CardTitle>
          <CardDescription>Search, refine, and analyse your INR transactions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-md items-center gap-2">
            <Input
              placeholder="Search by id, account, or category"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="button" variant="outline" onClick={() => setSearch('')}>
              <RefreshCw className="mr-2 h-4 w-4" />Reset
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((option) => (
              <Button
                key={option}
                type="button"
                variant={category === option ? 'default' : 'ghost'}
                className={category === option ? 'bg-primary text-primary-foreground' : ''}
                onClick={() => setCategory(option)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                Transaction Ledger
              </CardTitle>
              <CardDescription>All amounts in Indian Rupees</CardDescription>
            </div>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.id}</TableCell>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={txn.type === 'Income' ? 'outline' : 'secondary'}
                        className={txn.type === 'Income' ? 'border-emerald-600 text-emerald-700' : 'bg-primary/15 text-primary'}
                      >
                        {txn.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{txn.account}</TableCell>
                    <TableCell>
                      <Badge variant={txn.status === 'Cleared' ? 'secondary' : 'outline'}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${txn.type === 'Income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {formatINR(txn.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(txn)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(txn)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit transaction' : 'Add transaction'}</DialogTitle>
            <DialogDescription>Capture inflows or outflows in your INR ledger.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="txn-date">Date</Label>
                <Input
                  id="txn-date"
                  type="date"
                  value={formState.date}
                  onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txn-amount">Amount (₹)</Label>
                <Input
                  id="txn-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.amount}
                  onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txn-account">Account</Label>
                <Input
                  id="txn-account"
                  placeholder="e.g. HDFC Bank Savings"
                  value={formState.account}
                  onChange={(event) => setFormState((prev) => ({ ...prev, account: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txn-category">Category</Label>
                <Input
                  id="txn-category"
                  placeholder="e.g. Utilities"
                  list="category-suggestions"
                  value={formState.category}
                  onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                />
                <datalist id="category-suggestions">
                  {transactionCategories.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, type: value as Transaction['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value as Transaction['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="txn-notes">Notes</Label>
              <Textarea
                id="txn-notes"
                placeholder="Add context or references"
                value={formState.notes}
                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingId ? 'Save changes' : 'Add transaction'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove {deleteTarget?.id}. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
