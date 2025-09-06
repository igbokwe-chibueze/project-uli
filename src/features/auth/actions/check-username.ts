// src/features/auth/actions/check-username.ts
"use server";

import { prisma } from "@/lib/prisma/prisma";

export const checkUsername = async (username: string) => {
  if (!username) {
    return { available: false, message: "Username is required" };
  }

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    return { available: false, message: "Username already taken" };
  }

  return { available: true, message: "Username available" };
};
