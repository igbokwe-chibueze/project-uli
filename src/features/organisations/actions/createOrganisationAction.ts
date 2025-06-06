// src/features/organisations/actions/createOrganisationAction.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma/prisma";
import { CreateOrganisationSchema } from "@/features/organisations/schemas";
import { currentUser } from "@/features/auth/lib/authenticate";

export const createOrganisationAction = async (values: z.infer<typeof CreateOrganisationSchema>) => {
    const validatedFields = CreateOrganisationSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { organizationName, country, logo } = validatedFields.data;

    //Ensure user is authenticated
    const user = await currentUser();
    if (!user?.id) {
        return { error: "You must be logged in to create an organization." };
    }

    // Normalize logo into a string URL (or undefined)
    // After client‐side upload, logo should already be a string.
    // If something slipped through as a File, we drop it.
    const logoUrl: string | undefined =
        typeof logo === "string" ? logo : undefined;

    const organization = await prisma.organization.create({
        data: {
            name: organizationName,
            // If country is undefined or empty string, Prisma will set countryId = null
            countryId: country || undefined,
            logo: logoUrl,
            members: {
                create: {
                    userId: user.id,
                    role:   "OWNER",
                },
            },
        },
    });

    return { success: "Organization created successfully!", organizationId: organization.id};
}