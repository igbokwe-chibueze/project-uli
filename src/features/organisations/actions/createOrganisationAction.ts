// src/features/organisations/actions/createOrganisationAction.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma/prisma";

import { currentUser } from "@/features/auth/lib/authenticate";
import { CreateOrganisationSchema } from "@/features/organisations/schemas";

export const createOrganisationAction = async (values: z.infer<typeof CreateOrganisationSchema>) => {
    const validatedFields = CreateOrganisationSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { organizationName, country, state, logo } = validatedFields.data;

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
            // — only connect the existing Country record by its ID when a valid country ID is present:
            ...(country && {country: { connect: { id: country } }}),
            // only connect state when a valid state ID is present
            ...(state && { state: { connect: { id: state } } }),
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