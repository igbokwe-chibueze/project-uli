// src/app/(protected)/user/layout.tsx

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserDashboardHeader } from "@/features/user/components/user-dashboard-header";
import { UserSidebar } from "@/features/user/components/user-sidebar";

interface UserLayoutPageProps {
  children: React.ReactNode;
}

const UserLayoutPage = async ({children}: UserLayoutPageProps) => {
  return (
    <div>
      <SidebarProvider>
        <UserSidebar/>

        <SidebarInset>
          <UserDashboardHeader/>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default UserLayoutPage