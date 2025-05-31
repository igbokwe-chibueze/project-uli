// src/features/organisations/components/organisation-switcher.tsx
"use client";

import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

import { UseGetOrganisationId } from "@/features/organisations/hooks/use-get-organisation-Id";
import { useUserOrganizations } from "@/features/organisations/hooks/use-user-organisations";
import { OrganisationAvatar } from "./organisation-avatar";

/**
 * OrganisationSwitcher
 *
 * - Displays a dropdown of organizations that the current user belongs to.
 * - Highlights which one is currently “active” (via UseGetOrganisationId).
 * - Shows a “Loading…” placeholder during the RPC.
 * - Automatically re-fetches if you call `refetch()` (for example, after creating a new org).
 */
export const OrganisationSwitcher = () => {
  const currentOrgId = UseGetOrganisationId(); // your existing hook
  const { organizations, loading, error, refetch } = useUserOrganizations();

  const { isMobile } = useSidebar()

  // Example: If you show a “Create New Org” popup somewhere else, you can run `refetch()` 
  // afterward to automatically append the newly created org to this list.

  if (loading) {
    return (
      <div className=" w-full p-2">
        <Skeleton className="h-[40px] rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 w-[100px]">
        <span className="text-red-600">Error: {error.message}</span>
      </div>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground 
              bg-sidebar-accent cursor-pointer hover:bg-sidebar-primary transition-colors duration-500 
              hover:text-sidebar-primary-foreground"
            >
              <div className="flex items-center space-x-2 truncate">
                {currentOrgId ? (
                  (() => {
                    const org = organizations.find((o) => o.id === currentOrgId);
                    if (org) {
                      return (
                        <>
                          <OrganisationAvatar
                            image={org.logo}
                            name={org.name}
                            className="size-8"
                          />
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{org.name}</span>
                            <span className="truncate text-xs">{org.country}</span>
                          </div>
                        </>
                      );
                    }
                    return <span>Select organization</span>;
                  })()
                ) : (
                  <span>Select organization</span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Your Organisations
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {organizations.length > 0 ? (
              organizations.map((org) => {
                const isActive = org.id === currentOrgId;
                return (
                  <DropdownMenuItem
                    key={org.id}
                    //className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : ""}
                    onClick={() => {
                      // TODO: “Switch organization” logic
                      console.log("Switch to org:", org.id);
                    }}
                    className="gap-2 p-2"
                  >
                    {/* ORGANISATION AVATAR HERE */}
                    <OrganisationAvatar
                      //image={org.logo}
                      name={org.name}
                      className="size-5 rounded-sm border"
                    />

                    <span className="flex-1">{org.name}</span>

                    {isActive && (
                      <span className="text-xs text-blue-600">(current)</span>
                    )}
                    <DropdownMenuShortcut />
                  </DropdownMenuItem>
                );
              })
            ) : (
              <DropdownMenuItem disabled>No organizations found</DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add Organisation</div>
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
