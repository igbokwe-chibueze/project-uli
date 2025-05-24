// src/app/(protected)/organisations/[organisationId]/layout.tsx

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarX } from "@/features/organisations/components/app-sidebarX";

const OrgIdLayout = async ({children,}: {children: React.ReactNode;}) => {
  return (
    <SidebarProvider>
        <AppSidebarX />

        <SidebarInset>
            {children}
        </SidebarInset>

    </SidebarProvider>
  )
}

export default OrgIdLayout