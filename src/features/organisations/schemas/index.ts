// src/features/organisations/schemas/index.ts

import * as z from "zod";

export const CreateOrganisationSchema = z.object({
    organizationName: z.string().min(1, {
        message: "Organization name is required",
    }).max(100, { message: "Organization name must not be more than 100 characters" }),

    country: z.string().optional(),

    logo: z.union([
      // 1) File branch: do MIME & size checks
      z.instanceof(File)
        .refine(
          file => ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml']
            .includes(file.type),
          { message: "Logo must be JPEG, PNG, GIF, WebP, or SVG" }
        )
        .refine(
          file => file.size <= 3 * 1024 * 1024,
          { message: "Logo file size must be less than 1MB" }
        ),
        // 2) String branch: a valid URL
        z.string().url()
    ]).optional(),
})