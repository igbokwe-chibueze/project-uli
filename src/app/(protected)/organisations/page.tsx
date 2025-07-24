// src/app/(protected)/organisations/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";

import { currentID, currentName } from "@/features/auth/lib/authenticate";
import { getOrganizationsForUser } from "@/features/organisations/data/organizations";
import { UserDropdown } from "@/features/auth/components/user-dropdown";

const OrgHomePage = async () => {
  // Authenticate user by getting the session Id
  const userId = await currentID();

  if (!userId) redirect("/access"); //If user is not authenticated redirect to signIn(/access)

  //Authenticate user by getting the session name
  const userName = await currentName();

  const memberships = await getOrganizationsForUser(userId);
  console.log("Membership Count" + memberships.length)

  //Fetch all memberships for this user, including the Organization
  //If they belong to at least one org, redirect to the first org’s page
  if (memberships.length > 0) {
    redirect(`/organisations/${memberships[0].organization.id}`);
  }

  // Render create/join UI if no organisations exist
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Welcome! {userName}</h1>
        <p className="text-muted-foreground">({userId})</p>

        <UserDropdown/>
        
        <p className="text-muted-foreground">
          You don’t belong to any organisation yet. Get started by creating or joining one.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/organisations/create"
            className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition"
          >
            Create Organisation
          </Link>
          <Link
            href="/organisations/join"
            className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Join Organisation
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrgHomePage