// src/features/user/actions/updateUserAction.ts
"use server";

import { z } from "zod"
import { prisma } from "@/lib/prisma/prisma";

import { revalidatePath } from "next/cache";

import { UpdateUserSchema } from "@/features/user/schemas"


export const updateUserAction = async (
  userId: string,
  values: Partial<z.infer<typeof UpdateUserSchema>> // Accept Partial to only receive changed fields
) => {
  // 1) Validate incoming fields against the UpdateUserSchema
  const validated = UpdateUserSchema.safeParse(values);
  if (!validated.success) {
    return { error: "Invalid fields!", details: validated.error.format() };
  }
  const data = validated.data;

  // 2) Authenticate user by session
  if (!userId) {
    return { error: "You must be logged in." };
  }

  // 3) Build Prisma update payload with only defined fields
  const updatePayload: Record<string, unknown> = {};

  // Map form keys to Prisma fields
  if (typeof data.firstName=== "string") {
    updatePayload.firstName = data.firstName;
  }
  if (typeof data.surname=== "string") {
    updatePayload.lastname = data.surname;
  }
  if (typeof data.otherName=== "string") {
    updatePayload.otherName = data.otherName;
  }
  if (typeof data.userName=== "string") {
    updatePayload.userName = data.userName;
  }
  if (typeof data.gender=== "string") {
    updatePayload.gender = data.gender;
  }


  if (data.email !== undefined && data.email !== "") {
    updatePayload.email = data.email;
  }
  if (data.phoneNumber !== undefined && data.phoneNumber !== "") {
    updatePayload.phoneNumber = data.phoneNumber;
  }
  if (data.website !== undefined && data.website !== "") {
    updatePayload.website = data.website;
  }
  if (data.bio !== undefined && data.bio !== "") {
    updatePayload.bio = data.bio;
  }


  if (data.country !== undefined && data.country !== "") {
    updatePayload.countryId = data.country;
  }
  if (data.state !== undefined && data.state !== "") {
    updatePayload.stateId = data.state;
  }
  if (data.streetAddress1 !== undefined && data.streetAddress1 !== "") {
    updatePayload.streetAddress1 = data.streetAddress1;
  }
  if (data.streetAddress2 !== undefined && data.streetAddress2 !== "") {
    updatePayload.streetAddress2 = data.streetAddress2;
  }

  if (data.image !== undefined) {
    updatePayload.image = data.image === "" ? null : data.image;
  }
  if (data.bannerImage !== undefined) {
    updatePayload.bannerImage = data.bannerImage === "" ? null : data.bannerImage;
  }

  if (data.isActive !== undefined) {
    updatePayload.isActive = data.isActive;
  }
  if (data.isTwoFactorEnabled !== undefined) {
    updatePayload.isTwoFactorEnabled = data.isTwoFactorEnabled;
  }
  if (data.loginAlertsEnabled !== undefined) {
    updatePayload.loginAlertsEnabled = data.loginAlertsEnabled;
  }

  //handle social media links
  
  const langIds = data.languages; // string[] | undefined

  // Abort if nothing to update
  if (Object.keys(updatePayload).length === 0 && !langIds) {
    return { error: "No changes detected. Please edit at least one field." };
  }

    // Perform update within a transaction for safety
    try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1) Update scalar fields on the user
      const userUpdate = tx.user.update({
        where: { id: userId },
        data: { ...updatePayload },
      });

      // 2) If languages were provided, replace the join‑table rows
      let langUpdate;
      if (langIds) {
        // remove all old links
        const deleteOld = tx.userLanguage.deleteMany({
          where: { userId: userId },
        });

        // insert the new ones
        const createNew = tx.userLanguage.createMany({
          data: langIds.map((languageId) => ({
            userId: userId,
            languageId,
          })),
        });

        // await them in parallel
        langUpdate = Promise.all([deleteOld, createNew]);
      }

      // wait for both
      const [user] = await Promise.all([userUpdate, langUpdate]);
      return user;
    });

    revalidatePath(`/user/${userId}`);
    revalidatePath(`/user/${userId}/details`);
    
    return { success: "User updated successfully.", user: updatedUser };
  } catch (err) {
    console.error("Error updating user:", err);
    return { error: "Failed to update user." };
  }

}
