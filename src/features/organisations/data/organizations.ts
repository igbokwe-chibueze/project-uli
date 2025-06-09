// src/features/organisations/data/organizations.ts
import "server-only";

import { prisma } from "@/lib/prisma/prisma";

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

/**
 * Fetch a single organization by its ID.
 */
export const getOrganisationById = async (id: string) => {
    try {
        return await prisma.organization.findUnique({ where: { id } });
    } catch (err) {
        console.error("Error fetching organisation", { id, err });
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