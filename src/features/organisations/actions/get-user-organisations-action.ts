// src/features/organisations/actions/get-user-organisations-action.ts
"use server";

//This useful for getting organisatin data then pass it on to a hook that would used it in client component, 
// For server components organisation.ts is to be used directly instead.
import { currentID } from "@/features/auth/lib/authenticate";
import { getOrganizationsForUser } from "../data/organizations";

/**
 * Fetches the current user’s ID via `currentID()` (server‐side),
 * then returns an array of Organization objects (not the full membership) to be used by a client.
 *
 * If the user is not authenticated, we throw so the client can catch and show an error.
 */
export async function GetUserOrganisationsAction() {
  // Ensure the user is authenticated
  const userId = await currentID();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  // Fetch all memberships for this user, include the nested Organization, from the server DAL organizations.ts
  const memberships = await getOrganizationsForUser(userId);
  // Return only the Organization objects; you can pick whichever fields you need
  return memberships.map((m) => {
    // Extract the nested country object from Prisma
    const countryObj = m.organization.country;
    return {
      id: m.organization.id,
      name: m.organization.name,
      logo: m.organization.logo,
      // Only return the country name & iso2 together (e.g. "Nigeria (NG)") as a (string) or null
      country: countryObj ? `${countryObj.name} (${countryObj.iso2})` : null,
    };
  });
}
