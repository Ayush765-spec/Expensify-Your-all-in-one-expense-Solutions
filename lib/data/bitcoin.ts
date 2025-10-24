export const bitcoinHoldings = {
  currentPriceInr: 5390000,
  coinsHeld: 0.82,
  allocationPercent: 0.18,
  realisedGainPercent: 0.264,
  lastUpdated: "2025-10-02T08:30:00+05:30",
  lastCheckedIntegrity: "2025-10-02T07:30:00+05:30",
}

export const bitcoinPriceHistory = [
  { date: "Apr", price: 4820000 },
  { date: "May", price: 4965000 },
  { date: "Jun", price: 5128000 },
  { date: "Jul", price: 5215000 },
  { date: "Aug", price: 5332000 },
  { date: "Sep", price: 5487000 },
  { date: "Oct", price: 5390000 },
]

export const bitcoinIntegrityMetrics = [
  { label: "Hash Rate", value: 88, unit: "EH/s", change: 4 },
  { label: "Node Health", value: 92, unit: "Score", change: 2 },
  { label: "Liquidity", value: 76, unit: "Index", change: -3 },
  { label: "Volatility", value: 63, unit: "Index", change: -5 },
]

export const riskSignals = [
  { name: "On-chain activity", score: 82, recommendation: "Maintain" },
  { name: "Exchange reserves", score: 69, recommendation: "Monitor" },
  { name: "Derivatives", score: 58, recommendation: "Reduce" },
  { name: "Macro sentiment", score: 74, recommendation: "Maintain" },
]

export const hedgeStrategies = [
  {
    id: 'options-spread',
    label: 'Deploy Collar Hedge',
    description: 'Buy 3-month protective puts and sell covered calls to lock downside beyond ₹48L.',
    estimatedCost: 185000,
    effectiveness: 0.72,
  },
  {
    id: 'rebalance',
    label: 'Rebalance Allocation',
    description: 'Trim BTC allocation from 18% to 15% and redirect surplus to short-term debt funds.',
    estimatedCost: 0,
    effectiveness: 0.54,
  },
  {
    id: 'futures',
    label: 'Short CME Futures',
    description: 'Short 1 micro future contract to hedge 0.1 BTC for the next expiry cycle.',
    estimatedCost: 40000,
    effectiveness: 0.61,
  },
]

export const custodyChecklist = [
  { id: 'hardware-wallet', label: 'Hardware wallet firmware updated', completed: false },
  { id: 'multi-sig', label: 'Multi-sig recovery keys verified', completed: true },
  { id: 'disaster-plan', label: 'Disaster recovery plan tested this quarter', completed: false },
]

export const bitcoinWallets = [
  {
    id: 'wallet-cold',
    name: 'Cold Storage Vault',
    type: 'Hardware',
    custodian: 'Ledger Nano X',
    address: 'bc1q8n72hxs0coldvault0examplelx8f4',
    balanceBtc: 0.52,
  },
  {
    id: 'wallet-lightning',
    name: 'Lightning Ops',
    type: 'Lightning',
    custodian: 'Phoenix',
    address: 'lnbc1p0lightningnodeexampleap3',
    balanceBtc: 0.11,
  },
]
