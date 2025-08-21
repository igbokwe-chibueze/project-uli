// src/features/user/schemas/index.ts

import * as z from "zod";

// 1. Define the core schema without any refinements.
export const UserBaseSchema = z.object({
  // Basic identification
  firstName: z.string().min(1, { message: "First name is required" }).max(100, { message: "First name must not be more than 100 characters" }),
  lastName: z.string().min(1, { message: "Surname is required" }).max(100, { message: "Surname must not be more than 100 characters" }),
  
  otherName: z.string().optional(),
  gender: z.string().optional(),

  username: z.string()
  .min(3, { message: "Username must be at least 3 characters." })
  .max(30, { message: "Username must not exceed 30 characters." })
  .regex(/^[a-zA-Z0-9._-]+$/, { message: "Username can only contain letters, numbers, dots, underscores, and hyphens." })
  .refine((val) => !val.includes("@"), { message: "Username cannot contain '@'." })
  .transform((val) => val.trim().toLowerCase()),

  // Location and categorization
  country: z.string().optional(),
  state: z.string().optional(),
  streetAddress1: z.string().optional(),
  streetAddress2: z.string().optional(),

  languages: z
    .array(z.string().min(1, { message: "At least One language is required." }))
    .optional(),

  // "Profile Image"
  image: z.union([
    z.instanceof(File).refine(file => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type), { message: "Logo must be JPEG, PNG, GIF, WebP, or SVG" }).refine(file => file.size <= 3 * 1024 * 1024, { message: "Logo file size must be less than 1MB" }),
    z.string().url({ message: "Invalid URL format for logo." }),
    z.literal("")
  ])
  .optional()
  .transform((value) => (typeof value === 'string' && value.trim() === '') ? undefined : value)
  .nullable(),

  // "User Banner Image"
  bannerImage: z.union([
    z.instanceof(File).refine(file => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type), { message: "Banner Image must be JPEG, PNG, GIF, WebP, or SVG" }).refine(file => file.size <= 3 * 1024 * 1024, { message: "Banner Image file size must be less than 1MB" }),
    z.string().url({ message: "Invalid URL format for Banner Image." }),
    z.literal("")
  ])
  .optional()
  .transform((value) => (typeof value === 'string' && value.trim() === '') ? undefined : value)
  .nullable(),

  // Textual Bio
  bio: z
    .string()
    .max(1000, { message: "Bio cannot exceed 1000 characters." })
    .optional()
    .refine((val) => val === undefined || val.length === 0 || val.length >= 5, { message: "Bio must be at least 5 characters if provided." }),

  // Contact & online presence
  website: z
    .string()
    .optional()
    .refine((v) => v === "" || (typeof v === "string" && /^\s*$/.test(v) === false && z.string().url().safeParse(v).success), { message: "Website must be a valid URL." }),

  email: z
    .union([z.string().email({ message: "Email must be valid." }), z.literal("")])
    .transform((v) => (v === "" ? undefined : v)),

  phoneNumber: z
    .union([z.string().min(3, { message: "Phone number seems too short." }), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),

  // Privacy & display preferences
  isActive: z.boolean().optional(),
  isTwoFactorEnabled: z.boolean().optional(),
  loginAlertsEnabled: z.boolean().optional(),
  
  password: z.optional(z.string().min(6)),
  newPassword: z.optional(z.string().min(6)),
  confirmNewPassword: z.optional(z.string().min(6)),
});

// 2. Define the partial schema for updates by using .partial() on the base schema.
export const UpdateUserSchema = UserBaseSchema.partial();

export const UpdateUserFormSchema = UpdateUserSchema
  .refine((data) => {
    if (data.email && !data.password) {
      return false;
    }
    return true;
  }, {
    message: "Password is required to change email",
    path: ["password"],
  })
  .refine((data) => {
    if (data.newPassword && !data.password) {
      return false;
    }
    return true;
  }, {
    message: "Password is required",
    path: ["password"],
  })
  .refine((data) => {
    if (data.newPassword && !data.confirmNewPassword) {
      return false;
    }
    return true;
  }, {
    message: "Must confirm new password to continue",
    path: ["confirmNewPassword"],
  })
  .refine((data) => {
    if (data.newPassword) {
      return data.newPassword === data.confirmNewPassword;
    }
    return true;
  }, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });
