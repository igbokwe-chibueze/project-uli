// src/features/auth/lib/requireUserID.ts
import { redirect } from "next/navigation";
import { currentID } from "@/features/auth/lib/authenticate";

/**
 * Ensures a user is logged in.
 * Returns the user's ID if logged in.
 * Otherwise, redirects to /access
 */
export const requireUserID = async (): Promise<string> => {
  const userID = await currentID();
  if (!userID) redirect("/access");
  return userID;
};
