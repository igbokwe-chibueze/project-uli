// src/schemas/organisation-schema.ts

import { z } from "zod";

// Define the base schema for organization data.
export const OrganisationSchema = z.object({
    organizationName: z.string().min(1, { message: "Organization name is required." }),
    country: z.string().optional(),

    // Allow 'logo' to be an actual File object during client-side submission,
    // or an empty string (when cleared), or a URL string (existing or uploaded).
    // Use .superRefine for more complex validation if needed, but for now,
    // we'll rely on a union with `z.string().url()` and transformations.
    logo: z
        .union([
            z.instanceof(File),
            z.string().url({ message: "Invalid URL format for logo." }),
            z.literal(""), // Explicitly allow empty string
        ])
        .optional()
        // Transform empty strings to undefined before passing to the next step (e.g., .nullable())
        // This makes it optional at the validation level.
        .transform((value) => {
            if (typeof value === 'string' && value.trim() === '') {
                return undefined; // Convert empty string to undefined
            }
            return value;
        })
        .nullable(), // Allow null as well (for Prisma updates)
        
    description: z.string().max(1000).optional(),
    industry: z.string().optional(),
    orgType: z.string().optional(),
    employeeCountRange: z.string().optional(),
    revenueRange: z.string().optional(),
});

// Schema for updating an organization, making all fields optional
// but validating them if provided.
export const UpdateOrganisationSchema = OrganisationSchema.partial();

// If you have a separate schema for creating (which is usually stricter), you'd define it here.
export const CreateOrganisationSchema = OrganisationSchema;