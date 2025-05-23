// src/features/auth/actions/login-action.ts
"use server"

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT_URL } from "@/routes";
import { prisma } from "@/lib/prisma/prisma";

import { LoginSchema } from "@/features/auth/schemas";
import { getUserByEmail } from "@/features/auth/data/user";
import { generateTwoFactorToken, generateVerificationToken } from "@/features/auth/lib/tokens";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/features/auth/lib/mail";
import { getTwoFactorTokenByEmail } from "@/features/auth/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/features/auth/data/two-factor-confirmation";

/**
 * Handles user login with optional two-factor authentication and email verification.
 * 
 * @param values - The login form values validated against LoginSchema.
 * @param callbackUrl - Optional URL to redirect after successful login.
 * @returns An object indicating an error, success message, or two-factor requirement.
 */
export const loginAction = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
    // Validate the input values using Zod's safeParse.
    const validatedFields = LoginSchema.safeParse(values);

    // If validation fails, return an error response.
    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }
    
    // Destructure the validated fields.
    const { email, password, code } = validatedFields.data;

    // Retrieve the user record based on the provided email.
    const existingUser = await getUserByEmail(email);

    // If no user is found or missing essential fields, return an error.
    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Invalid credentials!" };
    }

    // Compare the provided password with the hashed password stored in the database.
    const passwordMatches = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatches) {
        return { error: "Invalid credentials*wrong password!" };
    }

    // If the user's email hasn't been verified, send a verification email.
    if (!existingUser.emailVerified) {
        // Generate a new verification token for the user's email.
        const verificationToken = await generateVerificationToken(existingUser.email);

        // Send the verification email with the token.
        await sendVerificationEmail(verificationToken.email, verificationToken.token);

        // Return a success message indicating that a verification email was sent.
        return { success: "Verification email sent!" };
    }

    // If two-factor authentication is enabled for the user.
    if (existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            // If a two-factor code is provided, verify it.

            // Retrieve the two-factor token record by email.
            const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);            

            // If no token is found, return an error.
            if (!twoFactorToken) {
                return { error: "Invalid code!" };
            }

            // Check if the provided code matches the token in the record.
            if (twoFactorToken.token !== code) {
                return { error: "Invalid code**!" };
            }

            // Determine if the token has expired.
            const hasExpired = new Date(twoFactorToken.expires) < new Date();

            if (hasExpired) {
                return { error: "Code has expired!" };
            }

            // Delete the used two-factor token from the database.
            await prisma.twoFactorToken.delete({
                where: {
                    id: twoFactorToken.id,
                },
            });

            // Remove any existing two-factor confirmation record for the user.
            const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

            if (existingConfirmation) {
                await prisma.twoFactorConfirmation.delete({
                    where: {
                        id: existingConfirmation.id,
                    },
                });
            }

            // Create a new two-factor confirmation record for the user.
            await prisma.twoFactorConfirmation.create({
                data: {
                    userId: existingUser.id,
                },
            });
            
        } else {
            // If no two-factor code is provided, generate and send a new two-factor token.
            const twoFactorToken = await generateTwoFactorToken(existingUser.email);

            // Send the two-factor authentication email with the generated token.
            await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

            // Return an object indicating that two-factor authentication is required.
            return { twoFactor: true };
        }
    }
    
    // Try to sign in the user using NextAuth credentials.
    try {
        await signIn("credentials", { 
            email, 
            password, 
            redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT_URL,
        });
    } catch (error) {
        // Handle errors specifically if they are instances of AuthError.
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials!" };
                default:
                    return { error: "Something went wrong!" };
            }
        }

        // Rethrow error if it's not handled, to ensure proper redirection or error propagation.
        // Without this you wont be redirected.
        throw error;
    }
};