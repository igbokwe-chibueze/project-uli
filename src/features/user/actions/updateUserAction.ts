// src/features/user/actions/updateUserAction.ts
"use server";

import { z } from "zod"
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/prisma";

import { revalidatePath } from "next/cache";

import { UpdateUserSchema } from "@/features/user/schemas"
import { generateVerificationToken } from "@/features/auth/lib/tokens";
import { getUserByEmail, getUserById } from "@/features/auth/data/user";
import { DevMailResult, sendVerificationEmail } from "@/features/auth/lib/mail";


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

  // Retrieve the user record from the database.
  const dbUser = await getUserById(userId);
  
  // If no corresponding user is found in the database, return an error.
  if (!dbUser) {
    return { error: "Unauthorized!" };
  }

  if (!dbUser.password) {
    // This is an OAuth-only user — prevent sensitive changes
    data.email = undefined;
    data.password = undefined;
    values.newPassword = undefined;
    data.confirmNewPassword = undefined;
    data.isTwoFactorEnabled = undefined;
    // optionally: lock other fields you don’t want OAuth users to change
  }

  // Map form keys to Prisma fields
  if (typeof data.firstName=== "string") {
    updatePayload.firstName = data.firstName;
  }
  if (typeof data.lastName=== "string") {
    updatePayload.lastName = data.lastName;
  }
  if (typeof data.otherName=== "string") {
    updatePayload.otherName = data.otherName;
  }

  if (typeof data.username=== "string") {
    // Check if username is used by another user
    const existingUserName = await prisma.user.findFirst({
      where: {
        username: {
          equals: data.username,
          mode: "insensitive", // makes it case-insensitive
        },
        NOT: { id: userId },
      },
      select: { id: true },
    });

    if (existingUserName) {
      return { error: "Username already in use by another account." };
    }
    updatePayload.username = data.username;
  }

  if (typeof data.gender=== "string") {
    updatePayload.gender = data.gender;
  }

  if (data.phoneNumber !== undefined && data.phoneNumber !== "") {
    updatePayload.phoneNumber = data.phoneNumber;
  }
  if (data.bio !== undefined && data.bio !== "") {
    updatePayload.bio = data.bio;
  }
  if (data.website !== undefined && data.website !== "") {
    updatePayload.website = data.website;
  }

  // Process email update:
  let emailChanged = false;
  if (data.email !== undefined && data.email !=="" && dbUser.password) {

    // Ensure password is provided
    if (!data.password) {
      return { error: "Password is required to change email." };
    }
    
    // Compare the provided current password with the stored hashed password.
    const passwordMatch = await bcrypt.compare(data.password, dbUser.password);
    if (!passwordMatch) {
      return { error: "Invalid password!" };
    }

    // Check if email is used by a user
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      return { error: "Email already in use." };
    };

    updatePayload.pendingEmail = data.email;

    emailChanged = true;
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

    // If a email change occurred, send a confirmation email.
    if (emailChanged && data.email !== undefined && data.email !=="") {
      const newEmail = data.email;

      // Generate a verification token for the new email.
      const { email: userNewEmail, token } = await generateVerificationToken(newEmail, "EMAIL_UPDATE");
      // Send a verification email to the new email address.
      const mailResult = await sendVerificationEmail(userNewEmail, token);

      // If dev, send back the link so the client can show a modal
      if (mailResult && "confirmLink" in mailResult) {
        const { confirmLink } = mailResult as DevMailResult;
        return { success: "Dev mode - copy this link to verify:", confirmLink };
      }
    }

    revalidatePath(`/user/${userId}`);
    revalidatePath(`/user/${userId}/details`);
    
    return { success: "User updated successfully.", user: updatedUser };
  } catch (err) {
    console.error("Error updating user:", err);
    return { error: "Failed to update user." };
  }

}
