// src/features/auth/actions/email-verification-action.ts
"use server";

import { prisma } from "@/lib/prisma/prisma";
import { getUserByEmail } from "@/features/auth/data/user";
import { getVerificationTokenByToken } from "@/features/auth/data/verification-token";


export const emailVerificationAction = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);
    console.log ("Check the token here" + existingToken?.email)

    if (!existingToken) {
        return { error: "Invalid credentials!*no token" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await getUserByEmail(existingToken.email);
    

    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    await prisma.user.update({
        where: {
            id: existingUser.id,
        },
        data: {
            emailVerified: new Date(),
            email: existingToken.email, //useful when user wants to update their email.
        },
    });

    await prisma.verificationTokenCustom.delete({
        where: {
            id: existingToken.id,
        },
    });

    return { success: "Email verified!" };
}

