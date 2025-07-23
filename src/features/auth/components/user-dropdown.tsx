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
import { BadgeCheckIcon, BellIcon, CreditCardIcon, LogOutIcon, SparklesIcon } from "lucide-react";
import { LogoutButton } from "./logout-button";

export const UserDropdown = () => {

    const user = UseCurrentUser()

    if (!user) {
        return null;
    }

    const menuItems = [
        { icon: BadgeCheckIcon, label: "Account" },
        { icon: CreditCardIcon, label: "Billing" },
        { icon: BellIcon, label: "Notifications" },
    ]

  return (
    <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
            <Avatar className="rounded-lg">
                <AvatarImage src={user?.image || ""} alt={user?.name || "User Avatar"} />
                <AvatarFallback className="rounded-lg uppercase">{user?.name?.slice(0, 2)}</AvatarFallback>
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
                        <AvatarImage src={user?.image || ""} alt={user?.name || "User Avatar"} />
                        <AvatarFallback className="rounded-lg uppercase">{user?.name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.name}</span>
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
                {menuItems.map(({ icon: Icon, label }) => (
                    <DropdownMenuItem key={label}>
                        <Icon />
                        {label}
                    </DropdownMenuItem>
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

        {/* <DropdownMenuContent className="w-60" align="end" side="bottom" sideOffset={10} forceMount>
            <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-1.5 space-y-1">
                <Avatar className="size-[52px] border border-neutral-300">
                    <AvatarFallback className="bg-neutral-200 text-xl font-meduim text-neutral-500 flex items-center justify-center">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-medium text-neutral-900 leading-none">
                        {name || "User"}
                    </p>
                    <p className="text-xs text-neutral-500 leading-none">
                        {email}
                    </p>
                </div>
            </div>

            <DottedSeparator/>

            <DropdownMenuItem 
                onClick={() => signOut()}
                className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer"
            >
                <LogOut className="size-4 mr-2"/>
                Sign Out
            </DropdownMenuItem>
        </DropdownMenuContent> */}
    </DropdownMenu>
  )
}
