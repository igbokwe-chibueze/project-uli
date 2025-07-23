// src/components/navigation/standalone-navbar.tsx
"use client"

import Link from "next/link";
import { ShieldBanIcon } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserDropdown } from "@/features/auth/components/user-dropdown";

export const StandaloneNavbar = () => {
  return (
    <nav className="fixed top-0 right-0 left-0 z-30 px-4 lg:px-6 py-2.5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-wrap justify-between items-center max-w-screen-2xl mx-auto">

            {/* Logo and Company Name */}
            <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <ShieldBanIcon className=" size-6 text-primary" />
                    <span className="text-xl font-semibold self-center whitespace-nowrap">Project-Uli</span>
                </div>
            </Link>

            <div className="flex justify-center items-center space-x-3">
                <ThemeToggle />

                <UserDropdown/>
            </div>
        </div>
    </nav>
  )
}
