// src/features/user/actions/deleteUserAction.ts
"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma/prisma";

export const deleteUserAction = async (userId: string) => {

    // Perform the deletion within a transaction for safety
    try {
        await prisma.$transaction(async (tx) => {
        
            // Delete the organization
            await tx.user.delete({
                where: { id: userId },
            });
        });

        // 4) Revalidate paths and redirect
        revalidatePath("/user"); // Revalidate the list of user
        return { success: "User deleted successfully."};

    } catch (err) {
        console.error("Error deleting user:", err);

        // Catch-all for other potential database errors (e.g., foreign key constraints if not cascaded)
        return { error: "Failed to delete user. Please ensure all related data is removed or properly cascaded." };
    }
}
