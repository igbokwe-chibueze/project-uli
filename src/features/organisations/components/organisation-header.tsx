// src/features/organisations/components/organisation-header.tsx
"use client"

import { BellIcon } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
//import { Skeleton } from "@/components/ui/skeleton"

import { SearchForm } from "@/features/organisations/components/search-form"
import { useOrganisation } from "@/features/organisations/context/organisation-context"
import { OrganisationAvatar } from "@/features/organisations/components/organisation-avatar"


export const OrganisationHeader = () => {
    const org = useOrganisation();
    
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 flex h-16 shrink-0 items-center 
        gap-2 border-b transition-[width,height] ease-linear"
    >
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />

            <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-6"
            />

            <div className="flex justify-between items-center w-full">
                {/* Organisation Data */}

                <div className="flex items-center gap-2">
                    <div className="flex aspect-square w-20 h-14 items-center justify-center rounded-lg">
                        <OrganisationAvatar
                            image={org.logo}
                            name={org.name}
                            className="size-20"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm leading-tight">
                        <span className="truncate font-semibold">{org?.name}</span>

                        {org?.country ? (
                            <span className="truncate">[{org?.country.name}]</span>
                        ) : (<span>(Update your country)</span>)}
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
