export type Transaction = {
  id: string
  date: string
  account: string
  category: string
  type: "Income" | "Expense"
  amount: number
  status: "Cleared" | "Pending"
  notes?: string
}

export const transactions: Transaction[] = [
  {
    id: "TXN-1045",
    date: "2025-10-02",
    account: "HDFC Bank Savings",
    category: "Salary",
    type: "Income",
    amount: 185000,
    status: "Cleared",
  },
  {
    id: "TXN-1044",
    date: "2025-10-01",
    account: "Axis Atlas Credit",
    category: "Travel",
    type: "Expense",
    amount: 23850,
    status: "Cleared",
    notes: "Flight bookings for client meeting",
  },
  {
    id: "TXN-1043",
    date: "2025-09-29",
    account: "HDFC Bank Savings",
    category: "Investments",
    type: "Expense",
    amount: 52000,
    status: "Cleared",
    notes: "SIP allocations across equity funds",
  },
  {
    id: "TXN-1042",
    date: "2025-09-28",
    account: "ICICI Coral Credit",
    category: "Dining",
    type: "Expense",
    amount: 6425,
    status: "Cleared",
  },
  {
    id: "TXN-1041",
    date: "2025-09-27",
    account: "HDFC Bank Savings",
    category: "Utilities",
    type: "Expense",
    amount: 8890,
    status: "Cleared",
  },
  {
    id: "TXN-1040",
    date: "2025-09-26",
    account: "UPI",
    category: "Groceries",
    type: "Expense",
    amount: 5310,
    status: "Cleared",
  },
  {
    id: "TXN-1039",
    date: "2025-09-25",
    account: "UPI",
    category: "Subscriptions",
    type: "Expense",
    amount: 2499,
    status: "Cleared",
    notes: "Annual SaaS subscription",
  },
  {
    id: "TXN-1038",
    date: "2025-09-24",
    account: "Axis Atlas Credit",
    category: "Fuel",
    type: "Expense",
    amount: 3420,
    status: "Cleared",
  },
  {
    id: "TXN-1037",
    date: "2025-09-23",
    account: "HDFC Bank Savings",
    category: "Income",
    type: "Income",
    amount: 6200,
    status: "Cleared",
    notes: "Freelance consulting retainer",
  },
  {
    id: "TXN-1036",
    date: "2025-09-20",
    account: "ICICI Coral Credit",
    category: "Shopping",
    type: "Expense",
    amount: 15680,
    status: "Pending",
    notes: "Festival gifting and decor",
  },
]

export const monthlyExpenseTrend = [
  { month: "Apr", expenses: 98200, income: 215000 },
  { month: "May", expenses: 102450, income: 214500 },
  { month: "Jun", expenses: 96850, income: 214800 },
  { month: "Jul", expenses: 110200, income: 217200 },
  { month: "Aug", expenses: 105640, income: 216500 },
  { month: "Sep", expenses: 114980, income: 219800 },
  { month: "Oct", expenses: 26820, income: 185000 },
]

export const categorySplit = [
  { name: "Investments", value: 52000 },
  { name: "Travel", value: 23850 },
  { name: "Groceries", value: 5310 },
  { name: "Dining", value: 6425 },
  { name: "Utilities", value: 8890 },
  { name: "Fuel", value: 3420 },
  { name: "Shopping", value: 15680 },
  { name: "Subscriptions", value: 2499 },
]

export const cashflowInsights = {
  emergencyFund: 485000,
  taxableInvestments: 1125000,
  insuranceCoverage: 6500000,
  creditUtilisation: 0.27,
  savingsRate: 0.41,
}
