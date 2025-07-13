// src/features/organisations/components/nav-secondary.tsx

import * as React from "react"
import Link from "next/link";
import { HelpCircleIcon, SearchIcon, SettingsIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useOrganisation } from "@/features/organisations/context/organisation-context"


const items = [
  {
    title: "Marketplace",
    url: "/marketplace",
    icon: SettingsIcon,
  },
  {
    title: "Get Help",
    url: "/#",
    icon: HelpCircleIcon,
  },
  {
    title: "Search",
    url: "/#",
    icon: SearchIcon,
  },
]

export function NavSecondary({...props}) {  
  const organisation = useOrganisation();
  const organisationId = organisation.id

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild >
                <Link href={`/organisations/${organisationId}${item.url}`}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
