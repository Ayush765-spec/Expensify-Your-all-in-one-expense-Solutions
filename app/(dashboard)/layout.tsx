'use client'

import Navbar from '@/components/Navbar'
import SidebarLayout from '@/components/layout/SidebarLayout'
import { ExpenseProvider } from '@/contexts/ExpenseContext'
import React, { ReactNode } from 'react'

function Layout({children}:{children:ReactNode}) {
  return (
    <ExpenseProvider>
      <SidebarLayout>
        <Navbar />
        <div className="flex-1 px-6 pb-12 pt-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </div>
      </SidebarLayout>
    </ExpenseProvider>
  )
}

export default Layout
