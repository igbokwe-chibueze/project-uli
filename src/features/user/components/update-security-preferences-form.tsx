// src/features/user/components/update-security-preferences-form.tsx
"use client"

import { User } from "@prisma/client"
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UpdateUserFormSchema } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUserAction } from "../actions/updateUserAction";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { LoaderCircleIcon, PencilLineIcon, RotateCcwIcon, SaveIcon } from "lucide-react";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";

interface UpdateSecurityPreferencesProps {
    initialData: User
}

export const UpdateSecurityPreferencesForm = ({initialData}: UpdateSecurityPreferencesProps) => {
    const router = useRouter();
    const { id: userId } = initialData;

    const [isPending, startTransition] = useTransition();
    // Specific for onSubmit
    const [isSavingChanges, setIsSavingChanges] = useState(false);

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const memoizedDefaultValues = useMemo(() => ({
        isTwoFactorEnabled: initialData.isTwoFactorEnabled ?? false,
        loginAlertsEnabled: initialData.loginAlertsEnabled ?? false,
    }), [initialData]);

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

                    if (dirtyFields.isTwoFactorEnabled) payload.isTwoFactorEnabled = values.isTwoFactorEnabled;
                    if (dirtyFields.loginAlertsEnabled) payload.loginAlertsEnabled = values.loginAlertsEnabled;


                    if (Object.keys(payload).length === 0) {
                        setError("No changes detected. Please edit at least one field to save.");
                        toast.info("No Changes", { description: "No changes detected. Please edit at least one field to save." });
                        setIsSavingChanges(false);
                        return;
                    }

                    // Call the server action with the constructed payload
                    const res = await updateUserAction(userId, payload);

                    // — Show toast + form feedback
                    if (res.error) {
                        setError(res.error);
                        toast.error("Update Failed", { description: res.error });
                    } else {
                        setSuccess(res.success!);
                        toast.success("User updated successfully.", {
                            description: `"${initialData.firstName}" has been saved.`,
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
        <div className="lg:w-[900px] space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        {/* ── 2-Factor Authentication ──────────────────────────────────────────── */}
                        <FormField
                            control={form.control}
                            name="isTwoFactorEnabled"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-x-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>

                                        <FormLabel>Enable 2-Factor Authentication</FormLabel>
                                        {dirtyFields.isTwoFactorEnabled && (
                                            <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                        )}
                                    </div>
                                    <FormDescription>
                                        Add an extra security layer with 2-step authentication for
                                        better account protection.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        {/* ── Login Alerts ──────────────────────────────────────────── */}
                        <FormField
                            control={form.control}
                            name="loginAlertsEnabled"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-x-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>

                                        <FormLabel>Login Alerts</FormLabel>
                                        {dirtyFields.loginAlertsEnabled && (
                                            <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                        )}
                                    </div>
                                    <FormDescription>
                                        Receive notifications for login activities to stay informed
                                        about access to your account.
                                    </FormDescription>
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
                                        <RotateCcwIcon className="size-4 mr-2" />
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
                </form>
            </Form>
        </div>
    </>
  )
}
