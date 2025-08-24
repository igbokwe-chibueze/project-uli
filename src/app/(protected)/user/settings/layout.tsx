// src/app/(protected)/user/settings/layout.tsx

import { UserSettingsSidebar } from "@/features/user/components/user-settings-sidebar";

interface UserSettingsLayoutPageProps {
  children: React.ReactNode;
}

const UserSettingsLayoutPage = async ({children}: UserSettingsLayoutPageProps) => {
  return (
    <div className="container grid items-start md:grid-cols-[180px_1fr] gap-2">
        <UserSettingsSidebar/>
        {/* <div className="lg:w-5xl space-y-4 mt-4">{children}</div> */}
        <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">{children}</div>
    </div>
  )
}

export default UserSettingsLayoutPage