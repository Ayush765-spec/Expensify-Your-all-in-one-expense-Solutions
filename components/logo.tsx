'use client'

import React from 'react'
import { PiggyBank } from 'lucide-react'

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <PiggyBank 
        className="h-11 w-11 text-amber-500"
        strokeWidth={1.5} 
      />
      <p className="text-3xl font-bold text-amber-500">
        Expensify
      </p>
    </a>
  )
}

export default Logo

