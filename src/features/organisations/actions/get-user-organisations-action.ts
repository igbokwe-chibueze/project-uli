// src/features/organisations/actions/get-user-organisations-action.ts
"use server";

import { currentID } from "@/features/auth/lib/authenticate";
import { getOrganizationsForUser } from "../data/organizations";

/**
 * Fetches the current user’s ID via `currentID()` (server‐side),
 * then returns an array of Organization objects (not the full membership).
 *
 * If the user is not authenticated, we throw so the client can catch and show an error.
 */
export async function GetUserOrganisationsAction() {
  // Ensure the user is authenticated
  const userId = await currentID();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  // Fetch all memberships for this user, include the nested Organization
  const memberships = await getOrganizationsForUser(userId);
  // Return only the Organization objects; you can pick whichever fields you need
  return memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    logo: m.organization.logo,
    country: m.organization.country,
    // If you need more fields, add them here:
    // description: m.organization.description,
    // …
  }));
}
