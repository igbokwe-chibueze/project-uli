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
export type OrganisationSummaryType = Pick<Organization, 'id' | 'name'> & {
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