// src/features/auth/actions/initiate-password-reset-action.ts
"use server";

import * as z from "zod";
import { getUserByEmail } from "@/features/auth/data/user";
import { generatePasswordResetToken } from "@/features/auth/lib/tokens";
import { sendPasswordResetEmail } from "@/features/auth/lib/mail";
import { InitiatePasswordResetSchema } from "@/features/auth/schemas";

export const InitiatePasswordResetAction = async (values: z.infer<typeof InitiatePasswordResetSchema>) => {
  const validatedFields = InitiatePasswordResetSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid email!" };
    }

    const { email } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
        //An error message should have been sent here, but we dont want hackers to know guess a real users mail,
        //....so any mail entered we would show a success message but without sending any token.
        //For development, i have add ** to let me know that this is actually an error message.
        return { success: "Reset email sent**!" };
        // return { error: "Email not found!" };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token
    );

    return { success: "Reset email sent! Check your email" };
}
