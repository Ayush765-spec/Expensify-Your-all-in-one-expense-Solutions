'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThemeSwitcherBtn() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative h-9 w-9"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Sun
        className={`h-5 w-5 text-primary transition-all ${
          isDark ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 text-primary transition-all ${
          isDark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      />
      <span className="sr-only">Toggle theme</span>
      {!mounted && (
        <span className="absolute inset-0" />
      )}
    </Button>
  )
}
