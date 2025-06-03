// src/features/organisations/components/nav-main.tsx

"use client"

import { Building2Icon, ChevronRight, SettingsIcon, } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { UseGetOrganisationId } from "../hooks/use-get-organisation-Id"

const routes = [
    {
        title: "Company Navigation",
        url: "#",
        icon: Building2Icon,
        isActive: true,
        items: [
            { title: "Home", url: "" },
            { title: "Analytics", url: "/analytics" },
            { title: "Members", url: "/members" },
            { title: "Contractors", url: "/contractors" },
        ],
    },
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
      items: [
        { title: "General", url: "/general-settings" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
]

export const NavMain = () => {
    const pathname = usePathname();
    const organisationId = UseGetOrganisationId();
  return (
    <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-between text-xs uppercase">Organisation</SidebarGroupLabel>

        <SidebarMenu>
            {routes.map((route) => (
                <Collapsible
                    key={route.title}
                    asChild
                    defaultOpen={route.isActive}
                    className="group/collapsible"
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={route.title}>
                                {route.icon && <route.icon />}
                                <span>{route.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {route.items?.map((subItem) => {
                                    const href = organisationId
                                    ? `/organisations/${organisationId}${subItem.url}`
                                    : subItem.url

                                    return (
                                    <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton asChild>
                                        <a href={href}>
                                            <span>{subItem.title}</span>
                                        </a>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    )
                                })}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            ))}
        </SidebarMenu>
    </SidebarGroup>
  )
}
