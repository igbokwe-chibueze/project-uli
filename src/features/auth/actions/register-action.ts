// src/features/auth/actions/register-action.ts
"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma/prisma";

import { RegisterSchema } from "@/features/auth/schemas";
import { getUserByEmail } from "@/features/auth/data/user";
import { generateVerificationToken } from "@/features/auth/lib/tokens";
import { DevMailResult, sendVerificationEmail } from "@/features/auth/lib/mail";

export const registerAction = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, firstName, lastName, username, gender } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);
    

    if (existingUser) {
        return { error: "Email already in use!" };
    }

    await prisma.user.create({
        data: {
            firstName,
            lastName,
            username,
            gender,
            email,
            password: hashedPassword,
        },
    });

    // Send verification token email
    //I used this before i was doing the dev or prod environment check
    // const verificationToken = await generateVerificationToken(email);
    // await sendVerificationEmail(verificationToken.email, verificationToken.token);

    // Send verification token email
    const { email: userEmail, token } = await generateVerificationToken(email);
    const mailResult = await sendVerificationEmail(userEmail, token);

    // If dev, send back the link so the client can show a modal
    if (mailResult && "confirmLink" in mailResult) {
        const { confirmLink } = mailResult as DevMailResult;
        return { success: "Dev mode - copy this link to verify:", confirmLink };
    }

    return { success: "Confirmation email sent!" };
};