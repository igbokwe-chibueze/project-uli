// src/features/auth/actions/complete-password-reset-action.ts
"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/prisma";

import { CompletePasswordResetSchema } from "@/features/auth/schemas";
import { getPasswordResetTokenByToken } from "@/features/auth/data/reset-password-token";
import { getUserByEmail } from "@/features/auth/data/user";
import { sendPasswordChangeConfirmationEmail } from "@/features/auth/lib/mail";

export const CompletePasswordResetAction = async (values: z.infer<typeof CompletePasswordResetSchema>, token: string) => {

    const validatedFields = CompletePasswordResetSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { password } = validatedFields.data;

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return { error: "Invalid Credentials!*Email does not exist!" };
    }

    // Check if the new password is the same as the current password.
    const isSamePassword = await bcrypt.compare(password, existingUser.password!);
    if (isSamePassword) {
        return { error: "You cannot use the same password. Please choose a new one." };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: {
            id: existingUser.id,
        },
        data: {
            password: hashedPassword,
            passwordChangedAt: new Date(), // Update passwordChangedAt here
        },
    });

    await prisma.passwordResetToken.delete({
        where: {
            id: existingToken.id,
        },
    });

    await sendPasswordChangeConfirmationEmail(existingUser.email);

    return { success: "Password updated! Return to login" };
}
