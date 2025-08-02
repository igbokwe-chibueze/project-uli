// src/features/user/components/user-settings-sidebar.tsx
"use client"

import { PaletteIcon, UserIcon, UserLockIcon } from "lucide-react";

import { NavSubList } from "@/components/nav-sub-list"

const userSettingsNavRoutes2 = [
  {
    title: "Profile",
    url: "/profile",
    icon: UserIcon,
  },
  {
    title: "Security",
    url: "/security",
    icon: UserLockIcon,
  },
  {
    title: "Preference",
    url: "/preference",
    icon: PaletteIcon,
  },
];

export const UserSettingsSidebar = () => {
  return (
    <div>
        <div className="flex flex-col h-full my-2 space-y-4 px-4 lg:px-6 py-4 md:py-6 rounded-lg ">
            <h1 className="text-3xl font-bold">Settings</h1>
            {/* <p className="text-muted-foreground">Profile Settings</p> */}

            <NavSubList basePath="/user/settings" routes={userSettingsNavRoutes2}/>
        </div>
    </div>
  )
}
