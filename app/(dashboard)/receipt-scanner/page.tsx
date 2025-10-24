'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, ReceiptText, FileImage, AlertCircle, Loader2, RefreshCw, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useExpenseContext } from '@/contexts/ExpenseContext'

interface ReceiptItem {
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface ReceiptData {
  merchant_name: string
  date: string
  time: string
  total_amount: number
  currency: string
  tax_amount: number
  items: ReceiptItem[]
  payment_method: string
  receipt_number: string
  category: string
}

export default function ReceiptScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReceiptData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)
  const [addingToExpenses, setAddingToExpenses] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [transactionStatus, setTransactionStatus] = useState<'Cleared' | 'Pending'>('Cleared')

  const { addTransaction } = useExpenseContext()

  // Available account options
  const accountOptions = [
    'HDFC Bank Savings',
    'Axis Atlas Credit',
    'ICICI Coral Credit',
    'UPI',
    'Cash',
    'Other'
  ]

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError(null)
      setRawResponse(null)
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
    }
  }

  const handleScan = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)
    setRawResponse(null)

    try {
      console.log('Starting receipt scan for file:', file.name, file.size, file.type)
      
      const formData = new FormData()
      formData.append('file', file)

      console.log('Sending request to API...')
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        body: formData,
      })

      console.log('API response status:', response.status, response.statusText)
      const data = await response.json()
      console.log('API response data:', data)

      if (!response.ok) {
        console.error('API error:', data)
        throw new Error(data.error || 'Failed to scan receipt')
      }

      if (data.error) {
        console.error('Processing error:', data.error)
        setError(data.error)
        if (data.raw_response) {
          console.log('Raw response:', data.raw_response)
          setRawResponse(data.raw_response)
        }
        if (data.details) {
          console.error('Error details:', data.details)
        }
      } else {
        console.log('Receipt scanned successfully:', data)
        setResult(data)
        toast.success('Receipt scanned successfully')
      }
    } catch (err) {
      console.error('Client error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan receipt'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: 'bg-orange-100 text-orange-800',
      groceries: 'bg-green-100 text-green-800',
      transport: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      shopping: 'bg-pink-100 text-pink-800',
      healthcare: 'bg-red-100 text-red-800',
      utilities: 'bg-yellow-100 text-yellow-800',
    }
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const handleAddToExpenses = async () => {
    if (!result || !selectedAccount) {
      toast.error('Please select an account')
      return
    }

    setAddingToExpenses(true)

    try {
      console.log('Adding transaction to expenses:', {
        date: result.date,
        account: selectedAccount,
        category: result.category,
        amount: result.total_amount,
        status: transactionStatus,
        notes: `Receipt from ${result.merchant_name}${result.receipt_number ? ` (${result.receipt_number})` : ''}`
      })

      // Call the API endpoint
      const response = await fetch('/api/add-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: result.date,
          account: selectedAccount,
          category: result.category,
          type: 'Expense',
          amount: result.total_amount,
          status: transactionStatus,
          notes: `Receipt from ${result.merchant_name}${result.receipt_number ? ` (${result.receipt_number})` : ''}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add transaction')
      }

      // Add to local state using the hook
      const newTransaction = {
        date: result.date,
        account: selectedAccount,
        category: result.category,
        type: 'Expense' as const,
        amount: result.total_amount,
        status: transactionStatus,
        notes: `Receipt from ${result.merchant_name}${result.receipt_number ? ` (${result.receipt_number})` : ''}`,
      }
      
      console.log('Adding transaction to local state:', newTransaction)
      addTransaction(newTransaction)

      console.log('Transaction added successfully:', data.transaction)
      toast.success('Expense added to your transactions!')
      setShowAddDialog(false)
      setSelectedAccount('')
      setTransactionStatus('Cleared')
    } catch (error) {
      console.error('Error adding transaction:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add transaction'
      toast.error(errorMessage)
    } finally {
      setAddingToExpenses(false)
    }
  }

  const handleOpenAddDialog = () => {
    if (!result) return
    setSelectedAccount(accountOptions[0]) // Default to first account
    setShowAddDialog(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Receipt Scanner</h1>
        <p className="text-muted-foreground">
          Upload receipt images and extract expense data automatically using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Receipt
            </CardTitle>
            <CardDescription>
              Select an image of your receipt to scan and extract data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt-upload">Choose Image</Label>
              <Input
                id="receipt-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WebP formats
              </p>
            </div>

            {preview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="max-w-full h-auto max-h-64 mx-auto rounded"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleScan}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning Receipt...
                </>
              ) : (
                <>
                  <ReceiptText className="mr-2 h-4 w-4" />
                  Scan Receipt
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Extracted Data
            </CardTitle>
            <CardDescription>
              AI-extracted information from your receipt
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Merchant</Label>
                    <p className="font-medium">{result.merchant_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">{result.date || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Time</Label>
                    <p className="font-medium">{result.time || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-semibold text-lg text-primary">
                      {formatCurrency(result.total_amount, result.currency)}
                    </p>
                  </div>
                  {result.tax_amount && (
                    <div>
                      <Label className="text-muted-foreground">Tax</Label>
                      <p className="font-medium">
                        {formatCurrency(result.tax_amount, result.currency)}
                      </p>
                    </div>
                  )}
                  {result.payment_method && (
                    <div>
                      <Label className="text-muted-foreground">Payment Method</Label>
                      <p className="font-medium">{result.payment_method}</p>
                    </div>
                  )}
                  {result.receipt_number && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Receipt Number</Label>
                      <p className="font-medium font-mono">{result.receipt_number}</p>
                    </div>
                  )}
                  {result.category && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Category</Label>
                      <div className="mt-1">
                        <Badge className={getCategoryColor(result.category)}>
                          {result.category}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {result.items && result.items.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Items</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unit_price, result.currency)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.total_price, result.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <ReceiptText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload and scan a receipt to see extracted data here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Save this receipt data to your expense tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenAddDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Save to Transactions
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add to Expenses</DialogTitle>
                    <DialogDescription>
                      Configure the transaction details before adding to your expenses.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-select">Account</Label>
                      <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an account" />
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
                      <Label htmlFor="status-select">Status</Label>
                      <Select value={transactionStatus} onValueChange={(value: 'Cleared' | 'Pending') => setTransactionStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cleared">Cleared</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Transaction Summary</Label>
                      <div className="p-3 bg-muted rounded-md text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-muted-foreground">Merchant:</span>
                          <span className="font-medium">{result.merchant_name}</span>
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{result.date}</span>
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold text-primary">
                            {formatCurrency(result.total_amount, result.currency)}
                          </span>
                          <span className="text-muted-foreground">Category:</span>
                          <Badge className={getCategoryColor(result.category)}>
                            {result.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleAddToExpenses}
                      disabled={addingToExpenses || !selectedAccount}
                    >
                      {addingToExpenses ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Add to Expenses
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const dataStr = JSON.stringify(result, null, 2)
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
                  const exportFileDefaultName = `receipt-${result.merchant_name}-${result.date}.json`
                  const linkElement = document.createElement('a')
                  linkElement.setAttribute('href', dataUri)
                  linkElement.setAttribute('download', exportFileDefaultName)
                  linkElement.click()
                  toast.success('JSON exported successfully')
                }}
              >
                Export as JSON
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const csvContent = [
                    ['Field', 'Value'],
                    ['Merchant', result.merchant_name],
                    ['Date', result.date],
                    ['Time', result.time],
                    ['Total Amount', result.total_amount],
                    ['Currency', result.currency],
                    ['Tax Amount', result.tax_amount],
                    ['Payment Method', result.payment_method],
                    ['Receipt Number', result.receipt_number],
                    ['Category', result.category],
                    ...result.items.map((item, index) => 
                      index === 0 
                        ? ['Items', `${item.name} (${item.quantity}x ${formatCurrency(item.unit_price, result.currency)})`]
                        : ['', `${item.name} (${item.quantity}x ${formatCurrency(item.unit_price, result.currency)})`]
                    )
                  ]
                    .map(row => row.map(field => `"${field}"`).join(','))
                    .join('\n')
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                  const link = document.createElement('a')
                  const url = URL.createObjectURL(blob)
                  link.setAttribute('href', url)
                  link.setAttribute('download', `receipt-${result.merchant_name}-${result.date}.csv`)
                  link.style.visibility = 'hidden'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  toast.success('CSV exported successfully')
                }}
              >
                Export as CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}