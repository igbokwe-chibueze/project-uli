// src/features/organisations/components/organisation-header.tsx
"use client"

import Link from "next/link"
import { BellIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { ThemeToggle } from "@/components/theme-toggle"

import { SearchForm } from "@/features/organisations/components/search-form"
import { useOrganisation } from "@/features/organisations/context/organisation-context"
import { OrganisationAvatar } from "./organisation-avatar"


export const OrganisationHeader = () => {
    const org = useOrganisation();
    
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 flex h-16 shrink-0 items-center 
        gap-2 border-b transition-[width,height] ease-linear"
    >
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 py-4">
            <SidebarTrigger className="-ml-1" />

            <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-8"
            />

            <div className="flex justify-between items-center w-full">
                {/* Organisation Data */}

                <div className="flex items-center gap-2">
                    <OrganisationAvatar
                        orgName ={org.name}
                        logo={org.logo}
                    />

                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold text-foreground">{org?.name}</h1>

                        {org?.country ? (
                            <Badge variant="secondary" className="text-xs">
                                {/* Desktop: full name */}
                                <span className="hidden sm:inline">{org.country.name}</span>

                                {/* Mobile: only ISO3 */}
                                <span className="sm:hidden">{org.country.iso3}</span>
                            </Badge>
                        ) : (
                            <Badge asChild variant="secondary"
                                className="hidden sm:inline text-xs cursor-pointer"
                            >
                                <Link href={`/organisations/${org.id}/settings/general`}>Update your country</Link>
                            </Badge>
                        )}

                    </div>
                </div>

                
                <div className="flex items-center space-x-4">
                    <SearchForm className="w-full sm:ml-auto sm:w-auto" />

                    <ThemeToggle />

                    <Button variant={"outline"} size={"icon"} className="relative">
                        <BellIcon className="size-5"/>
                        <span
                            className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary
                            text-[10px] font-medium text-primary-foreground"
                        >
                            3
                        </span>
                    </Button>
                </div>
            </div>

        </div>
    </header>
  )
}
