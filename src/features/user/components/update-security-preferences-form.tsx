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

  return (
    <div>
        update-security-preferences-form
    </div>
  )
}
