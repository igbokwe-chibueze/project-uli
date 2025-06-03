// src/app/(protected)/organisations/[organisationId]/page.tsx

import { redirect } from "next/navigation"

import NotFound from "@/app/not-found"
import { currentID } from "@/features/auth/lib/authenticate"
import { getOrganisationById, isUserOrganizationMember } from "@/features/organisations/data/organizations"

interface PageProps {
  //params: { organisationId: string };
  params: Promise<{ organisationId: string }>;
}

const OrganisationIdPage = async ({params}: PageProps) => {
    // Authenticate user by getting the session Id
    const user = await currentID();

    // Not logged in → send to login (access)
    if (!user) redirect('/access');

    // Get the OrganisationId from the URL
    const orgId = (await params).organisationId;

    // Fetch the organization details by its ID.
    // If the organization does not exist, render a 404-like page.
    const organisation = await getOrganisationById(orgId);
    if (!organisation) {
        return <NotFound message="Organisation not found." />;
    }

    // Check if the authenticated user is a member of the organization.
    // If not a member, render a 404-like page with an access denied message.
    const isMember = await isUserOrganizationMember(user, orgId);
    if (!isMember) {
        return (
            <NotFound message="Access denied: you are not a member of this organisation." />
        );
    }

    

  return (
    <>        
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
                    <h1 className="text-3xl font-bold">Organazation Name</h1>
                    <p className="text-muted-foreground">Oraganisation overview and key metrics</p>
                </div>

                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    
                </div>
            </div>
        </div>
    </>
  )
}

export default OrganisationIdPage