// src/features/organisations/components/site-headerX.tsx
"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BellIcon } from "lucide-react"

export function SiteHeaderX() {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center space-x-4">
          <h1 className="text-base font-medium">Search</h1>
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
    </header>
  )
}
