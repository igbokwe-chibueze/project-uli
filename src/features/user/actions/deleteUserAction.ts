// src/features/user/actions/deleteUserAction.ts
"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import { getUserById } from "@/features/auth/data/user";

export const deleteUserAction = async (userId: string, password: string) => {
    try {
        // Authenticate user by session
        if (!userId) {
            return { error: "You must be logged in." };
        }

        // Retrieve the user record from the database.
        const user = await getUserById(userId);
        
        // If no corresponding user is found in the database, return an error.
        if (!user || !user.password) {
            return { error: "Unauthorized!" };
        }

        // Compare the provided current password with the stored hashed password.
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { error: "Invalid password!" };
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.delete({ where: { id: userId } });
        });

        revalidatePath("/user");
        return { success: "User deleted successfully." };
    } catch (err) {
        console.error("Error deleting user:", err);
        return { error: "Failed to delete user. Please try again later." };
    }
};
