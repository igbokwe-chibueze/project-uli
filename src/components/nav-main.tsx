// src/components/nav-main.tsx

"use client"

import { ChevronRightIcon, LucideProps } from "lucide-react"
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
import { Badge } from "./ui/badge"

export interface NavSubItem {
  title: string;
  url: string;
  icon?: React.ComponentType<LucideProps>;
}

export interface NavRoute {
  title: string;
  segment: string;
  isActive?: boolean;
  items: NavSubItem[];
  icon?: React.ComponentType<LucideProps>;

  showBadge?: boolean;
}

interface NavMainProps {
  label: string;
  basePath: string;
  routes: NavRoute[];
}

export const NavMain = ( { label, basePath, routes }: NavMainProps )  => {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between text-xs">{label}</SidebarGroupLabel>

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
                                    {route.icon && <route.icon/>}
                                    <span>{route.title}</span>
                                    {route.showBadge && route.items.length > 0 && (
                                        <Badge variant="secondary" className="h-5 text-xs">
                                        {route.items.length}
                                        </Badge>
                                    )}
                                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {route.items?.map((subItem) => {
                                        const href = `${basePath}${route.segment}${subItem.url}`;
                                        const isActive = pathname === href;

                                        return (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild isActive={isActive}>
                                                    <Link href={href}>
                                                        {subItem.icon && <subItem.icon className="size-4" />}
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
    );
};