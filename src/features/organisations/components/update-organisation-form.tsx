// src/features/organisations/components/update-organisation-form.tsx
"use client"

import { OptionProps } from "@/data/static-data";
import { useState, useTransition } from "react";
import { z } from "zod";
import { UpdateOrganisationSchema } from "../schemas/updateOrganisationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Organization } from "@prisma/client";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { updateOrganisationAction } from "../actions/updateOrganisationAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileUploadField } from "@/components/file-upload-field";
import { SelectPopover } from "@/components/select-popover";
import { Building2Icon, GlobeIcon, PencilLineIcon, RotateCcw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";

interface UpdateOrganisationFormProps {
    onCancel?: () => void;
    initialData: Organization; //Its ok for me to use prisma generated types here, because getOrganisationById runs server side and returns all fields, i didn't specify fields.
    countryOptions: OptionProps[];
    industryOptions: OptionProps[];
    orgTypeOptions: OptionProps[];
    employeeCountRangeOptions: OptionProps[];
    revenueRangeOptions: OptionProps[];
};

const UpdateOrganisationForm = ({
    onCancel,
    initialData,
    countryOptions,
    industryOptions,
    orgTypeOptions,
    employeeCountRangeOptions,
    revenueRangeOptions,
}: UpdateOrganisationFormProps) => {

    const router = useRouter();
    const { id: organisationId, } = initialData;

    const [isLoading, setIsLoading]     = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    // We bump this key each time we want to reset the FileUploadField to show existing logo as “preview”
    const [logoKey, setLogoKey] = useState(0);

    // Build defaultValues from initialData. For any null/undefined, we pass "" to keep controlled.
    // Correctly map fields from the Prisma model to the form schema.
    const defaultValues: z.infer<typeof UpdateOrganisationSchema> = {
        organizationName: initialData.name, // Prisma 'name' -> form 'organizationName'
        country: initialData.countryId ?? undefined, // Prisma 'countryId' -> form 'country'
        logo: initialData.logo ?? undefined, // Ensure initialData.logo is correctly mapped
        description: initialData.description ?? undefined,
        industry: initialData.industryId ?? undefined, // Prisma 'industryId' -> form 'industry'
        orgType: initialData.orgTypeId ?? undefined, // Prisma 'orgTypeId' -> form 'orgType'
        employeeCountRange: initialData.employeeCountRangeId ?? undefined, // etc.
        revenueRange: initialData.revenueRangeId ?? undefined,
    };

    const form = useForm<z.infer<typeof UpdateOrganisationSchema>>({
        resolver: zodResolver(UpdateOrganisationSchema),
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues,
    });

    const { formState } = form;
    const { isDirty, dirtyFields } = formState;

    // Calculate number of modified fields
    const modifiedCount = Object.keys(dirtyFields).length;

    /**
   * onSubmit ‒ When the user clicks “Save Changes”:
   * 1. Clear any existing error/success messages and show loading spinner.
   * 2. If they picked a new File for “logo”, upload it to Cloudinary. Otherwise, if they leave the existing URL as is,
   *    we simply pass that string through. If they clear out logo entirely (you may need extra UI to allow “remove logo”),
   *    you can pass an empty string or undefined to let the server action know you want to overwrite logo with null.
   * 3. Call the server action: `updateOrganisationAction(organisationId, { …values, logo: logoUrl })`.
   * 4. On success, show toast + either redirect back to detail page or revalidate in‐place.
   * 5. Turn off spinner.
   */
    const onSubmit = (values: z.infer<typeof UpdateOrganisationSchema>) => {
        // 1️⃣ Reset messages & show spinner immediately
        setError("");
        setSuccess("");
        setIsLoading(true);

        // Check if any fields are dirty (modified)
        if (!isDirty) {
            setError("No changes detected. Please edit at least one field to save.");
            toast.info("No Changes", { description: "No changes detected. Please edit at least one field to save." });
            setIsLoading(false);
            return;
        }

        // Add this logging************************************************************************
        console.log("Form is dirty:", isDirty);
        console.log("Dirty Fields detected by react-hook-form:", dirtyFields);
        //*********************************************************************************** */

        // 2️⃣ Do *all* of the async work inside a single transition
        startTransition(() => {
            (async () => {
                try {
                    // — Upload logo if user picked one
                    let finalLogoValue: string | null | undefined; // This will hold the value for the payload

                    // Only process logo if it was changed
                    if (dirtyFields.logo) {
                        if (values.logo instanceof File) {
                            // New file uploaded
                            finalLogoValue = await uploadToCloudinary(
                                values.logo,
                                "logo_upload_project_uli",
                                "organisations/logos"
                            );
                        } else if (typeof values.logo === "string") {
                            // Existing URL or explicitly cleared to empty string
                            // If it's an empty string, set to null, otherwise keep the URL
                            finalLogoValue = values.logo.trim() ? values.logo.trim() : null;
                        } else {
                            // If values.logo is undefined (e.g., cleared from new file selection)
                            finalLogoValue = null; // Explicitly set to null for deletion in DB
                        }
                    } else {
                        // Logo field was NOT dirty, keep its initial value from DB.
                        // Important: Initial value might be null in DB, which would be undefined in initialData
                        finalLogoValue = initialData.logo ?? null;
                    }

                    // Construct a payload with only the dirty fields
                    const payload: Partial<z.infer<typeof UpdateOrganisationSchema>> = {};

                    if (dirtyFields.organizationName) payload.organizationName = values.organizationName;
                    if (dirtyFields.country) payload.country = values.country;

                    // IMPORTANT: If logo is dirty, add it to payload.
                    // This covers new upload, keeping existing, or clearing (null).
                    // If logo is dirty, include it in the payload
                    if (dirtyFields.logo) {
                        payload.logo = finalLogoValue; // This will be URL string, or null
                    } else {
                        // Edge case: if logo was in initialData, and user didn't touch it,
                        // but it needs to be included for consistency or other reasons,
                        // you might add it here. But typically, if !dirty, you don't send.
                        // However, if the initialData.logo was null, and the form default is undefined,
                        // and nothing was done, it shouldn't be in dirtyFields.logo.
                        // The current structure correctly handles new uploads and explicit clears.
                    }

                    if (dirtyFields.description) payload.description = values.description;
                    if (dirtyFields.industry) payload.industry = values.industry;
                    if (dirtyFields.orgType) payload.orgType = values.orgType;
                    if (dirtyFields.employeeCountRange) payload.employeeCountRange = values.employeeCountRange;
                    if (dirtyFields.revenueRange) payload.revenueRange = values.revenueRange;

                    if (Object.keys(payload).length === 0) {
                        setError("No changes detected. Please edit at least one field to save.");
                        toast.info("No Changes", { description: "No changes detected. Please edit at least one field to save." });
                        setIsLoading(false);
                        return;
                    }

                    // Call the server action with the constructed payload
                    const res = await updateOrganisationAction(organisationId, payload);

                    // — Show toast + form feedback
                    if (res.error) {
                        setError(res.error);
                        toast.error("Update Failed", { description: res.error });
                    } else {
                        setSuccess(res.success!);
                        toast.success("Organisation updated successfully.", {
                            description: `"${values.organizationName}" has been saved.`,
                        });
                        //form.reset(values) // ******this seems better, the way below seems to take longer time*****************
                        form.reset({
                            ...values, // Use the submitted values
                            // Ensure logo is correctly set for reset,
                            // particularly if it went from File to URL, or to null
                            logo: finalLogoValue === undefined ? initialData.logo ?? undefined : finalLogoValue ?? undefined
                        });
                        setLogoKey((prev) => prev + 1);
                        // revalidate the current page
                        router.refresh();
                    }
                    } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : "Something went wrong";
                        setError(msg);
                        toast.error("Error", { description: msg });
                    } finally {
                        // 3️⃣ Always turn off spinner when done
                        setIsLoading(false);
                    }
                })();
        });
    };

    /**
     * Resets the form to its initial default values.
     * This will clear all changes and dirty states.
     */
    const handleReset = () => {
        form.reset(defaultValues); // Pass defaultValues to reset the form
        setLogoKey((prev) => prev + 1); // Force FileUploadField to re-render with initial logo
        setError(""); // Clear any error messages
        setSuccess(""); // Clear any success messages
        toast.info("Form Reset", { description: "All changes have been reverted." });
    };

  return (
    <div className="mx-auto lg:w-[600px]">
        <h2 className="text-2xl font-semibold mb-4">
            Update Organization
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
            Modify any of the fields below, then click “Save Changes.”
        </p>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Organization Name ──────────────────────────────────────────────── */}
            <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                <FormItem>
                    <div className="flex items-center gap-2">
                        <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                            Organization Name
                        </FormLabel>
                        {dirtyFields.organizationName && (
                            <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                        )}
                    </div>
                    <FormControl>
                    <Input
                        {...field}
                        placeholder="Enter organization name"
                        type="text"
                        autoComplete="organizationName"
                        disabled={isLoading}
                    />
                    </FormControl>
                    <FormMessage className="text-left" />
                </FormItem>
                )}
            />

            {/* ── Logo (existing URL or new File) ───────────────────────────────── */}
            <FileUploadField
                key={logoKey}
                control={form.control}
                name="logo"
                label="Organization Logo"
                accept="image/*"
                acceptLabel="Images (PNG, JPG, SVG, etc.)"
                maxSizeMB={3}
                previewWidth={128}
                previewHeight={128}
                // If you want to allow “remove logo,” you could add a little “Clear” button
                // that does: form.setValue("logo", "");
            />
            {/* Pencil icon for Logo, placed separately due to FileUploadField's structure */}
            {dirtyFields.logo && (
                <div className="flex justify-end -mt-4 mr-2"> {/* Adjust margin as needed */}
                    <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                </div>
            )}

            {/* ── Country ────────────────────────────────────────────────────────── */}
            <SelectPopover
                control={form.control}
                name="country"
                label="Country"
                placeholder="Select country"
                icon={<GlobeIcon />}
                options={countryOptions}
                // Pass dirty state to SelectPopover to display icon
                isDirty={dirtyFields.country}
            />

            {/* ── Description ────────────────────────────────────────────────────── */}
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                <FormItem>
                    <div className="flex items-center gap-2">
                        <FormLabel>Description (optional)</FormLabel>
                        {dirtyFields.description && (
                            <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                        )}
                    </div>
                    <FormControl>
                    <Textarea
                        {...field}
                        placeholder="Describe your organization in a few sentences"
                        rows={4}
                        disabled={isLoading}
                    />
                    </FormControl>
                    <FormMessage className="text-left" />
                </FormItem>
                )}
            />

            {/* ── Industry ───────────────────────────────────────────────────────── */}
            <SelectPopover
                control={form.control}
                name="industry"
                label="Industry (optional)"
                placeholder="Select industry"
                options={industryOptions}
                isDirty={dirtyFields.industry}
            />

            {/* ── Organization Type ──────────────────────────────────────────────── */}
            <SelectPopover
                control={form.control}
                name="orgType"
                label="Organization Type (optional)"
                placeholder="Select type"
                options={orgTypeOptions}
                isDirty={dirtyFields.orgType}
            />

            {/* ── Employee Count Range ───────────────────────────────────────────── */}
            <SelectPopover
                control={form.control}
                name="employeeCountRange"
                label="Employee Count Range (optional)"
                placeholder="Select employee count"
                options={employeeCountRangeOptions}
                isDirty={dirtyFields.employeeCountRange}
            />

            {/* ── Revenue Range ──────────────────────────────────────────────────── */}
            <SelectPopover
                control={form.control}
                name="revenueRange"
                label="Revenue Range (optional)"
                placeholder="Select revenue range"
                options={revenueRangeOptions}
                isDirty={dirtyFields.revenueRange}
            />

            {/* Note for modified fields */}
            {isDirty && (
                <div className="text-right text-sm text-muted-foreground animate-in slide-in-from-bottom duration-200">
                    {modifiedCount} {modifiedCount === 1 ? 'field' : 'fields'} modified
                </div>
            )}

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
                        disabled={isLoading}
                    >
                        <RotateCcw className="size-4 mr-2" />
                        Reset Changes
                    </Button>
                )}

                {/* Save Changes */}
                <Button
                    type="submit"
                    className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="size-4 border-2 border-t-transparent border-solid rounded-full animate-spin" />
                            <span>Saving Changes…</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <Building2Icon className="size-4 mr-2" />
                            <span>Save Changes</span>
                        </div>
                    )}
                </Button>

                {/* Cancel */}
                {onCancel ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
            </div>
            </form>
        </Form>
    </div>
  )
}

export default UpdateOrganisationForm