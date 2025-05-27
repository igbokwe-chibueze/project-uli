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

    const { organizationName, description, industry, country, logo } = validatedFields.data;

    // Upload logo if provided
    let logoUrl: string | undefined;
    if (logo) {
        //const buffer = Buffer.from(await logo.arrayBuffer());
        // logoUrl = await uploadImage(buffer, { resource_type: 'image' });
        logoUrl = "https://upload";
    }

    //Ensure user is authenticated
    const user = await currentUser();

    if (!user?.id) {
        return { error: "You must be logged in to create an organization." };
    }

    // const organization = await prisma.organization.create({
    //     data: {
    //         name: organizationName,
    //         description,
    //         industry,
    //         country,
    //         logo: logoUrl,
    //         members: {
    //             create: {
    //                 userId: user.id,
    //                 role:   "OWNER",
    //             },
    //         },
    //     },
    // });
    console.log("Creating organization with data:", {
        name: organizationName,
        description,
        industry,
        country,
        logo,
        ownerId: user.id,
    });

    return { success: "Organization logged successfully!" };

    //return { success: "Organization created successfully!", organizationId: organization.id};
}