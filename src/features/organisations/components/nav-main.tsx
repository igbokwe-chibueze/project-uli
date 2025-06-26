// src/features/organisations/components/nav-main.tsx

"use client"

import { Building2Icon, ChevronRight, SettingsIcon, } from "lucide-react"

import { usePathname } from "next/navigation"
import Link from "next/link"

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

import { useOrganisation } from "@/features/organisations/context/organisation-context"

/**
 * Each top-level route now has a `url` which serves as the “base” for all its children.
 * - If you want a section at `/organisations/${orgId}/foo/bar`, set `url: "/foo"` and then
 *   put child URLs like `"/bar"`.
 * - For Company Navigation we set `url: ""`, meaning “no extra segment” before the child-page.
 */

const routes = [
    {
        title: "Company Navigation",
        // An empty string means “no extra segment here”:
        // children will become `/organisations/${orgId}${subItem.url}`
        url: "",
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
      // All children will live under `/organisations/${orgId}/settings/...`
      url: "/settings",
      icon: SettingsIcon,
      items: [
        { title: "General", url: "/general" },
        { title: "Team", url: "/#" },
        { title: "Billing", url: "/#" },
        { title: "Limits", url: "/#" },
      ],
    },
]

export const NavMain = () => {
    const pathname = usePathname();
    //const organisationId = UseGetOrganisationId();
    const organisation = useOrganisation();
    const organisationId = organisation.id
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
                                    ? `/organisations/${organisationId}${route.url}${subItem.url}`
                                    : subItem.url

                                    const isActive = pathname === href

                                    return (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild isActive={isActive}>
                                                <Link href={href}>
                                                    <span>{subItem.title}</span>
                                                </Link>
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
