// src/features/auth/actions/register.ts
"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma/prisma";

import { RegisterSchema } from "@/features/auth/schemas";
import { getUserByEmail } from "@/features/auth/data/user";
import { generateVerificationToken } from "@/features/auth/lib/tokens";
import { sendVerificationEmail } from "@/features/auth/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);
    

    if (existingUser) {
        return { error: "Email already in use!" };
    }

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    // Send verification token email
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    


    return { success: "Confirmation email sent!" };
};