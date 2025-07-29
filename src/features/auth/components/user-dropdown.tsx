// src/features/auth/components/user-dropdown.tsx
"use client"

import { UseCurrentUser } from "../hooks/use-current-user";

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
import { BellIcon, CreditCardIcon, LogOutIcon, SettingsIcon, SparklesIcon, UserIcon } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { useCurrentName } from "../hooks/use-current-name";
import Link from "next/link";

export const UserDropdown = () => {

    const user = UseCurrentUser()

    const userDisplayName = useCurrentName()

    if (!user) {
        return null;
    }

    const menuItems = [
        { icon: UserIcon, label: "Profile", url: "/profile", },
        { icon: SettingsIcon, label: "Settings", url: "/details", },
        { icon: CreditCardIcon, label: "Billing", url: "/#", },
        { icon: BellIcon, label: "Notifications", url: "/#", },
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
    <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
            <Avatar className="rounded-lg">
                <AvatarImage src={user?.image || ""} alt={userDisplayName || "User Avatar"} />
                <AvatarFallback className="rounded-lg uppercase">{getUserInitials()}</AvatarFallback>
            </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
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
                        <SparklesIcon />
                        Upgrade to Pro
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
                {menuItems.map(({ icon: Icon, label, url }) => (
                    <Link key={label} href={`/user${url}`}>
                        <DropdownMenuItem>
                            <Icon />
                            {label}
                        </DropdownMenuItem>
                    </Link>
                ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            
            <LogoutButton>
                <DropdownMenuItem>
                    <LogOutIcon />
                    Log out
                </DropdownMenuItem>
            </LogoutButton>

        </DropdownMenuContent>

    </DropdownMenu>
  )
}
