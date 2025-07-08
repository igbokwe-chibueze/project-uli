// src/features/organisations/actions/searchOrganisationNamesAction.ts

"use server";

import { findSimilarOrganizationNames, SimilarOrganizationResult } from "@/features/organisations/data/organizations";

/**
 * Server Action to search for similar organization names.
 * This function is designed to be called directly from a client component
 * to provide real-time suggestions based on fuzzy matching.
 * @param query The search string entered by the user.
 * @returns A Promise resolving to an array of `SimilarOrganizationResult` objects.
 */
export async function searchOrganisationNamesAction(query: string): Promise<SimilarOrganizationResult[]> {
  // Add a minimum query length to prevent excessive database calls for short inputs.
  // Adjust '3' based on your needs.
  if (!query || query.trim().length < 3) {
    return [];
  }
  try {
    const similarOrgs = await findSimilarOrganizationNames(query);
    return similarOrgs;
  } catch (error) {
    console.error("Error in searchOrganisationNamesAction:", error);
    // Return an empty array to gracefully handle any errors during the search.
    return [];
  }
}
