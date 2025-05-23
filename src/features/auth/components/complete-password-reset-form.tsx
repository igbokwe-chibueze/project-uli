// src/features/auth/components/complete-password-reset-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "next-auth/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

import { CardWrapper } from "@/features/auth/components/card-wrapper";
import { CompletePasswordResetSchema } from "@/features/auth/schemas";
import { CompletePasswordResetAction } from "@/features/auth/actions/complete-password-reset-action";

export const CompletePasswordResetForm = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const form = useForm<z.infer<typeof CompletePasswordResetSchema>>({
        resolver: zodResolver(CompletePasswordResetSchema),
        defaultValues: {
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof CompletePasswordResetSchema>) => {
        setError("");
        setSuccess("");

        if (!token) {
        setError("Missing token!");
        return;
        }

        startTransition(() => {
            CompletePasswordResetAction(values, token)
                .then((res) => {
                    if (res.success) {
                        setSuccess(res.success);
                        const message = "Password changed successfully. Please log in with your new password.";
                        const encodedMessage = encodeURIComponent(message);
                        signOut({
                            callbackUrl: `/access?message=${encodedMessage}`
                        });
                    } else {
                        setError(res.error);
                    }
                })
                .catch((err) => {
                    setError(err.message);
                });
            });
    };
  return (
    <CardWrapper
        headerHeading="Complete Password Reset"
        headerLabel="Enter a new password"
        backButtonLabel="Back to login"
        backButtonHref="/access"
    >
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex items-center text-muted-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="size-4" />
                                        ) : (
                                            <EyeIcon className="size-4" />
                                        )}
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Confirm Password */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Confirm your password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex items-center text-muted-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="size-4" />
                                        ) : (
                                            <EyeIcon className="size-4" />
                                        )}
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormError message={error} />
                <FormSuccess message={success} />

                <Button type="submit" className="w-full buttons" disabled={isPending}>
                    {isPending ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 border-2 border-t-transparent border-solid rounded-full animate-spin" />
                        </div>
                    ) : (
                        "Update Password"
                    )}
                </Button>
            </form>
        </Form>
    </CardWrapper>
  )
}

