// src/lib/invite-utils.ts

import { randomBytes } from "crypto";
import { InviteExpiryOption } from "@prisma/client";

export const generateTokenHex = (bytes = 48) => {
    return randomBytes(bytes).toString("hex");
}

export const computeExpiryFromOption = (option: InviteExpiryOption) => {
    const now = new Date();

    switch (option) {
        case "HOURS_24":
            now.setHours(now.getHours() + 24);
            return now;
        
        case "DAYS_7":
            default:
            now.setDate(now.getDate() + 7);
            return now;

        case "DAYS_30":
            now.setDate(now.getDate() + 30);
            return now;
    }
}

// Convert the Prisma enum "InviteExpiryOption" to an array
export const expiryOptions = Object.values(InviteExpiryOption);

//Create a human-friendly label mapper
export const expiryLabels: Record<InviteExpiryOption, string> = {
    HOURS_24: "24 Hours",
    DAYS_7: "7 Days",
    DAYS_30: "30 Days",
};

/**
 * Formatter helper (UI + Email)
 */
export function formatInviteExpiry(option: InviteExpiryOption): string {
  return expiryLabels[option] ?? "Unknown duration";
}