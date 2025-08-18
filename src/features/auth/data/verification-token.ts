// src/features/auth/data/verification-token.ts

import { prisma } from "@/lib/prisma/prisma";

export const getVerificationTokenByToken = async (token: string) => {
    try {
        const verificationToken = await prisma.verificationTokenCustom.findUnique({
            where: { token },
        });

        return verificationToken;
    } catch {
        return null;
    }
};

export const getVerificationTokenByEmail = async (
    email: string,
    type?: "REGISTRATION" | "EMAIL_UPDATE"
) => {
    try {
        const verificationToken = await prisma.verificationTokenCustom.findFirst({
            where: { 
                email, 
                ...(type && { type }), // only apply type filter if provided
            },
        });

        return verificationToken;
    } catch {
        return null;
    }
};
