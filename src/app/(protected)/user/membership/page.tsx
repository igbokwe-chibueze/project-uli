// src/app/(protected)/user/membership/page.tsx

import { currentID, currentName } from "@/features/auth/lib/authenticate";
import { getOrganizationsForUser } from "@/features/organisations/data/organizations";
import { redirect } from "next/navigation";
import { MembershipClient } from "./client";

/**
 * @description Server component to fetch user data and display the membership page.
 */
const UserMembershipPage = async () => {
    // Authenticate user by getting the session Id
    const userId = await currentID();

    if (!userId) redirect("/access"); //If user is not authenticated redirect to signIn(/access)

    //Authenticate user by getting the session name
    const userName = await currentName();

    //Fetch all organisations that the user is a member of
    const memberships = await getOrganizationsForUser(userId);

  // Pass the fetched memberships to the client component for rendering  
  return <MembershipClient userName={userName} memberships={memberships} />
}

export default UserMembershipPage