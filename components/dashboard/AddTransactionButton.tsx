'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useExpenseContext } from '@/contexts/ExpenseContext'

export function AddTransactionButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'Expense' as 'Income' | 'Expense',
    amount: '',
    category: '',
    account: '',
    description: '',
    status: 'Cleared' as 'Cleared' | 'Pending'
  })

  const { addTransaction } = useExpenseContext()

  const accountOptions = [
    'Primary Savings',
    'Credit Card',
    'Checking Account',
    'Cash',
    'Other'
  ]

  const categoryOptions = [
    // Income categories
    'Salary', 'Freelance', 'Investment', 'Business', 'Other Income',
    // Expense categories
    'Food', 'Groceries', 'Transport', 'Entertainment', 'Shopping', 
    'Healthcare', 'Utilities', 'Travel', 'Subscriptions', 'Education'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category || !formData.account) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const transaction = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        account: formData.account,
        date: new Date().toISOString().split('T')[0], // Today's date
        description: formData.description || `${formData.type} transaction`,
        status: formData.status
      }

      console.log('Adding transaction:', transaction)
      await addTransaction(transaction)
      
      toast.success(`${formData.type} added successfully!`)
      setOpen(false)
      
      // Reset form
      setFormData({
        type: 'Expense',
        amount: '',
        category: '',
        account: '',
        description: '',
        status: 'Cleared'
      })
    } catch (error) {
      console.error('Error adding transaction:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add transaction'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Add a new income or expense transaction to your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'Income' | 'Expense' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select 
              value={formData.account} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, account: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accountOptions.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'Cleared' | 'Pending' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cleared">Cleared</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}