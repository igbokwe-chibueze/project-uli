// src/features/user/components/user-sidebar.tsx

"use client"

import { NavMain, NavRoute } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
];

const secondaryRoutes = [
  {
    title: "Membership",
    url: "/membership",
  },
  {
    title: "Get Help",
    url: "/#",
  },
  {
    title: "Search",
    url: "/#",
  },
]


export const UserSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {

  // const basePath = `/organisations/${organisationId}`
  const basePath = `/user`
  
  return (
    <Sidebar variant="floating" collapsible="offcanvas" {...props}>
        <SidebarHeader>
          User Account Switcher
        </SidebarHeader>

        <SidebarContent>
          <NavMain label="User" basePath={basePath} routes={userNavRoutes} />
          <NavSecondary basePath={basePath} routes={secondaryRoutes} className = "mt-auto"/>
        </SidebarContent>

        <SidebarFooter>
          Logout UserName
        </SidebarFooter>

        <SidebarRail />
    </Sidebar>
  )
}
