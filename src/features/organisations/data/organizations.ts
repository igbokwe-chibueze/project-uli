// src/features/organisations/data/organizations.ts
import "server-only";

import { prisma } from "@/lib/prisma/prisma";
import { ColorScheme, Country, Organization } from "@prisma/client";

/**
 * Fetch all organization memberships for a given user, including organization details.
 */
export const getOrganizationsForUser = async(userId: string) => {
    try {
        const memberships = await prisma.organizationMember.findMany({
            where: { userId },
            include: { 
                organization: {
                    include: {
                        // ← Include the nested country object (so we can read .name and .iso2)
                        country: {
                            select: { id: true, name: true, iso2: true },
                        },
                        // You can include other needed lookups (industry, orgType, etc)
                    },
                }
            },
        });
        
        return memberships;
    } catch (error) {
        console.error("Error fetching organizations for user", { userId, error });
        // return an empty array so callers can still do `.length` checks
        return [];
    }
}

// Define a minimal type for the organization summary
export type OrganisationSummaryType = Pick<Organization, 'id' | 'name' | 'logo'> & {
    colorScheme: Pick<ColorScheme, 'name' | 'id'> | null;
    country: Pick<Country, 'name' | 'id' | 'iso3'> | null; // Assuming country is a relation and you need its name
};

// Function to get a summary of an organization by ID
//....because certain componnets like OrgIdLayout, OrganisationIdPage and OrganisationHeader dont need all the orginasation data.
export const getOrganisationSummaryById = async (id: string): Promise<OrganisationSummaryType | null> => {
    try {
        const organisation = await prisma.organization.findUnique({
            where: { id },
            select: { // Use `select` to fetch only specific fields and relations
                id: true,
                name: true,
                logo: true,
                colorScheme: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                country: { // Assuming 'country' is a relation in your Organization model
                    select: {
                        id: true,
                        name: true,
                        iso3: true,
                    },
                },
                // Add any other minimal fields needed by the layout or main page
            },
        });
        return organisation as OrganisationSummaryType | null; // Cast for type safety
    } catch (error) {
        console.error("Error fetching organization summary:", error);
        return null;
    }
};

/**
 * Fetch a single organization by its ID.
 */
export const getOrganisationById = async (id: string) => {
    try {
        return await prisma.organization.findUnique({
            where: { id },
            include: {
                // Include assigned languages via the join table
                languages: {
                    select: {
                        language: {
                            select: { id: true, name: true, countryCode: true, },
                        },
                    },
                },
                // Include the colorScheme object here!
                colorScheme: {
                    select: {
                        name: true, // Select only the name, or include other fields if needed
                        id: true,
                        primaryOklch: true,
                    },
                },
            },
        });
    } catch (err) {
        console.error("Error fetching organisation with languages", { id, err });
        return null;
    }
};

/**
 * Check if a user is a member of an organization.
 */
export const isUserOrganizationMember = async (userId: string, organizationId: string) => {
    try {
        // Uses the composite unique constraint on (orgId, userId)
        const membership = await prisma.organizationMember.findUnique({
            where: { orgId_userId: { orgId: organizationId, userId } },
        });
        return Boolean(membership);
    } catch (error) {
        console.error("Error checking membership for user in organization", {
            userId,
            organizationId,
            error,
        });
        return false;
    }
};


/**
 * fuzzyMatch: Calculates a similarity score between two strings.
 * Used for suggesting similar organization names.
 * @param query The search query string.
 * @param target The string to compare against (e.g., an organization name).
 * @returns A score from 0 to 100, indicating similarity.
 */
export function fuzzyMatch(query: string, target: string): number {
  if (!query || !target) return 0;

  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact match gets the highest score
  if (queryLower === targetLower) return 100;

  // Starts with match
  if (targetLower.startsWith(queryLower)) return 90;

  // Contains match (less precise than startsWith)
  if (targetLower.includes(queryLower)) return 70;

  // Basic character-by-character similarity for a weaker match
  let matches = 0;
  let queryIndex = 0;
  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      matches++;
      queryIndex++;
    }
  }

  // Scale down the character match score to ensure it's lower than contains/startsWith
  const similarity = (matches / queryLower.length) * 50;
  return similarity;
}

// Define a type for the simplified similar organization data, as requested.
// It will only include 'id', 'name', and the 'name' of its 'industry'.
export type SimilarOrganizationResult = {
  id: string;
  name: string;
  industry?: {
    name: string;
  } | null;
};

/**
 * findSimilarOrganizationNames: Fetches organizations and applies fuzzy matching
 * to find names similar to the given query. Returns only name and industry.
 * @param name The organization name to search for.
 * @param threshold The minimum fuzzy match score (out of 100) to include a result.
 * @returns An array of `SimilarOrganizationResult` objects.
 */
export async function findSimilarOrganizationNames(name: string, threshold = 80): Promise<SimilarOrganizationResult[]> {
  if (!name.trim()) return [];

  try {
    // Fetch all organization names and their industries for comparison.
    // We explicitly select only what's needed to keep the data transfer minimal.
    const allOrganizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        industry: {
          select: {
            name: true,
          },
        },
      },
    });

    const results = allOrganizations
      .map((org) => ({
        ...org,
        score: fuzzyMatch(name, org.name), // Calculate fuzzy score
      }))
      .filter((org) => org.score >= threshold) // Filter based on threshold
      .sort((a, b) => b.score - a.score) // Sort by score, highest first
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ score, ...org }) => org); // Remove the score property before returning

    return results;
  } catch (error) {
    console.error("Error finding similar organization names:", error);
    // Return an empty array on error to gracefully handle failures in the UI.
    return [];
  }
}