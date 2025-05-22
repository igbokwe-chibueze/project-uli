// src/features/auth/data/two-factor-token.ts

// Import the configured Prisma client from your local library,
// which is used to interact with the database.
import { prisma } from "@/lib/prisma/prisma";

/**
 * Retrieves a two-factor authentication token record by its token value.
 *
 * This function queries the "twoFactorToken" table in the database to find a unique record
 * that matches the provided token. If the token is found, it returns the record;
 * otherwise, or if an error occurs during the query, it returns null.
 *
 * @param token - The token string to look up in the database.
 * @returns The two-factor token record if found; otherwise, null.
 */
export const getTwoFactorTokenByToken = async (token: string) => {
    try {
        // Use Prisma's findUnique to search for a record where the token field matches the given token.
        const twoFactorToken = await prisma.twoFactorToken.findUnique({
            where: { token },
        });

        // Return the found token record (or undefined if not found, but we simply return it).
        return twoFactorToken;
    } catch {
        // If any error occurs (e.g., database connection issue), return null.
        return null;
    }
};


/**
 * Retrieves a two-factor authentication token record by the user's email.
 *
 * This function uses Prisma's findFirst method to search for a token record in the "twoFactorToken"
 * table that matches the provided email. This is useful in cases where a user might have one active token.
 * If found, it returns the token record; if not, or if an error occurs, it returns null.
 *
 * @param email - The email address associated with the token.
 * @returns The two-factor token record if found; otherwise, null.
 */
export const getTwoFactorTokenByEmail = async (email: string) => {
    try {
        // Use Prisma's findFirst to retrieve the first record matching the given email.
        const twoFactorToken = await prisma.twoFactorToken.findFirst({
            where: { email },
        });

        // Return the found token record.
        return twoFactorToken;
    } catch {
        // If an error occurs during the query, return null.
        return null;
    }
};
