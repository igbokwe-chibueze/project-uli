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
                country: true, // Includes the related country data
                state: true,   // Includes the related state data
                // userLanguages: {
                //     include: {
                //         language: true, // Includes the related language data for each user language entry
                //     },
                // },
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

