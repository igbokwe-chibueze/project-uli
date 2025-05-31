// src/app/(protected)/layout.tsx

import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

const ProctectedLayout = async ({children,}: {children: React.ReactNode;}) => {
  // Retrieve the current session (user authentication state)
  const session = await auth();
  return (
    // SessionProvider makes the session available to client components (OrganisationSwitcher, ) and 
    // helpers (use-current-user.ts, use-current-user-id.ts and use-current-user-role.ts)
    <SessionProvider session={session}>
      <div>
        {children}
      </div>
    </SessionProvider>
  )
}

export default ProctectedLayout