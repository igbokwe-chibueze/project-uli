// src/features/auth/components/global-session-checker.tsx
"use client"

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { logout } from "@/features/auth/actions/logout";

// GlobalSessionChecker monitors the session client-side.
// If password has changed, it logs the user out (only if middleware hasn't already caught it).
export const GlobalSessionChecker = () => {
    const { data: session } = useSession();
    const hasLoggedOut = useRef(false); // Prevents double-triggering logout

    useEffect(() => {
        if (session?.hasPasswordChanged && !hasLoggedOut.current) {
            hasLoggedOut.current = true; // mark logout in progress
            logout(); // this will redirect to login
        }
    }, [session]);

  return null;
}
