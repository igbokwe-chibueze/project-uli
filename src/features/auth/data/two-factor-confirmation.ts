// src/features/auth/data/two-factor-confirmation.ts

import {prisma} from "@/lib/prisma/prisma";

/**
 * Retrieves a two-factor confirmation record from the database by user ID.
 *
 * This function uses Prisma's findUnique method to look up a two-factor confirmation
 * associated with a specific user. If the query fails or no record is found, it returns null.
 *
 * @param userId - The unique identifier of the user.
 * @returns The two-factor confirmation record, or null if not found or if an error occurs.
 */
export const getTwoFactorConfirmationByUserId = async (userId: string) => {
    try {
        // Attempt to find the two-factor confirmation record matching the given userId.
        const twoFactorConfirmation = await prisma.twoFactorConfirmation.findUnique({
            where: { userId },
        });

        // Return the found record (or undefined if no record exists).
        return twoFactorConfirmation;
    } catch {
        // If any error occurs during the database query, return null.
        return null;
    }
};
