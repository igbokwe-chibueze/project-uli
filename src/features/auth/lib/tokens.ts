// src/features/auth/lib/tokens.ts

import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// Import the configured Prisma client instance for database interactions.
import { prisma } from "@/lib/prisma/prisma";

// Import helper functions that fetch an existing token (if any) by email
import { getVerificationTokenByEmail } from "@/features/auth/data/verification-token";
import { getPasswordResetTokenByEmail } from "@/features/auth/data/reset-password-token";
import { getTwoFactorTokenByEmail } from "@/features/auth/data/two-factor-token";

/**
 * Generates a new email verification token.
 *
 * - Creates a new UUID as the token.
 * - Sets an expiration time 1 hour from now.
 * - Checks for an existing token in the database for the provided email.
 *   If one exists, it deletes it.
 * - Creates a new verification token record in the database.
 *
 * @param email - The user's email address for which to generate a token.
 * @returns The newly created verification token record.
 */
export const generateVerificationToken = async (email: string) => {
    // Generate a unique token using UUID v4.
    const token = uuidv4();
    // Set expiration time: current time plus 1 hour (3600 seconds * 1000 ms).
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    // Check if a verification token already exists for the given email.
    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
        // Delete the existing token from the database.
        await prisma.verificationTokenCustom.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    // Create a new verification token record in the database.
    const verificationToken = await prisma.verificationTokenCustom.create({
        data: {
            email,  // Associate token with user's email.
            token,  // The generated token string.
            expires, // Expiration time.
        },
    });

    // Return the newly created verification token record.
    return verificationToken;
};


/**
 * Generates a new password reset token.
 *
 * - Creates a new UUID as the token.
 * - Sets an expiration time 1 hour from now.
 * - Checks for an existing password reset token for the provided email.
 *   If one exists, it deletes it.
 * - Creates a new password reset token record in the database.
 *
 * @param email - The user's email address.
 * @returns The newly created password reset token record.
 */
export const generatePasswordResetToken = async (email: string) => {
    // Generate a unique token using UUID v4.
    const token = uuidv4();
    // Set expiration time: 1 hour from the current time.
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    // Retrieve any existing password reset token for this email.
    const existingToken = await getPasswordResetTokenByEmail(email);

    if (existingToken) {
        // Delete the existing password reset token.
        await prisma.passwordResetToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    // Create a new password reset token record in the database.
    const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
            email,   // The user's email.
            token,   // The generated UUID token.
            expires, // Expiration time (1 hour later).
        },
    });

    // Return the created password reset token record.
    return passwordResetToken;
};


/**
 * Generates a new two-factor authentication (2FA) token.
 *
 * - Generates a random numeric token (6 digits) using Node.js crypto.
 *   Note: The numeric range 100_000 to 1_000_000 produces a 6-digit number.
 * - Sets an expiration time 15 minutes from now.
 * - Checks for an existing two-factor token for the given email.
 *   If one exists, it deletes it.
 * - Creates a new two-factor token record in the database.
 *
 * @param email - The user's email address.
 * @returns The newly created two-factor authentication token record.
 */
export const generateTwoFactorToken = async (email: string) => {
    // Generate a 6-digit token as a string. The underscores in numbers help readability.
    const token = crypto.randomInt(100_000, 1_000_000).toString();
    // Set expiration time: current time plus 5 minutes (5 minutes * 60 seconds * 1000 ms).
    const expires = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes

    // Retrieve any existing two-factor token for this email.
    const existingToken = await getTwoFactorTokenByEmail(email);

    if (existingToken) {
        // Delete the existing two-factor token from the database.
        await prisma.twoFactorToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    // Create a new two-factor token record in the database.
    const twoFactorToken = await prisma.twoFactorToken.create({
        data: {
            email,   // Associate the token with the user's email.
            token,   // The generated 6-digit token.
            expires, // Expiration time.
        },
    });

    // Return the newly created two-factor token record.
    return twoFactorToken;
};
