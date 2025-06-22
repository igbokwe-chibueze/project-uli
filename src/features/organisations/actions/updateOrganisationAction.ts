// src/features/organisations/actions/updateOrganisationAction.ts
"use server";

import { z } from "zod";

import { UpdateOrganisationSchema } from "@/features/organisations/schemas";
import { currentID } from "@/features/auth/lib/authenticate";
import { isUserOrganizationMember } from "@/features/organisations/data/organizations";
import { prisma } from "@/lib/prisma/prisma";

export const updateOrganisationAction = async (
    organisationId: string,
    values: Partial<z.infer<typeof UpdateOrganisationSchema>> // Accept Partial to only receive changed fields
) => {

    // 1) Validate incoming fields against the UpdateOrganisationSchema
    const validated = UpdateOrganisationSchema.safeParse(values);
    if (!validated.success) {
        return { error: "Invalid fields!", details: validated.error.format() };
    }
    const data = validated.data;

    // 2) Authenticate user by session
    const userId = await currentID();
    if (!userId) {
        return { error: "You must be logged in to update an organisation." };
    }

    // 3) Authorization: ensure user is a member of this org
    const isMember = await isUserOrganizationMember(userId, organisationId);
    if (!isMember) {
        return { error: "You do not have permission to update this organisation." };
    }

    // 4) Build Prisma update payload with only defined fields
    const updatePayload: Record<string, unknown> = {};

    // Map form keys to Prisma fields
    if (typeof data.organizationName === "string") {
        updatePayload.name = data.organizationName;
    }
    if (data.country !== undefined && data.country !== "") {
        updatePayload.countryId = data.country;
    }
    if (data.state !== undefined && data.state !== "") {
        updatePayload.stateId = data.state;
    }
    if (data.logo !== undefined) {
        updatePayload.logo = data.logo === "" ? null : data.logo;
    }
    if (data.description !== undefined) {
        updatePayload.description = data.description;
    }
    if (data.industry !== undefined && data.industry !== "") {
        updatePayload.industryId = data.industry;
    }
    if (data.orgType !== undefined && data.orgType !== "") {
        updatePayload.orgTypeId = data.orgType;
    }
    if (data.employeeCountRange !== undefined && data.employeeCountRange !== "") {
        updatePayload.employeeCountRangeId = data.employeeCountRange;
    }
    if (data.revenueRange !== undefined && data.revenueRange !== "") {
        updatePayload.revenueRangeId = data.revenueRange;
    }


    if (data.website !== undefined && data.website !== "") {
        updatePayload.website = data.website;
    }
    if (data.primaryEmail !== undefined && data.primaryEmail !== "") {
        updatePayload.primaryEmail = data.primaryEmail;
    }
    if (data.alternateEmail !== undefined && data.alternateEmail !== "") {
        updatePayload.alternateEmail = data.alternateEmail;
    }
    if (data.phoneNumber !== undefined && data.phoneNumber !== "") {
        updatePayload.phoneNumber = data.phoneNumber;
    }
    if (data.alternatePhoneNumber !== undefined && data.alternatePhoneNumber !== "") {
        updatePayload.alternatePhoneNumber = data.alternatePhoneNumber;
    }
    if (data.taxId !== undefined && data.taxId !== "") {
        updatePayload.taxId = data.taxId;
    }
    if (data.registrationNumber !== undefined && data.registrationNumber !== "") {
        updatePayload.registrationNumber = data.registrationNumber;
    }
    if (data.foundedYear !== undefined ) {
        updatePayload.foundedYear = data.foundedYear;
    }
    if (data.colorScheme !== undefined && data.colorScheme !== "") {
        updatePayload.colorScheme = data.colorScheme;
    }
    if (data.streetAddress1 !== undefined && data.streetAddress1 !== "") {
        updatePayload.streetAddress1 = data.streetAddress1;
    }
    if (data.streetAddress2 !== undefined && data.streetAddress2 !== "") {
        updatePayload.streetAddress2 = data.streetAddress2;
    }

    if (data.isPublicProfile !== undefined) {
        updatePayload.isPublicProfile = data.isPublicProfile;
    }
    if (data.allowContact !== undefined) {
        updatePayload.allowContact = data.allowContact;
    }
    if (data.showRevenue !== undefined) {
        updatePayload.showRevenue = data.showRevenue;
    }
    if (data.newsletterSubscription !== undefined) {
        updatePayload.newsletterSubscription = data.newsletterSubscription;
    }
    if (data.socialMediaLinks !== undefined) {
        updatePayload.socialMediaLinks = data.socialMediaLinks;
    }
    if (data.operationalHours !== undefined) {
        updatePayload.operationalHours = data.operationalHours;
    }

    const langIds = data.languages; // string[] | undefined

    // Abort if nothing to update
    if (Object.keys(updatePayload).length === 0 && !langIds) {
        return { error: "No changes detected. Please edit at least one field." };
    }

    // Perform update within a transaction for safety
    try {
    const updatedOrg = await prisma.$transaction(async (tx) => {
      // 1) Update scalar fields on the org
      const orgUpdate = tx.organization.update({
        where: { id: organisationId },
        data: { ...updatePayload },
      });

      // 2) If languages were provided, replace the join‑table rows
      let langUpdate;
      if (langIds) {
        // remove all old links
        const deleteOld = tx.organizationLanguage.deleteMany({
          where: { orgId: organisationId },
        });

        // insert the new ones
        const createNew = tx.organizationLanguage.createMany({
          data: langIds.map((languageId) => ({
            orgId: organisationId,
            languageId,
          })),
        });

        // await them in parallel
        langUpdate = Promise.all([deleteOld, createNew]);
      }

      // wait for both
      const [org] = await Promise.all([orgUpdate, langUpdate]);
      return org;
    });

    return { success: "Organisation updated successfully.", organisation: updatedOrg };
  } catch (err) {
    console.error("Error updating organisation:", err);
    return { error: "Failed to update organisation." };
  }

};
