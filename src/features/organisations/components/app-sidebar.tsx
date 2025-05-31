// src/features/organisations/components/app-sidebar.tsx

"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { OrganisationSwitcher } from "./organisation-switcher"
import { NavUserX } from "./nav-userX"

import { sidebarData as data } from "@/lib/sidebar-data"

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <OrganisationSwitcher/>
        </SidebarHeader>

        <SidebarFooter>
          <NavUserX user={data.user} />
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
  )
}
