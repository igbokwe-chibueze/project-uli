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
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
    confirmPassword: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
    name: z.string().min(1, {
        message: "Name is required",
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
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
    confirmPassword: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // sets the error on the confirmPassword field
});


export const SettingsSchema = z.object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    //role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
    confirmNewPassword: z.optional(z.string().min(6)),
})
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