// src/features/user/components/user-sidebar.tsx

"use client"

import { NavMain, NavRoute } from "@/components/nav-main";

import {
  Sidebar,
  SidebarContent,
  //SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const userNavRoutes: NavRoute[] = [
  {
    title: "My Profile",
    segment: "",
    isActive: true,
    items: [
      { title: "Profile", url: "/profile" },
      { title: "Details", url: "/details" },
    ],
  },
  {
    title: "Settings",
    segment: "/settings",
    items: [
      { title: "Profile", url: "/profile" },
      { title: "Security", url: "/security" },
      { title: "Preference", url: "/preference" },
    ],
  },
];


export const UserSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar variant="floating" collapsible="offcanvas" {...props}>
        <SidebarHeader>
          User Account Switcher
        </SidebarHeader>

        <SidebarContent>
          <NavMain label="User" basePath="/user" routes={userNavRoutes} />
        </SidebarContent>

        <SidebarRail />
    </Sidebar>
  )
}
