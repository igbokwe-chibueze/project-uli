// src/components/dynamic-theme-provider.tsx

'use client'

import { UseOrganisationTheme } from '@/features/organisations/hooks/use-organisation-theme'
import { ReactNode } from 'react'

interface DynamicThemeProviderProps {
  children: ReactNode
}

/**
 * A client component that applies the organisation's color scheme theme
 * to all descendant pages/components.
 * This is different from theme-provider that is basically used for light and dark mode toggel.
 */
export const DynamicThemeProvider = ({ children }: DynamicThemeProviderProps) => {
  const { color, loading } = UseOrganisationTheme()

  // Fallback while loading
  const themeClass = loading ? 'theme-velvet' : color

  return <div className={themeClass}>{children}</div>
}

