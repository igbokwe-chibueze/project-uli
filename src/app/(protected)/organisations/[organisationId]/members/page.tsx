// src/app/(protected)/organisations/[organisationId]/members/page.tsx

import NotFound from "@/app/not-found"

import { OrgRole } from "@prisma/client";
import { MembersClient } from "./client";
import { requireUserID } from "@/features/auth/lib/requireUserID";
import { getOrganisationSummaryById, isUserOrganizationMember } from "@/features/organisations/data/organizations";

interface MembersPageProps {
  params: Promise<{ organisationId: string }>;
}

const MembersPage = async ({params}: MembersPageProps) => {
  const { organisationId } = await params;

  const userID = await requireUserID(); // user ID from auth

  // Fetch the organisation using the ID from the route
  const organisation = await getOrganisationSummaryById(organisationId);
  if (!organisation) return <NotFound message="Organisation not found." />;

  // Check membership using the DB-validated organisation ID
  const isMember = await isUserOrganizationMember(userID, organisation.id);
  if (!isMember) {
    return <NotFound message="Access denied: you are not a member of this organisation." />;
  }

  const roleData = {
    // Get enum values directly from Prisma
    options: Object.values(OrgRole),
    // You can define any default
    default: "MEMBER" as OrgRole,
  };

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
            <h1 className="text-3xl font-bold">MembersPage</h1>
            <p className="text-muted-foreground">MembersPage</p>
          </div>
          
          <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
            <MembersClient
              id={organisation.id}
              roleData={roleData}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default MembersPage