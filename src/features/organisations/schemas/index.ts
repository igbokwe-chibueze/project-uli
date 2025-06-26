// src/features/organisations/schemas/index.ts

import * as z from "zod";

// Define the base schema for organization data.
export const OrganisationSchema = z.object({
  // Basic identification
  organizationName: z.string().min(1, {
    message: "Organization name is required",
  }).max(100, { message: "Organization name must not be more than 100 characters" }),

  // Location and categorization
  country: z.string().optional(),
  state:   z.string().optional(),
  streetAddress1: z.string().optional(),
  streetAddress2: z.string().optional(),

  languages: z
    .array(z.string().min(1, { message: "At least One language is required." }))
    .optional(), // Array of selected language IDs
  industry: z.string().optional(),
  orgType: z.string().optional(),
  specialties: z
    .array(z.string().min(1, { message: "At least One specialty is required." }))
    .optional(), // Array of selected specialty IDs

  // Branding
  // "logo" can be a File (client-upload), a URL string, or empty to clear
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
      z.string().url({ message: "Invalid URL format for logo." })
  ])
  .optional()
  .transform((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined; // Clear logo when empty string
    }
    return value;
  })
  .nullable(),

  // Textual description
  description: z.string().max(1000, { message: "Description cannot exceed 1000 characters." }).optional(),

  // Organizational metrics
  employeeCountRange: z.string().optional(),
  revenueRange: z.string().optional(),

  // Contact & online presence
  website: z
    .string()
    .optional()
    .refine((v) => v === "" || (typeof v === "string" && /^\s*$/.test(v) === false && z.string().url().safeParse(v).success),
            { message: "Website must be a valid URL." }),

  /**
   * Allows either:
   *   • A valid email string
   *   • The exact literal "" (blank)
   *   • Or undefined (optional)
   *
   * You can also transform "" → undefined here if you want no blank
   * strings in your final parsed output.
   */
  primaryEmail: z
    .union([ 
      z.string().email({ message: "Primary email must be valid." }),
      z.literal(""),
    ])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),

  alternateEmail: z
    .union([
      z.string().email({ message: "Alternate email must be valid." }),
      z.literal(""),
    ])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),

  /**
   * Phone must be at least 5 chars if non‑empty, or the exact empty string.
   */
  phoneNumber: z
    .union([
      z.string().min(3, { message: "Phone number seems too short." }),
      z.literal(""),
    ])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),

  alternatePhoneNumber: z
    .union([
      z.string().min(5, { message: "Alternate phone number seems too short." }),
      z.literal(""),
    ])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),

  // Legal and registration details
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),

  // - Accepts form input (usually a string) and converts it to a number
  // - Ensures the number is a whole integer (no decimals)
  // - Validates that it’s at least year 1800
  // - Validates that it’s no later than the current year
  foundedYear: z
    .coerce.number() // coerce input to Number
    .int()           // must be an integer
    .gte(1800)       // ≥ 1800
    .lte(new Date().getFullYear()), // ≤ current year
  
  // foundedYear: z
  //   .union([
  //     z.number(),
  //     z.literal(undefined),
  //   ])
  //   .optional(),

  // Appearance settings
  colorScheme: z.string().optional(),

  // Privacy & display preferences
  isPublicProfile: z.boolean().optional(),
  allowContact: z.boolean().optional(),
  showRevenue: z.boolean().optional(),
  newsletterSubscription: z.boolean().optional(),

  // socialMediaLinks: z
  //   .array(
  //     z.object({
  //       id: z.string().optional(), // Used for client-side keying with react-hook-form
  //       platformId: z.string().optional(), // For predefined platforms from SocialPlatform
  //       customPlatformName: z.string()
  //         .min(1, { message: "Custom platform name is required." })
  //         .optional(), // For user-defined platforms
  //       url: z.string().url({ message: "Must be a valid URL." }),
  //     })
  //     .refine(data => data.platformId || data.customPlatformName, {
  //       message: "Either a platform must be selected or a custom platform name must be provided.",
  //       path: ["platformId", "customPlatformName"], // Point to both fields for error
  //     })
  //   )
  //   .optional(), // omit entirely if no change


  // operationalHours: Array of objects { day: string; from: string; to: string }
  operationalHours: z
    .array(
      z.object({
        day: z.string().min(1, { message: "Day is required." }),
        from: z.string().regex(/^([0-1]?\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:mm)." }),
        to: z.string().regex(/^([0-1]?\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:mm)." }),
      })
    )
    .optional(),
});

// Schema for updating an organization: all fields are optional but validated if present
export const UpdateOrganisationSchema = OrganisationSchema.partial();

export const CreateOrganisationSchema = OrganisationSchema.pick({
  organizationName: true,
  country: true,
  state: true,
  logo: true,
});