// src/components/nav-user.tsx

"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  SettingsIcon,
  Sparkles,
  UserIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { UseCurrentUser } from "@/features/auth/hooks/use-current-user"
import { useCurrentName } from "@/features/auth/hooks/use-current-name"
import Link from "next/link"

/**
 * NavUser Component
 *
 * This component displays the currently logged-in user's avatar, name, and email
 * within a navigation context (likely a sidebar or header). It also provides
 * a dropdown menu with common user-related actions like account settings,
 * billing, notifications, and logout.
 *
 * It leverages client-side hooks to efficiently access user session data.
 */
export const NavUser = () => {
    // Fetch the complete user object from the NextAuth.js session.
  // This hook provides access to all user properties (id, email, firstName, lastName, image, etc.)
  const user = UseCurrentUser()

  // Fetch the user's display name (concatenated firstName and lastName) using a dedicated hook.
  // This centralizes the name formatting logic and ensures consistency across the UI.
  // Although `user` contains `firstName` and `lastName`, using `useCurrentName` here
  // is an optimization for maintainability and readability, as the concatenation
  // logic (including fallbacks) is encapsulated. The performance overhead is negligible
  // as both hooks read from the same cached session data.
  const userDisplayName = useCurrentName()

  // Determine if the sidebar is in a mobile state, which might affect dropdown positioning.
  const { isMobile } = useSidebar()

  // Define the list of menu items for the dropdown.
  // Each item has an icon and a label.
  const menuItems = [
    { icon: UserIcon, label: "Profile", url: "/profile", },
    { icon: SettingsIcon, label: "Settings", url: "/details", },
    { icon: BadgeCheck, label: "Account" },
    { icon: CreditCard, label: "Billing" },
    { icon: Bell, label: "Notifications" },
  ]

  // Function to get the initials (first letter of first name + first letter of last name)
  const getUserInitials = () => {
    const firstInitial = user?.firstName?.charAt(0) || '';
    const lastInitial = user?.lastName?.charAt(0) || '';
    // If both initials are available, combine them. Otherwise, fall back to the first two
    // characters of the display name, or a default if that's also empty.
    return (firstInitial + lastInitial).toUpperCase() || userDisplayName.slice(0, 2).toUpperCase() || '??';
  };

  return (
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user?.image || ""} alt={userDisplayName || "User Avatar"} />
                            <AvatarFallback className="rounded-lg uppercase">{getUserInitials()}</AvatarFallback>
                        </Avatar>

                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{userDisplayName}</span>
                            <span className="truncate text-xs">{user?.email}</span>
                        </div>

                        <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user?.image || ""} alt={userDisplayName || "User Avatar"} />
                                <AvatarFallback className="rounded-lg uppercase">{getUserInitials()}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{userDisplayName}</span>
                                <span className="truncate text-xs">{user?.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        {menuItems.map(({ icon: Icon, label, url }) => (
                            <Link key={label} href={`/user${url}`}>
                                <DropdownMenuItem key={label}>
                                    <Icon />
                                    {label}
                                </DropdownMenuItem>
                            </Link>
                        ))}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />
                    
                    <LogoutButton>
                        <DropdownMenuItem>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </LogoutButton>

                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
  )
}
