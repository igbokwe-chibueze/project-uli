// src/features/organisations/components/organisation-switcher.tsx
"use client";

import { CheckCircleIcon, ChevronsUpDown, CirclePlusIcon, Plus } from "lucide-react";

import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { OrganisationAvatar } from "@/features/organisations/components/organisation-avatar";
import { useCreateOrganisationModal } from "@/features/organisations/hooks/use-create-organisation-modal";

interface Org {
  id: string
  name: string
  logo: string | null
  country: string | null
}

interface OrganisationSwitcherProps {
  organizations: Org[];
  loading: boolean;
  error: Error | null;
}

/**
 * OrganisationSwitcher
 *
 * - Displays a dropdown of organizations that the current user belongs to.
 * - Highlights which one is currently “active” (via UseGetOrganisationId).
 * - Shows a “Loading…” placeholder during the RPC.
 * - Automatically re-fetches if you call `refetch()` (for example, after creating a new org).
 */
export const OrganisationSwitcher = ({ organizations, loading, error }: OrganisationSwitcherProps) => {
  const router = useRouter();

  const currentOrgId = UseGetOrganisationId();

  const org = organizations.find((o) => o.id === currentOrgId);

  const { isMobile, open: isSidebarOpen } = useSidebar()

  const { open } = useCreateOrganisationModal();

  const onSelect = (id: string) => {
      router.push(`/organisations/${id}`);
  }

  if (loading || !org) {
    return (
      <SidebarMenu>
        {Array.from({ length: 1 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <Skeleton className="h-[50px] rounded-lg" />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }  

  if (error) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="w-full h-[50px]">
            <span className="text-destructive-foreground">Error: {error.message}</span>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      {/* Only render this header when the sidebar is open */}
      <div
        className={`flex items-center justify-between
        transition-opacity duration-300
        ${isSidebarOpen ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"}`}
      >
        <p className="text-xs uppercase">Organisations</p>
        <CirclePlusIcon
          onClick={open}
          className="size-5 cursor-pointer hover:opacity-75 transition"
        />
      </div>

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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg 
                  bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <OrganisationAvatar
                    image={org.logo}
                    name={org.name}
                    className="size-8"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{org.name}</span>
                  <span className="truncate text-xs">{org.country}</span>
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
                        onSelect(org.id);
                      }}
                      className="gap-2 p-2"
                    >
                      {/* ORGANISATION AVATAR HERE */}
                      <OrganisationAvatar
                        image={org.logo}
                        name={org.name}
                        className="size-7 rounded-sm border"
                      />

                      <span className="flex-1">{org.name}</span>

                      {isActive && (
                        <CheckCircleIcon className="size-4 text-primary"/>
                      )}
                      <DropdownMenuShortcut />
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <DropdownMenuItem disabled>No organizations found</DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="p-2">
                <Link
                  href="/organisations/create"
                  className="flex gap-2 items-center"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Add Organisation</div>
                </Link>
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
};
