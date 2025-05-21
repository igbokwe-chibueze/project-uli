// src/features/auth/data/accounts.ts

import {prisma} from "@/lib/prisma/prisma";


export const getAccountByUserId = async (userId: string) => {
    try {
        const account = await prisma.account.findFirst({
            where: { userId }
        });

        return account;
    } catch {
        return null;
    }
};