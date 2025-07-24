// src/app/(protected)/layout.tsx

import { SessionProviderWrapper } from "@/features/auth/components/session-provider-wrapper";

const ProctectedLayout = async ({children,}: {children: React.ReactNode;}) => {
  return (
    <SessionProviderWrapper>
      <div>
        {children}
      </div>
    </SessionProviderWrapper>
  )
}

export default ProctectedLayout