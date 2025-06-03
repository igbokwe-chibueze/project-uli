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
import { useUserOrganizations } from "../hooks/use-user-organisations"
import { NavMain } from "./nav-main"
import { NavMainX } from "./nav-mainX"

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { organizations, loading, error } = useUserOrganizations();
  return (
    <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <OrganisationSwitcher
            organizations={organizations}
            loading={loading}
            error={error}
          />
        </SidebarHeader>

        <SidebarContent>
          <NavMain/>
          <NavMainX items={data.navMain} />
        </SidebarContent>

        <SidebarFooter>
          {/* <NavUserX user={data.user} /> */}
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
  )
}
