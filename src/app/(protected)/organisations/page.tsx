// src/app/(protected)/organisations/page.tsx

import { redirect } from "next/navigation";

import { currentID} from "@/features/auth/lib/authenticate";
import { getOrganizationsForUser } from "@/features/organisations/data/organizations";

const OrgHomePage = async () => {
  // Authenticate user by getting the session Id
  const userId = await currentID();

  if (!userId) redirect("/access"); //If user is not authenticated redirect to signIn(/access)

  const memberships = await getOrganizationsForUser(userId);

  // If the user belongs to at least one organization, redirect to the first one.
  // Otherwise, redirect to the user's membership page.
  if (memberships.length > 0) {
    redirect(`/organisations/${memberships[0].organization.id}`);
  } else {
    redirect(`/user/membership`);
  }
}

export default OrgHomePage