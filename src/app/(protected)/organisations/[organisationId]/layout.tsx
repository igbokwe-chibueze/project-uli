// src/app/(protected)/organisations/[organisationId]/layout.tsx

import { NuqsAdapter } from 'nuqs/adapters/next/app'

import NotFound from "@/app/not-found"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CreateOrganisationModal } from '@/features/organisations/components/create-organisation-modal';
import { OrganisationHeader } from '@/features/organisations/components/organisation-header';
import { getOrganisationSummaryById } from '@/features/organisations/data/organizations';
import { OrganisationClientProvider } from '@/features/organisations/context/organisation-client-provider';
import { OrgSidebar } from '@/features/organisations/components/org-sidebar';

interface PageProps {
  params: Promise<{ organisationId: string }>;
  children: React.ReactNode;
}

const OrgIdLayout = async ({children, params}: PageProps) => {
  // Get the OrganisationId from the URL
  const orgId = (await params).organisationId;

  // Fetch the organization details by its ID.
  // If the organization does not exist, render a 404-like page.
  const organisation = await getOrganisationSummaryById(orgId);
  if (!organisation) {
      return <NotFound message="Organisation not found." />;
  }

  // Now you can access the color scheme name
  const colorSchemeName = organisation.colorScheme?.name || 'theme-velvet'; // Provide a fallback if no color scheme is set

  return (
    <div className={`${colorSchemeName}`}>
      <NuqsAdapter>
        <CreateOrganisationModal/>
        
        <SidebarProvider>
          <OrganisationClientProvider organisation={organisation}>
            <OrgSidebar/>
            
            <SidebarInset>
              <OrganisationHeader/>
              {children}
            </SidebarInset>
          </OrganisationClientProvider>

        </SidebarProvider>
      </NuqsAdapter>
    </div>
  )
}

export default OrgIdLayout