// src/features/organisations/actions/deleteOrganisationAction.ts

"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma/prisma";
import { OrgRole } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { currentID } from "@/features/auth/lib/authenticate";
import { isUserOrganizationMember } from "@/features/organisations/data/organizations";

export const deleteOrganisationAction = async (organisationId: string) => {
    // 1) Authenticate user by session
    const userId = await currentID();
    if (!userId) {
        return { error: "You must be logged in to delete an organisation." };
    }

    // 2) Authorization: ensure user is a member of this org (and perhaps an admin/owner)
    // For deletion, you might want a stricter check, e.g., only the owner can delete.
    // For simplicity, we'll reuse isUserOrganizationMember for now, but consider
    // adding a check for the user's role within the organization.
    const isMember = await isUserOrganizationMember(userId, organisationId);
    if (!isMember) {
        return { error: "You do not have permission to delete this organisation." };
    }

    // Optional: Add an extra check to ensure only the creator/owner can delete
    // This would require fetching the organization and checking its 'createdById' or similar
    try {
        const orgMember = await prisma.organizationMember.findUnique({
            where: {
                orgId_userId: { // Unique constraint allows fetching by composite key
                    orgId: organisationId,
                    userId: userId,
                },
            },
            select: {
                role: true,
            },
        });

        if (!orgMember) {
            return { error: "You are not a member of this organisation." };
        }

        if (orgMember.role !== OrgRole.OWNER) { // Check if the role is OWNER
            return { error: "Only the organisation owner can delete this organisation." };
        }

    } catch (error) {
        console.error("Error during organisation deletion authorization:", error);
        return { error: "An error occurred during authorization check." };
    }


    // 3) Perform the deletion within a transaction for safety
    try {
        await prisma.$transaction(async (tx) => {
        // It's good practice to explicitly delete related records if not handled by CASCADE
        // based on your Prisma schema. For Organization, many relations have onDelete: Cascade,
        // but explicitly deleting members/invites might be clearer if issues arise.
        // Given your schema, `onDelete: Cascade` on OrganizationMember for `orgId` means
        // members associated with the organization will be deleted.
        // However, for other relations like `OrganizationSocialLink`, `OrganizationLanguage`, etc.,
        // ensure they are either configured with `onDelete: Cascade` or handled here.
        // For simplicity, we'll assume `onDelete: Cascade` handles most direct relations from `Organization`.
        
            // Delete the organization
            await tx.organization.delete({
                where: { id: organisationId },
            });
        });

        // 4) Revalidate paths and redirect
        revalidatePath("/organisations"); // Revalidate the list of organisations
        return { success: "Organisation deleted successfully."};

    } catch (err) {
        console.error("Error deleting organisation:", err);
        
        // Check if the error is a PrismaClientKnownRequestError and then access its code
        if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
                // P2025 is typically "An operation failed because it depends on one or more records that were required but not found."
                // This is good for 'record not found' when trying to delete.
                return { error: "Organisation not found or already deleted." };
            }
            // You can add more specific Prisma error handling here if needed
            // For example, P2003 for foreign key constraint failed
            // if (err.code === 'P2003') {
            //     return { error: "Cannot delete organisation due to related records." };
            // }
        }
        // Catch-all for other potential database errors (e.g., foreign key constraints if not cascaded)
        return { error: "Failed to delete organisation. Please ensure all related data is removed or properly cascaded." };
    }
            
        
};