// src/features/user/schemas/index.ts

import * as z from "zod";

// 1. Define the core schema without any refinements.
export const UserBaseSchema = z.object({
  // Basic identification
  firstName: z.string().min(1, { message: "First name is required" }).max(100, { message: "First name must not be more than 100 characters" }),
  surname: z.string().min(1, { message: "Surname is required" }).max(100, { message: "Surname must not be more than 100 characters" }),
  userName: z.string().optional(),
  otherName: z.string().optional(),
  gender: z.string().optional(),

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
    .optional()
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

// 2. Define the complete schema with all fields (for new user creation or full updates).
// This is the one you will use for your form, since it has the refine methods.
export const UserSettingSchema = UserBaseSchema
  .refine((data) => {
    if (data.password && !data.newPassword) {
      return false;
    }
    return true;
  }, {
    message: "New Password is required",
    path: ["newPassword"],
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
    if (data.newPassword) {
      return data.newPassword === data.confirmNewPassword;
    }
    return true;
  }, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

// 3. Define the partial schema for updates by using .partial() on the base schema.
export const UpdateUserSchema = UserBaseSchema.partial();

// Define the base schema for organization data.
// export const UserSettingSchema = z.object({
//   // Basic identification
//   firstName: z.string().min(1, {
//     message: "First name is required",
//   }).max(100, { message: "First name must not be more than 100 characters" }),

//   surname: z.string().min(1, {
//     message: "Surname is required",
//   }).max(100, { message: "Surname must not be more than 100 characters" }),

//   userName: z.string().optional(),
//   otherName: z.string().optional(),
//   gender: z.string().optional(),

//   // Location and categorization
//   country: z.string().optional(),
//   state:   z.string().optional(),
//   streetAddress1: z.string().optional(),
//   streetAddress2: z.string().optional(),

//   languages: z
//     .array(z.string().min(1, { message: "At least One language is required." }))
//     .optional(), // Array of selected language IDs


//   // "Profile Image" can be a File (client-upload), a URL string, or empty to clear
//   image: z.union([
//     // 1) File branch: do MIME & size checks
//     z.instanceof(File)
//       .refine(
//         file => ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml']
//           .includes(file.type),
//         { message: "Logo must be JPEG, PNG, GIF, WebP, or SVG" }
//       )
//       .refine(
//         file => file.size <= 3 * 1024 * 1024,
//         { message: "Logo file size must be less than 1MB" }
//       ),
//       // 2) String branch: a valid URL
//       z.string().url({ message: "Invalid URL format for logo." })
//   ])
//   .optional()
//   .transform((value) => {
//     if (typeof value === 'string' && value.trim() === '') {
//       return undefined; // Clear logo when empty string
//     }
//     return value;
//   })
//   .nullable(),

//   // "User Banner Image" can be a File (client-upload), a URL string, or empty to clear
//   bannerImage: z.union([
//     // 1) File branch: do MIME & size checks
//     z.instanceof(File)
//       .refine(
//         file => ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml']
//           .includes(file.type),
//         { message: "Banner Image must be JPEG, PNG, GIF, WebP, or SVG" }
//       )
//       .refine(
//         file => file.size <= 3 * 1024 * 1024,
//         { message: "Banner Image file size must be less than 1MB" }
//       ),
//       // 2) String branch: a valid URL
//       z.string().url({ message: "Invalid URL format for Banner Image." }),
//       z.literal(""), // allow an empty string
//   ])
//   .optional()
//   .transform((value) => {
//     if (typeof value === 'string' && value.trim() === '') {
//       return undefined; // Clear Banner Image when empty string
//     }
//     return value;
//   })
//   .nullable(),

//   // Textual Bio
//   bio: z
//   .string()
//   .max(1000, { message: "Bio cannot exceed 1000 characters." })
//   .optional()
//   .refine(
//     // Bio can be empty, but if something is entered it must be more than 5 characters
//     (val) => val === undefined || val.length === 0 || val.length >= 5,
//     { message: "Bio must be at least 5 characters if provided." }
//   ),


//   // Contact & online presence
//   website: z
//     .string()
//     .optional()
//     .refine((v) => v === "" || (typeof v === "string" && /^\s*$/.test(v) === false && z.string().url().safeParse(v).success),
//             { message: "Website must be a valid URL." }),

//   /**
//    * Allows either:
//    *   • A valid email string
//    *   • The exact literal "" (blank)
//    *   • Or undefined (optional)
//    *
//    * You can also transform "" → undefined here if you want no blank
//    * strings in your final parsed output.
//    */
//   email: z
//     .union([ 
//       z.string().email({ message: "Email must be valid." }),
//       z.literal(""),
//     ])
//     .optional()
//     .transform((v) => (v === "" ? undefined : v)),

//   /**
//    * Phone must be at least 5 chars if non‑empty, or the exact empty string.
//    */
//   phoneNumber: z
//     .union([
//       z.string().min(3, { message: "Phone number seems too short." }),
//       z.literal(""),
//     ])
//     .optional()
//     .transform((v) => (v === "" ? undefined : v)),


//   // Privacy & display preferences
//   isActive: z.boolean().optional(),
//   isTwoFactorEnabled: z.boolean().optional(),
//   loginAlertsEnabled: z.boolean().optional(),

//   password: z.optional(z.string().min(6)),
//   newPassword: z.optional(z.string().min(6)),
//   confirmNewPassword: z.optional(z.string().min(6)),

//   // socialMediaLinks: z
//   //   .array(
//   //     z.object({
//   //       id: z.string().optional(), // Used for client-side keying with react-hook-form
//   //       platformId: z.string().optional(), // For predefined platforms from SocialPlatform
//   //       customPlatformName: z.string()
//   //         .min(1, { message: "Custom platform name is required." })
//   //         .optional(), // For user-defined platforms
//   //       url: z.string().url({ message: "Must be a valid URL." }),
//   //     })
//   //     .refine(data => data.platformId || data.customPlatformName, {
//   //       message: "Either a platform must be selected or a custom platform name must be provided.",
//   //       path: ["platformId", "customPlatformName"], // Point to both fields for error
//   //     })
//   //   )
//   //   .optional(), // omit entirely if no change

// })
// .refine((data) => {
//     if (data.password && !data.newPassword) {
//         return false;
//     }
//     return true;
// }, {
//     message: "New Password is required",
//     path: ["newPassword"],
// })
// .refine((data) => {
//     if (data.newPassword && !data.password) {
//         return false;
//     }
//     return true;
// }, {
//     message: "Password is required",
//     path: ["password"],
// })
// .refine((data) => {
//     if (data.newPassword) {
//       return data.newPassword === data.confirmNewPassword;
//     }
//     return true;
//   }, {
//     message: "Passwords do not match",
//     path: ["confirmNewPassword"],
// });

// export const UpdateUserSchema = UserSettingSchema.partial();