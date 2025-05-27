// src/features/organisations/data/organizations.ts

import { prisma } from "@/lib/prisma/prisma";

export const getOrganizationsForUser = async(userId: string) => {
    try {
        const memberships = await prisma.organizationMember.findMany({
            where: { userId },
            include: { organization: true },
        });
        
        return memberships;
    } catch (error) {
        console.error("Error fetching organizations for user", { userId, error });
        // return an empty array so callers can still do `.length` checks
        return [];
    }
}