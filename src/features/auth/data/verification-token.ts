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

export const getVerificationTokenByEmail = async (email: string) => {
    try {
        const verificationToken = await prisma.verificationTokenCustom.findFirst({
            where: { email },
        });

        return verificationToken;
    } catch {
        return null;
    }
};
