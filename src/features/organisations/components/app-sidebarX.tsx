// src/features/organisations/components/app-sidebarX.tsx
"use client"

import { NavMainX } from "./nav-mainX"
import { NavProjectsX } from "./nav-projectsX"
import { NavUserX } from "./nav-userX"
import { TeamSwitcherX } from "./team-switcherX"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavSecondaryX } from "./nav-secondaryX"

import { sidebarData as data } from "@/lib/sidebar-data"

export function AppSidebarX({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcherX teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMainX items={data.navMain} />
        <NavProjectsX projects={data.projects} />
        <NavSecondaryX items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUserX user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
