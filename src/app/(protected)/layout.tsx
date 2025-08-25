// src/app/(protected)/layout.tsx

import { GlobalSessionChecker } from "@/features/auth/components/global-session-checker";
import { SessionProviderWrapper } from "@/features/auth/components/session-provider-wrapper";

const ProctectedLayout = async ({children,}: {children: React.ReactNode;}) => {
  return (
    <SessionProviderWrapper>
      <div>
        <GlobalSessionChecker/>
        {children}
      </div>
    </SessionProviderWrapper>
  )
}

export default ProctectedLayout