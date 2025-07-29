// src/features/user/components/user-nav-main.tsx

"use client"

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
import { ChevronRightIcon } from "lucide-react"

const staticRoutes = [
    {
        title: "My Profile",
        url: "", // No extra segment for children
        isActive: true, // Default open
        items: [
            //If we had an intercepting route like in organisation, i can live the profile url as blank ""
            //I may still add an intercepting route that checks if the user is the logged in user then redirect to....
            //...the users main profile or general profile [userId]/profile
            { title: "Profile", url: "/profile" },
            { title: "Details", url: "/details" },
        ],
    },
    {
      title: "Settings",
      url: "/settings",
      items: [
        { title: "Profile", url: "/profile" },
        { title: "Security", url: "/security" },
        { title: "Preference", url: "/preference" },
      ],
    },
];

export const UserNavMain = () => {
    const pathname = usePathname();
  return (
    <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-between text-xs uppercase">User</SidebarGroupLabel>

        <SidebarMenu>
            {staticRoutes.map((route) => (
                <Collapsible
                    key={route.title}
                    asChild
                    defaultOpen={route.isActive}
                    className="group/collapsible"
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={route.title}>
                                <span>{route.title}</span>
                                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {route.items?.map((subItem) => {
                                    const href = `/user${route.url}${subItem.url}`;
                                    const isActive = pathname === href;

                                    return (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild isActive={isActive}>
                                                <Link href={href}>
                                                    <span>{subItem.title}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    );
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
