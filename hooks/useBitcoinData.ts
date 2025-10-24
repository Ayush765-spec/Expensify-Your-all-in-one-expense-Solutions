'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  bitcoinHoldings,
  bitcoinPriceHistory,
  bitcoinIntegrityMetrics,
  riskSignals,
  hedgeStrategies,
  custodyChecklist,
  bitcoinWallets,
} from '@/lib/data/bitcoin'

import { formatINR } from '@/lib/utils'

type BitcoinWallet = (typeof bitcoinWallets)[number]

type WalletInput = Omit<BitcoinWallet, 'id'>

function createWalletId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `wallet-${crypto.randomUUID()}`
  }
  return `wallet-${Math.random().toString(36).slice(2, 10)}`
}

export function useBitcoinData() {
  const [wallets, setWallets] = useState(bitcoinWallets)

  const currentValue = bitcoinHoldings.coinsHeld * bitcoinHoldings.currentPriceInr

  const formattedWallets = useMemo(() => {
    return wallets.map((wallet) => ({
      ...wallet,
      formattedBalanceBtc: `${wallet.balanceBtc.toFixed(4)} BTC`,
      formattedBalanceInr: formatINR(wallet.balanceBtc * bitcoinHoldings.currentPriceInr),
    }))
  }, [wallets])

  const addWallet = useCallback((wallet: WalletInput) => {
    setWallets((prev) => [
      ...prev,
      {
        ...wallet,
        id: createWalletId(),
      },
    ])
  }, [])

  return {
    holdings: {
      ...bitcoinHoldings,
      currentValue,
      formattedValue: formatINR(currentValue),
      formattedPrice: formatINR(bitcoinHoldings.currentPriceInr),
      formattedGain: `${(bitcoinHoldings.realisedGainPercent * 100).toFixed(1)}%`,
      formattedIntegrityCheck: new Date(bitcoinHoldings.lastCheckedIntegrity).toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      }),
    },
    history: bitcoinPriceHistory,
    integrityMetrics: bitcoinIntegrityMetrics,
    riskSignals,
    hedgeStrategies,
    custodyChecklist,
    wallets: formattedWallets,
    addWallet,
  }
}
