// src/app/(protected)/organisations/layout.tsx
"use client"
import { LogoutButton } from "@/features/auth/components/logout-button";
import { LogOutIcon } from "lucide-react";

// const OrgLayout = async ({children,}: {children: React.ReactNode;}) => {
const OrgLayout = ({children,}: {children: React.ReactNode;}) => {
  return (
    <div className="min-h-screen">
      <nav className="flex justify-between items-center">
        <LogoutButton>
          <LogOutIcon/>
          LogOut
        </LogoutButton>
      </nav>
      <div>
      {/* <div className="max-w-screen-xl mx-auto text-center px-4 lg:px-12 py-8 lg:py-16"> //use this in create page instead */}
        {children}
      </div>
    </div>
  )
}

export default OrgLayout