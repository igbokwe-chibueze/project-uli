// src/features/organisations/components/organisation-header.tsx
"use client"

import { BellIcon } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { ThemeToggle } from "@/components/theme-toggle"

import { SearchForm } from "@/features/organisations/components/search-form"
import { useUserOrganizations } from "@/features/organisations/hooks/use-user-organisations"
import { UseGetOrganisationId } from "@/features/organisations/hooks/use-get-organisation-Id"


export const OrganisationHeader = () => {
    const { organizations, loading, error } = useUserOrganizations();
    const currentOrgId = UseGetOrganisationId();
    
    const org = organizations.find((o) => o.id === currentOrgId);
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 flex h-14 shrink-0 items-center 
        gap-2 border-b transition-[width,height] ease-linear"
    >
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />

            <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
            />

            <div className="flex justify-between items-center w-full">
                {/* Organisation Data */}
                <div>
                    {loading ? (
                        // ← show two skeleton bars while loading
                        <div className="flex items-center space-x-2">
                            <Skeleton className="size-12 rounded-full" />
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-8 w-28 rounded" />
                                <Skeleton className="h-8 w-18 rounded" />
                            </div>
                        </div>
                    ) : error ? (
                        // ← you can customize this error state however you like
                        <span className="text-destructive">Failed to load</span>
                    ) : (
                        // ← once loaded, show real org logo, name + country
                        //* TODO : Add Organisation Logo *****
                        <div className="flex items-center gap-2 text-sm leading-tight">
                            <span className="truncate font-semibold">{org?.name}</span>
                            {org?.country ? (
                                <span className="truncate">[{org?.country}]</span>
                            ) : (<span>(Update your country)</span>)}
                        </div>
                    )}
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
