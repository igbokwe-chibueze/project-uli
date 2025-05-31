// src/app/(protected)/organisations/[organisationId]/layout.tsx

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/organisations/components/app-sidebar";

const OrgIdLayout = async ({children,}: {children: React.ReactNode;}) => {
  return (
    <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
            {children}
        </SidebarInset>

    </SidebarProvider>
  )
}

export default OrgIdLayout