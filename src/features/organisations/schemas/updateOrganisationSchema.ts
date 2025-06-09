// src/features/organisations/schemas/updateOrganisationSchema.ts

import { z } from "zod";

/** 1) Define the “shape” of the object first, without the refinement. */
export const UpdateOrganisationSchema = z.object({
  organizationName: z
    .string()
    .min(1, { message: "Organization name is required" })
    .max(100, { message: "Organization name must not be more than 100 characters" }),

  country: z.string().optional(),

  logo: z
    .union([

        z
            .instanceof(File)
            .refine(
            (file) =>
                ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"].includes(
                file.type
                ),
            { message: "Logo must be JPEG, PNG, GIF, WebP, or SVG" }
            )
            .refine((file) => file.size <= 3 * 1024 * 1024, {
            message: "Logo file size must be less than 3 MB",
            }),
            // Allow string values; transform empty string to undefined
        z.string().url().transform((value) => value === "" ? undefined : value),
    ])
    .optional(),

  description: z
    .string()
    .max(1000, { message: "Description must be 1000 chars or fewer" })
    .optional(),

  industry: z.string().optional(),
  orgType: z.string().optional(),
  employeeCountRange: z.string().optional(),
  revenueRange: z.string().optional(),
});
