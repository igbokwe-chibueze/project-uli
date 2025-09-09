// src/features/organisations/actions/createOrganisationAction.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma/prisma";
import { ModuleType } from '@prisma/client';

import { currentID } from "@/features/auth/lib/authenticate";
import { CreateOrganisationSchema } from "@/features/organisations/schemas";

export const createOrganisationAction = async (values: z.infer<typeof CreateOrganisationSchema>) => {
    
    const validatedFields = CreateOrganisationSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { organizationName, country, state, logo } = validatedFields.data;

    //Ensure user is authenticated
    const userId = await currentID();
    if (!userId) {
        return { error: "You must be logged in to create an organization." };
    }

    // Normalize logo into a string URL (or undefined)
    const logoUrl: string | undefined =
        typeof logo === "string" ? logo : undefined;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Step 1: Create the new organization
            const organization = await tx.organization.create({
                data: {
                    name: organizationName,
                    // — only connect the existing Country record by its ID when a valid country ID is present:
                    ...(country && {country: { connect: { id: country } }}),
                    // only connect state when a valid state ID is present
                    ...(state && { state: { connect: { id: state } } }),
                    logo: logoUrl,
                    members: {
                        create: {
                            userId: userId,
                            role: "OWNER",
                        },
                    },
                },
            });

            // Step 2: Find the HRMS module to install
            const hrmsModule = await tx.module.findUnique({
                where: { type: ModuleType.HRMS },
            });

            if (!hrmsModule) {
                // If HRMS module doesn't exist, throw an error to roll back the transaction
                throw new Error("HRMS module not found in the database. Cannot create organization without it.");
            }

            // Step 3: Install the HRMS module for the new organization
            await tx.organizationModule.create({
                data: {
                    orgId: organization.id,
                    moduleId: hrmsModule.id,
                    isEnabled: true, // Set to true by default
                },
            });

            return organization;
        });

        return { success: "Organization created successfully!", organizationId: result.id };
    } catch (error) {
        console.error("Error creating organization with default module:", error);
        if (error instanceof Error) {
            return { error: `Failed to create organization: ${error.message}` };
        }
        return { error: "An unexpected error occurred during organization creation." };
    }
};