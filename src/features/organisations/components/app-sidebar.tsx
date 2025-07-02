// src/features/organisations/components/app-sidebar.tsx

"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { OrganisationSwitcher } from "@/features/organisations/components/organisation-switcher"
import { useUserOrganizations } from "@/features/organisations/hooks/use-user-organisations"

import { NavMain } from "@/features/organisations/components/nav-main"
import { NavUser } from "@/features/organisations/components/nav-user"

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
        </SidebarContent>

        <SidebarFooter>
          <NavUser/>
        </SidebarFooter>

        <SidebarRail />
    </Sidebar>
  )
}
