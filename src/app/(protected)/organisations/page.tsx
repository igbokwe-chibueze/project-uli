// src/app/(protected)/organisations/page.tsx
"use client"

import { LogoutButton } from "@/features/auth/components/logout-button"
import { LogOutIcon } from "lucide-react"


const OrganisationPage = () => {
  return (
    <div>
        OrganisationPage
        <LogoutButton>
          <div>
            <LogOutIcon className=" h-4 w-4 mr-2 text-gray-800"/>
            Logout
          </div>
        </LogoutButton>
    </div>
  )
}

export default OrganisationPage