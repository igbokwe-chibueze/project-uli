// src/components/navigation/navbar.tsx
"use client";

import Link from "next/link"
import { ShieldBanIcon } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { NavLinks } from "@/components/navigation/nav-links";
import LoginButton from "@/features/auth/components/login-button";

export default function Navbar() {

  return (
    <nav className="fixed top-0 right-0 left-0 z-30 px-4 lg:px-6 py-2.5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-wrap justify-between items-center max-w-screen-xl mx-auto">

        {/* Logo and Company Name */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-bold text-xl">
            <ShieldBanIcon className="size-12 sm:size-16 text-primary" />
            <span className="text-xl font-semibold self-center whitespace-nowrap">Project-Uli</span>
          </div>
        </Link>

        <div className="flex justify-center items-center space-x-3 lg:order-2">

          <div className="hidden md:flex space-x-3">
            {/* If you want the signIn button to open up the signup form as model instead of redirecting to the signIn page
            then do this instead <LoginButton mode="modal" asChild> */}
            <LoginButton asChild>
              <Button variant={"outline"} size={"lg"} className="buttons">
                Sign In
              </Button>
            </LoginButton>

            <Button asChild size={"lg"} className="buttons">
              <Link href={"/auth/registration"}>
                Register
              </Link>
            </Button>
          </div>

          <div className="flex justify-center items-center space-x-3">
            <ThemeToggle />

            <MobileMenu />
          </div>

        </div>

        {/* Links */}
        <div className="hidden lg:flex justify-between items-center w-full lg:w-auto lg:order-1">
          <NavLinks />
        </div>

      </div>
    </nav>
  )
}
