// src/features/auth/actions/email-verification-action.ts
"use server";

import { prisma } from "@/lib/prisma/prisma";
import { getUserByEmail } from "@/features/auth/data/user";
import { getVerificationTokenByToken } from "@/features/auth/data/verification-token";


export const emailVerificationAction = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
        return { error: "Invalid credentials!*no token" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }


    let existingUser

    if (existingToken.type === "REGISTRATION") {
        // fetch user by email (initial registration flow)
        existingUser = await getUserByEmail(existingToken.email);
    }

    if (existingToken.type === "EMAIL_UPDATE") {
        // fetch user by pendingEmail (email update flow)
        existingUser = await prisma.user.findFirst({
            where: { pendingEmail: existingToken.email },
        });
    }    

    if (!existingUser) {
        return { error: "Email does not exist!!" };
    }

    // Use a transaction to ensure both updates happen or none do
    await prisma.$transaction([

        prisma.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                emailVerified: new Date(),
                // Only for EMAIL_UPDATE, apply these changes:
                ...(existingToken.type === "EMAIL_UPDATE" && {
                    email: existingToken.email,
                    pendingEmail: null,
                }),
            },
        }),

        prisma.verificationTokenCustom.delete({
            where: {
                id: existingToken.id,
            },
        }),
    ]);

    return { success: "Email verified!", type: existingToken.type };
}

