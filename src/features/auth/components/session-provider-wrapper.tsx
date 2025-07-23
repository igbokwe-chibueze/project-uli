// src/features/auth/components/session-provider-wrapper.tsx

'use client'

import { SessionProvider } from "next-auth/react"


export const SessionProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    // No manual fetch; <SessionProvider> will pull session from /api/auth/session on the client
    // SessionProvider makes the session available to client components and 
    // helpers (use-current-user.ts, use-current-user-id.ts and use-current-user-role.ts)
  return <SessionProvider >{children}</SessionProvider>
}
