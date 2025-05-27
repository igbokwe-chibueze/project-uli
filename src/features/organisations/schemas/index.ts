// src/features/organisations/schemas/index.ts

import * as z from "zod";

export const CreateOrganisationSchema = z.object({
    organizationName: z.string().min(1, {
        message: "Organization name is required",
    }).max(100, { message: "Organization name must not be more than 100 characters" }),
    description: z.string().optional(),
    industry: z.string().optional(),
    country: z.string().optional(),
    logo: z.instanceof(File).optional()
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type),
      'Logo must be JPEG, PNG, GIF, or WebP'
    )
    .refine(
      (file) => !file || file.size <= 1 * 1024 * 1024,
      'Logo file size must be less than 1MB'
    ),
})