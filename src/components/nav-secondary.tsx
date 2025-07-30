// src/components/nav-secondary.tsx

import * as React from "react"
import Link from "next/link";
import { LucideProps } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"


export interface SecondaryItem {
  title: string;
  url: string;
  icon: React.ComponentType<LucideProps>;
}

export interface NavSecondaryProps
  extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  basePath: string;
  routes: SecondaryItem[];
}

export function NavSecondary({basePath, routes, ...props} : NavSecondaryProps) {  
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.title}>
              <SidebarMenuButton asChild >
                <Link href={`${basePath}${route.url}`}>
                  <route.icon />
                  <span>{route.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
