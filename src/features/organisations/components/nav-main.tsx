// src/features/organisations/components/nav-main.tsx

"use client"

import { Building2Icon, ChevronRight, PackageIcon, SettingsIcon, } from "lucide-react"
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
import { getIcon } from "@/lib/get-icon" // Import getIcon to render module icons
import { Badge } from "@/components/ui/badge"

/**
 * Each top-level route now has a `url` which serves as the “base” for all its children.
 * - If you want a section at `/organisations/${orgId}/foo/bar`, set `url: "/foo"` and then
 * put child URLs like `"/bar"`.
 * - For Company Navigation we set `url: ""`, meaning “no extra segment” before the child-page.
 */

// Static routes for core navigation
const staticRoutes = [
    {
        title: "Company Navigation",
        url: "", // No extra segment for children
        icon: Building2Icon,
        isActive: true, // Default open
        items: [
            { title: "Home", url: "" },
            { title: "Analytics", url: "/analytics" },
            { title: "Members", url: "/members" },
            { title: "Contractors", url: "/contractors" },
        ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
      items: [
        { title: "General", url: "/general" },
        { title: "Team", url: "/#" },
        { title: "Billing", url: "/#" },
        { title: "Limits", url: "/#" },
      ],
    },
];

export const NavMain = () => {
    const pathname = usePathname();
    const organisation = useOrganisation(); // Get the current organisation from context
    const organisationId = organisation?.id; // Safely access organisationId

    // If organisationId is not available, we can't generate dynamic links
    if (!organisationId) {
      // You might want to render a loading state or nothing if organisation data isn't ready
      return null;
    }

    const installedModuleRoutes = organisation.modules?.map((orgModule) => {
        const moduleData = orgModule.module; // Access the nested module details

        const ModuleIcon = getIcon(moduleData.icon); // Get the icon component using moduleData

        return {
            title: moduleData.type, // Use moduleData's name for display
            url: `/modules/${moduleData.type.toLowerCase()}`, // Route based on moduleData type
            icon: ModuleIcon,
            id: moduleData.id, // Use moduleData id for key
        };
    }) || []; // Default to empty array if no modules or data is missing

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between text-xs uppercase">Organisation</SidebarGroupLabel>

            <SidebarMenu>
                {/* Render Static Routes */}
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
                                    {route.icon && <route.icon />}
                                    <span>{route.title}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {route.items?.map((subItem) => {
                                        const href = `${organisationId ? `/organisations/${organisationId}` : ''}${route.url}${subItem.url}`;
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

                {/* NEW: Collapsible Group for Installed Modules */}
                {installedModuleRoutes.length > 0 && ( // Only render if there are installed modules
                    <Collapsible
                        asChild
                        defaultOpen={true} // You might want this to be open by default
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip="Installed Modules">
                                    <PackageIcon />
                                    <span>Installed Modules</span>
                                    {installedModuleRoutes.length > 0 && (
                                        <Badge variant="secondary" className="h-5 text-xs">
                                            {installedModuleRoutes.length}
                                        </Badge>
                                    )}
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {installedModuleRoutes.map((moduleRoute) => {
                                        const href = `/organisations/${organisationId}${moduleRoute.url}`;
                                        const isActive = pathname === href;

                                        return (
                                            <SidebarMenuSubItem key={moduleRoute.id}>
                                                <SidebarMenuSubButton asChild isActive={isActive}>
                                                    <Link href={href}>
                                                        {moduleRoute.icon && <moduleRoute.icon className="size-4" />} {/* Render module icon */}
                                                        <span>{moduleRoute.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        );
                                    })}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
};