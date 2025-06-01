// src/app/(protected)/organisations/[organisationId]/layout.tsx

import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/organisations/components/app-sidebar";
import { CreateOrganisationModal } from '@/features/organisations/components/create-organisation-modal';

const OrgIdLayout = async ({children,}: {children: React.ReactNode;}) => {
  return (
    <NuqsAdapter>
      <CreateOrganisationModal/>
      
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          {children}
        </SidebarInset>

      </SidebarProvider>
    </NuqsAdapter>
  )
}

export default OrgIdLayout