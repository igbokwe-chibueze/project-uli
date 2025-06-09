// src/features/organisations/actions/updateOrganisationAction.ts
"use server";

import { z } from "zod";

import { UpdateOrganisationSchema } from "@/features/organisations/schemas/updateOrganisationSchema";
import { currentID } from "@/features/auth/lib/authenticate";
import { isUserOrganizationMember } from "@/features/organisations/data/organizations";
import { prisma } from "@/lib/prisma/prisma";
//import { revalidatePath } from "next/cache";


export const updateOrganisationAction = async (
    organisationId: string, 
    values: Partial<z.infer<typeof UpdateOrganisationSchema>> // Accept Partial to only receive changed fields
) => {
    console.log("Server Action: updateOrganisationAction called.");
    console.log("Received organisationId:", organisationId);
    console.log("Received values (from client payload):", values);

    // 1) Validate against UpdateOrganisationSchema (organizationName + ≥1 other field)
    // Note: Since we're passing a partial object, safeParse will still work,
    // but the schema's 'required' fields will only be validated if they are present in 'values'.
    // The client-side form handles the initial required validation.
    const validatedFields = UpdateOrganisationSchema.partial().safeParse(values);
      
    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const data = validatedFields.data;
    console.log("Validated data after partial schema parse:", data);

    // 2) Authenticate user by getting the session Id
    const userId = await currentID();
    if (!userId) {
        return { error: "You must be logged in to update an organisation." };
    }

    // Check if the authenticated user is a member of the organization.
    // If not a member, render a 404-like page with an access denied message.
    const isMember = await isUserOrganizationMember(userId, organisationId);
    // TODO ************ Check role permission (maybe only OWNER Should have access)
    if (!isMember) {
        return { error: "You do not have permission to update this organisation." };
    }

    // 4) Normalize & pick only the fields that are defined
    //  (UpdateOrganisationSchemaBase has: organizationName, country, logo, description, industry, orgType, employeeCountRange, revenueRange)
    const updatePayload: Record<string, unknown> = {};

    // organizationName → name, because the organisation prisma model expects name and not organizationName
    if (typeof data.organizationName === "string") {
        updatePayload.name = data.organizationName;
    }

    // country (string | undefined) → countryId
    if (data.country !== undefined && data.country !== "") {
        updatePayload.countryId = data.country;
    }

    // logo: string URL or File. We want a string URL or leave undefined.
    // let logoUrl: string | undefined = undefined;
    // if (data.logo !== undefined) {
    //     if (typeof data.logo === "string") {
    //         logoUrl = data.logo;
    //     }
    //     // if it's a File, drop it on update (client should have uploaded it already)
    //     if (logoUrl) {
    //         updatePayload.logo = logoUrl;
    //     } else {
    //     // if client passed a File, we simply do not include `logo` in the payload
    //         updatePayload.logo = undefined;
    //     }
    // }

    // If data.logo is provided (either a URL string or empty string),
    // set it explicitly—string stays string, empty string becomes null
    if (data.logo !== undefined) {
        if (typeof data.logo === "string") {
            updatePayload.logo = data.logo.trim() ? data.logo.trim() : null;
        }
        // if it's a File, we assume client never lets raw File through here
    }

    // description → description
    if (data.description !== undefined) {
        updatePayload.description = data.description;
    }

    // industry → industryId
    if (data.industry !== undefined && data.industry !== "") {
        updatePayload.industryId = data.industry;
    }

    // orgType → orgTypeId
    if (data.orgType !== undefined && data.orgType !== "") {
        updatePayload.orgTypeId = data.orgType;
    }

    // employeeCountRange → employeeCountRangeId
    if (data.employeeCountRange !== undefined && data.employeeCountRange !== "") {
        updatePayload.employeeCountRangeId = data.employeeCountRange;
    }

    // revenueRange → revenueRangeId
    if (data.revenueRange !== undefined && data.revenueRange !== "") {
        updatePayload.revenueRangeId = data.revenueRange;
    }

    // If somehow no other key was added (shouldn't happen thanks to .refine in the schema, but just in case), abort
    if (Object.keys(updatePayload).length === 0) {
        return { error: "No changes detected." };
    }

    // 5) Perform the update (Prisma will only touch the keys in `updatePayload`)
    try {
        const updatedOrg = await prisma.organization.update({
            where: { id: organisationId },
            data: updatePayload,
        });

        // Revalidate any cached pages (if you’re using ISR/Next.js cache)
        //revalidatePath(`/organisations/${organisationId}`); // revalidate the details page

        return { success: "Organisation updated successfully.", organisation: updatedOrg.name };
    } catch (err) {
        console.error("Error updating organisation:", err);
        return { error: "Failed to update organisation." };
    }
}
