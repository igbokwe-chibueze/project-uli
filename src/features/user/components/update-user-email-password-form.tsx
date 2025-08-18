// src/features/user/components/update-user-email-password-form.tsx
"use client"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { updateUserAction } from "@/features/user/actions/updateUserAction";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { UpdateUserFormSchema } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { StatusMessageCard } from "@/components/status-message-card";
import { EyeIcon, EyeOffIcon, KeyRoundIcon, LoaderCircleIcon, MailIcon, PencilLineIcon, RotateCcwKeyIcon, SaveIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { DevVerificationModal } from "@/components/dev-verification-modal";

interface UpdateUserEmailPasswordProps {
    initialData: User
}

const UpdateUserEmailPasswordForm = ({initialData}: UpdateUserEmailPasswordProps) => {
    const router = useRouter();
    const { id: userId, isActive: initialIsActive } = initialData;

    const [isPending, startTransition] = useTransition();
    // Specific for onSubmit
    const [isSavingChanges, setIsSavingChanges] = useState(false);

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const [showPassword, setShowPassword] = useState(false);

    //Using this to display tokens in dev mode.
    const [devLink, setDevLink] = useState<string | null>(null);

    const memoizedDefaultValues = useMemo(() => ({
        email:              initialData.email              ?? "",
        password:           undefined,
        newPassword:        undefined,
        confirmNewPassword: undefined,

        isTwoFactorEnabled: initialData.isTwoFactorEnabled ?? false,
        loginAlertsEnabled: initialData.loginAlertsEnabled ?? false,
        isActive:          initialIsActive,
    }), [initialData, initialIsActive]);

    const form = useForm<z.infer<typeof UpdateUserFormSchema>>({
        resolver: zodResolver(UpdateUserFormSchema),
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: memoizedDefaultValues, // Use the memoized default values
    });

    const { formState } = form;
    const { isDirty, dirtyFields } = formState;

    // Calculate number of modified fields
    const modifiedCount = Object.keys(dirtyFields).length;

    const onSubmit = (values: z.infer<typeof UpdateUserFormSchema>) => {
        // 1️⃣ Reset messages & show spinner immediately
        setError("");
        setSuccess("");
        setIsSavingChanges(true);

        // Check if any fields are dirty (modified)
        if (!isDirty) {
            setError("No changes detected. Please edit at least one field to save.");
            toast.info("No Changes", { description: "No changes detected. Please edit at least one field to save." });
            setIsSavingChanges(false);
            return;
        }

        // 2️⃣ Do *all* of the async work inside a single transition
        startTransition(() => {
            (async () => {
                try {
                    const payload: Partial<z.infer<typeof UpdateUserFormSchema>> = {};

                    if (dirtyFields.email) payload.email= values.email;
                    if (dirtyFields.password) payload.password= values.password;


                    if (dirtyFields.isTwoFactorEnabled) payload.isTwoFactorEnabled = values.isTwoFactorEnabled;
                    if (dirtyFields.loginAlertsEnabled) payload.loginAlertsEnabled = values.loginAlertsEnabled;


                    if (Object.keys(payload).length === 0) {
                        setError("No changes detected. Please edit at least one field to save.");
                        toast.info("No Changes", { description: "No changes detected. Please edit at least one field to save." });
                        setIsSavingChanges(false);
                        return;
                    }
                    console.log("see}}}}}}}}}")

                    // Call the server action with the constructed payload
                    const res = await updateUserAction(userId, payload);

                    // — Show toast + form feedback
                    if (res.error) {
                        setError(res.error);
                        toast.error("Update Failed", { description: res.error });
                    } else {
                        if ("confirmLink" in res) {
                            setDevLink(res.confirmLink!);
                            return;
                        }

                        setSuccess(res.success!);
                        toast.success("User updated successfully.", {
                            description: `"${values.firstName}" has been saved.`,
                        });
                        //form.reset(values) // ******this seems better, the way below seems to take longer time*****************
                        form.reset({
                            ...values, // Use the submitted values
                        });
                        // revalidate the current page
                        router.refresh(); // This will eventually re-fetch the correct initialData
                    }
                    } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : "Something went wrong";
                        setError(msg);
                        toast.error("Error", { description: msg });
                    } finally {
                        // 3️⃣ Always turn off spinner when done
                        setIsSavingChanges(false);
                    }
                })();

        })

    }

    /**
     * Resets the form to its initial default values.
     * This will clear all changes and dirty states.
     */
    const handleReset = () => {
        form.reset(memoizedDefaultValues); // Pass defaultValues to reset the form
        setError(""); // Clear any error messages
        setSuccess(""); // Clear any success messages
        toast.info("Form Reset", { description: "All changes have been reverted." });
    };

  return (
    <>
        <DevVerificationModal
            link={devLink}
            onClose={() => setDevLink(null)}
        />

        <div className="lg:w-[900px] space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {initialIsActive ? (
                        <div className="space-y-4">
                            {/* ── Email ──────────────────────────────────────────────── */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel> Email </FormLabel>
                                            {dirtyFields.email && (
                                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                            )}
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter your email"
                                                    type="email"
                                                    autoComplete="email"
                                                    className="pl-10"
                                                    disabled={isSavingChanges}
                                                />
                                            </div>
                                        </FormControl>
                                        <div className="min-h-[1.25rem]">
                                            <FormMessage className="text-left" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            

                            {/* ── Current Password ──────────────────────────────────────────────── */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> Current Password </FormLabel>

                                        <div className="relative">
                                            <FormControl>
                                                <div className="relative">
                                                    <KeyRoundIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter your password"
                                                        type={showPassword ? "text" : "password"}
                                                        autoComplete="current-password"
                                                        className="pl-10"
                                                        disabled={isSavingChanges}
                                                    />
                                                </div>
                                            </FormControl>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                                            >
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </Button>
                                        </div>
                                        <div className="min-h-[1.25rem]">
                                            <FormMessage className="text-left" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            
                            {/* ── New Password ──────────────────────────────────────────────── */}
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel> New Password </FormLabel>
                                            {dirtyFields.newPassword && (
                                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                            )}
                                        </div>

                                        <div className="relative">
                                            <FormControl>
                                                <div className="relative">
                                                    <KeyRoundIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter new password"
                                                        type={showPassword ? "text" : "password"}
                                                        autoComplete="new-password"
                                                        className="pl-10"
                                                        disabled={isSavingChanges}
                                                    />
                                                </div>
                                            </FormControl>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                                            >
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </Button>
                                        </div>
                                        <div className="min-h-[1.25rem]">
                                            <FormMessage className="text-left" />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* ── Confirm Password ──────────────────────────────────────────────── */}
                            <FormField
                                control={form.control}
                                name="confirmNewPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel> Confirm Password </FormLabel>
                                            {dirtyFields.newPassword && (
                                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                            )}
                                        </div>

                                        <div className="relative">
                                            <FormControl>
                                                <div className="relative">
                                                    <KeyRoundIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                                    <Input
                                                        {...field}
                                                        placeholder="Confirm your new password"
                                                        type={showPassword ? "text" : "password"}
                                                        autoComplete="new-password"
                                                        className="pl-10"
                                                        disabled={isSavingChanges}
                                                    />
                                                </div>
                                            </FormControl>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                                            >
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </Button>
                                        </div>
                                        <div className="min-h-[1.25rem]">
                                            <FormMessage className="text-left" />
                                        </div>
                                    </FormItem>
                                )}
                            />


                            {/* ─────────────────────────────────────────────────────────────────── */}
                                {/* ── Modified Fields & Buttons ──────────────────────────────────────── */}
                            {/* ─────────────────────────────────────────────────────────────────── */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    {/* Note for modified fields */}
                                    {isDirty && (
                                        <div className="flex justify-end items-center space-x-2 animate-in slide-in-from-bottom duration-200">
                                            <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                            <span className="text-right text-sm text-muted-foreground">
                                                {modifiedCount} {modifiedCount === 1 ? 'field' : 'fields'} modified
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <FormError message={error} />
                                <div className={isPending ? "opacity-50" : "opacity-100 transition-opacity"}>
                                    <FormSuccess message={success} />
                                </div>

                                <div className="flex gap-3 pt-4">

                                    {/* Reset Changes Button */}
                                    {isDirty && ( // Only show reset button if there are changes
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleReset}
                                            disabled={isSavingChanges}
                                        >
                                            <RotateCcwKeyIcon className="size-4 mr-2" />
                                            Reset Changes
                                        </Button>
                                    )}

                                    {/* Save Changes */}
                                    <Button
                                        type="submit"
                                        className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                                        disabled={!isDirty || isSavingChanges}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {isSavingChanges ? (
                                                <>
                                                    <LoaderCircleIcon className="size-4 mr-2 animate-spin" />
                                                    <span>Saving Changes…</span>
                                                </>
                                            ) : (
                                                <>
                                                    <SaveIcon className="size-4 mr-2" />
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </div>
                                    </Button>
                                </div>
                                
                            </div>
                        </div>
                    ) : (
                        <StatusMessageCard status="deactivated" />
                    )}
                </form>
            </Form>
        </div>
    </>
  )
}

export default UpdateUserEmailPasswordForm