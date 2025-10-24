'use client'

import { ReactNode } from 'react'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { PiggyBank, TrendingUp, Wallet, Bitcoin, Settings, ReceiptText } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: TrendingUp,
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: Wallet,
  },
  {
    label: 'Receipt Scanner',
    href: '/receipt-scanner',
    icon: ReceiptText,
  },
  {
    label: 'Bitcoin Integrity',
    href: '/bitcoin',
    icon: Bitcoin,
  },
  {
    label: 'Manage',
    href: '/manage',
    icon: Settings,
  },
]

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar className="bg-sidebar/95 border-sidebar-border/60 backdrop-blur">
        <SidebarHeader>
          <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-2">
            <PiggyBank className="h-8 w-8 text-primary" strokeWidth={1.5} />
            <div>
              <p className="text-lg font-semibold tracking-tight">Expensify</p>
              <p className="text-muted-foreground text-xs">Master your money in INR</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarTrigger className="w-full justify-center" />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background/60">
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
