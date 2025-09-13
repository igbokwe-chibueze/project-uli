// src/features/auth/data/user.ts

import {prisma} from "@/lib/prisma/prisma";

export const getUserByEmail = async (email: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        return user;
    } catch {
        return null;
    }
};

export const getUserById = async (id: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                country: { select: { id: true, } }, // Includes the related country data
                state: { select: { id: true, } }, // Includes the related state data
                userLanguages: {
                    select: {
                        language: {
                            select: { id: true, name: true, countryCode: true, },
                        },
                    },
                },
            },
        });

        return user;
    } catch {
        return null;
    }
};

