// src/features/user/components/active-sessions.tsx

import { buttonVariants } from "@/components/ui/button"
import { GlobalLogoutButton } from "@/features/auth/components/global-logout-button"
import { cn } from "@/lib/utils"
import { LogOutIcon } from "lucide-react"

export const ActiveSessions = () => {
  return (
    <div className="lg:w-[900px] space-y-6">
        <p>A table of active sessions would be here</p>

        <GlobalLogoutButton>
            <div className={cn(buttonVariants({ variant: "default", size: "default" }))}>
                <LogOutIcon className="size-4 mr-2"/>
                Logout all active sessions
            </div>
        </GlobalLogoutButton>
    </div>
  )
}
