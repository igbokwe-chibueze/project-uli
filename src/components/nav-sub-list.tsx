// src/components/nav-sub-list.tsx

"use client"

import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavSubListItem {
    title: string;
    url: string;
    icon?: React.ComponentType<LucideProps>;
}

export interface NavSubListProps {
    basePath: string;
    routes: NavSubListItem[];
}

export const NavSubList = ({basePath, routes} : NavSubListProps) => {
    const pathname = usePathname();
    
  return (
    <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground md:flex-col">
        {routes.map((route) => {
            const href = `${basePath}${route.url}`;
            const isActive = pathname === href;

            return (
                <Link
                    key={route.title}
                    href={href}
                    className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-md transition-colors",  
                    isActive ? 
                        "font-semibold text-primary" : 
                        "text-muted-foreground hover:text-primary hover:bg-sidebar-accent",
                    )}
                    aria-current={isActive ? "page" : undefined}
                >
                    {route.icon && <route.icon className="size-4"/>}
                    <span>{route.title}</span>
                </Link>
            )
        })}
    </nav>
  )
}
