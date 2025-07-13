// src/app/(protected)/organisations/[organisationId]/marketplace/page.tsx

//import Link from "next/link";
import { redirect } from "next/navigation"

import NotFound from "@/app/not-found"
import { currentID } from "@/features/auth/lib/authenticate"
import { getOrganisationSummaryById, isUserOrganizationMember } from "@/features/organisations/data/organizations"

import MarketplaceClient from "./client"

interface MarketplacePageProps {
  params: Promise<{ organisationId: string }>;
}


const MarketplacePage = async ({params}: MarketplacePageProps) => {
    // Authenticate user by getting the session Id
    const user = await currentID();

    // Not logged in → send to login (access)
    if (!user) redirect('/access');

    const { organisationId } = await params;

    // Fetch the organization details by its ID.
    const organisation = await getOrganisationSummaryById(organisationId);
    if (!organisation) return <NotFound message="Organisation not found." />;

    // Check if the authenticated user is a member of the organization.
    // If not a member, render a 404-like page with an access denied message.
    const isMember = await isUserOrganizationMember(user, organisation?.id);
    if (!isMember) {
        return (
            <NotFound message="Access denied: you are not a member of this organisation." />
        );
    }
  return <MarketplaceClient id={organisationId}/>
}

export default MarketplacePage