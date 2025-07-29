// src/features/user/components/user-sidebar.tsx

"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UserNavMain } from "./user-nav-main"


export const UserSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar variant="floating" collapsible="offcanvas" {...props}>
        <SidebarHeader>
          User Account Switcher
        </SidebarHeader>

        <SidebarContent>
          <UserNavMain/>
        </SidebarContent>

        <SidebarRail />
    </Sidebar>
  )
}
