// src/app/(protected)/organisations/[organisationId]/marketplace/page.tsx

import { redirect } from "next/navigation"

import NotFound from "@/app/not-found"
import { currentID } from "@/features/auth/lib/authenticate"
import { getOrganisationSummaryById, isUserOrganizationMember } from "@/features/organisations/data/organizations"

import MarketplaceClient from "./client"

interface MarketplacePageProps {
  params: { organisationId: string };
}


const MarketplacePage = async ({params}: MarketplacePageProps) => {
  // Authenticate user by getting the session Id
  const user = await currentID();

  // Not logged in → send to login (access)
  if (!user) redirect('/access');

  // Fetch the organisation using the ID from the route
  const organisation = await getOrganisationSummaryById(params.organisationId);
  if (!organisation) return <NotFound message="Organisation not found." />;

  // Check membership using the DB-validated organisation ID
  const isMember = await isUserOrganizationMember(user, organisation.id);
  if (!isMember) {
    return <NotFound message="Access denied: you are not a member of this organisation." />;
  }

  // Pass the validated organisation ID to the client
  return <MarketplaceClient id={organisation.id} />;
}

export default MarketplacePage