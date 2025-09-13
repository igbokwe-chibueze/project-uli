// src/features/auth/components/initiate-password-reset-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { Button } from "@/components/ui/button"
import { CardWrapper } from "@/features/auth/components/card-wrapper"
import { InitiatePasswordResetSchema } from "@/features/auth/schemas";
import { InitiatePasswordResetAction } from "@/features/auth/actions/initiate-password-reset-action";
import { LoaderCircleIcon, MailIcon } from "lucide-react";
import { DevVerificationModal } from "@/components/dev-verification-modal";


export const InitiatePasswordResetForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    //Using this to display tokens in dev mode.
    const [devLink, setDevLink] = useState<string | null>(null);
    const [devEmail, setDevEmail] = useState<string | null>(null);

    const form = useForm<z.infer<typeof InitiatePasswordResetSchema>>({
        resolver: zodResolver(InitiatePasswordResetSchema),
        defaultValues: {
        email: "",
        },
    });

    const onSubmit = (values: z.infer<typeof InitiatePasswordResetSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
        InitiatePasswordResetAction(values)
            .then((res) => {
                
                if ("resetLink" in res) {
                    console.log("Show rest link:...." + res.resetLink)
                    setDevLink(res.resetLink!);
                    setDevEmail(res.userEmail!);
                    return;
                }
                if (res.error) setError(res.error);
                else setSuccess(res.success);
            })
            .catch((err) => {
                setError(err.message);
            });
        });
    };

  return (
    <>
        {/* Dev-only modal using ResponsiveModal */}
        <DevVerificationModal
            value={devLink}
            email={devEmail}
            onClose={() => {
                setDevLink(null);
                setDevEmail(null); // reset when closed
            }}
        />

        <CardWrapper
            headerHeading="Reset your password"
            headerLabel="Confirm your email to reset password"
            backButtonLabel="Back to login"
            backButtonHref="/access"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input 
                                                {...field}
                                                placeholder="Enter your email"
                                                type="email"
                                                autoComplete="email"
                                                className="pl-10"
                                                disabled={isPending}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        /> 
                    </div>

                    <FormError message={error} />
                    <FormSuccess message={success} />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full buttons"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <LoaderCircleIcon className="size-4 animate-spin" />
                            </div>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    </>
  )
}
