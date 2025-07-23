// src/features/organisations/hooks/use-organisation-theme.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { GetOrganisationThemeAction } from '../actions/get-organisation-theme-action'


/**
 * Custom React hook for fetching the current org theme.
 *
 * Because your layout mounts exactly once, this hook will only fetch once per session
 * unless you explicitly call `refetch()`.
 */
export const UseOrganisationTheme = () => {
    const { organisationId } = useParams() as { organisationId: string }
    const [color, setColor] = useState('theme-velvet')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchColor = useCallback(async () => {
        if (!organisationId) return
            setLoading(true)
            setError(null)
        try {
            const theme = await GetOrganisationThemeAction(organisationId)
            setColor(theme)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'))
        } finally {
            setLoading(false)
        }
    }, [organisationId])

    useEffect(() => {
        fetchColor()
    }, [fetchColor])

  return { color, loading, error, refetch: fetchColor }
  
}
