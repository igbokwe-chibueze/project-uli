// src/features/auth/schemas/index.ts

import * as z from "zod";
//import { UserRole } from "@prisma/client";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
    code: z.optional(z.string()),
});


export const RegisterSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }).max(100, { message: "First name must not be more than 100 characters" }),
    lastName: z.string().min(1, { message: "Surname is required" }).max(100, { message: "Surname must not be more than 100 characters" }),
    
    username: z.string()
      .min(3, { message: "Username must be at least 3 characters." })
      .max(30, { message: "Username must not exceed 30 characters." })
      .regex(/^[a-zA-Z0-9._-]+$/, { message: "Username can only contain letters, numbers, dots, underscores, and hyphens." })
      .refine((val) => !val.includes("@"), { message: "Username cannot contain '@'." })
      .transform((val) => val.trim().toLowerCase()),

    email: z.string().email({
        message: "Email is required",
    }),

    gender: z.enum(["MALE", "FEMALE", "PREFER_NOT_TO_SAY"]),

    password: z.string()
        .min(6, "Minimum 6 characters required")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
        
    confirmPassword: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // sets the error on the confirmPassword field
});


export const InitiatePasswordResetSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
});


export const CompletePasswordResetSchema = z.object({
    password: z.string()
        .min(6, "Minimum 6 characters required")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),

    confirmPassword: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // sets the error on the confirmPassword field
});


// export const SettingsSchema = z.object({
//     name: z.optional(z.string()),
//     isTwoFactorEnabled: z.optional(z.boolean()),
//     //role: z.enum([UserRole.ADMIN, UserRole.USER]),
//     email: z.optional(z.string().email()),
//     password: z.optional(z.string().min(6)),
//     newPassword: z.optional(z.string().min(6)),
//     confirmNewPassword: z.optional(z.string().min(6)),
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