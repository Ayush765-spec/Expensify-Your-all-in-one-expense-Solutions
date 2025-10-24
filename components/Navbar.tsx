"use client";

import React from 'react'
import Logo from '@/components/logo'
import ThemeSwitcherBtn from '@/components/ThemeSwitcherBtn'
import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function Navbar() {
  return (
    <>
      <DesktopNavbar />
    </>
  )
}

const items = [
  { label: "Dashboard", link: "/dashboard" },
  { label: "Transactions", link: "/transactions" },
  { label: "Bitcoin Integrity", link: "/bitcoin" },
  { label: "Manage", link: "/manage" }
];

function DesktopNavbar() {
  return (
    <div className="border-separate border-b bg-background/90 backdrop-blur">
      <nav className="container flex items-center justify-between px-8">
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <Logo />
          <div className="flex h-full">
            {items.map(item => (
              <NavbarItem
                key={item.label}
                link={item.link}
                label={item.label}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcherBtn />
          <UserButton afterSignOutUrl="/sign-in" appearance={{ baseTheme: 'dark' }} />
        </div>
      </nav>
    </div>
  )
}

function NavbarItem({ link, label }: {
  link: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === link || pathname.startsWith(`${link}/`);
  
  return (
    <Link
      href={link}
      className={`flex items-center px-4 hover:bg-accent hover:text-accent-foreground ${
        isActive ? 'border-b-2 border-primary' : ''
      }`}
    >
      {label}
    </Link>
  )
}

export default Navbar