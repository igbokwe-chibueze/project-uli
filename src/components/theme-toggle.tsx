// src/components/theme-toggle.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

export const ThemeToggle = () => {
    const { setTheme, theme } = useTheme()
  return (
    <>
        <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <SunIcon className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    </>
  )
}
