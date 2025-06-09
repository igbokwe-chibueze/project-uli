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
import { Building2Icon, GlobeIcon } from "lucide-react";
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
        logo: initialData.logo ?? undefined,
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

        // Add this logging
    console.log("Form is dirty:", isDirty);
    console.log("Dirty Fields detected by react-hook-form:", dirtyFields);

        // 2️⃣ Do *all* of the async work inside a single transition
        startTransition(() => {
            (async () => {
                try {
                    // — Upload logo if user picked one
                    let logoUrl: string | null | undefined;
                    // Only process logo if it was changed
                    if (dirtyFields.logo) {
                        if (values.logo instanceof File) {
                            logoUrl = await uploadToCloudinary(
                                values.logo,
                                "logo_upload_project_uli",
                                "organisations/logos"
                            );
                        } else if (typeof values.logo === "string") {
                            // If it's non-empty, keep it; otherwise clear it (null for empty string)
                            logoUrl = values.logo.trim() ? values.logo.trim() : null;
                        }
                    } else {
                        // If logo field is not dirty, use the initial logo value
                        logoUrl = initialData.logo ?? null;
                    }

                    // logoUrl is currently `string | null | undefined`
                    // (if logoUrl is null or undefined, normalizedLogo will be undefined)
                    const normalizedLogo = logoUrl ?? undefined; 

                    // Construct a payload with only the dirty fields
                    const payload: Partial<z.infer<typeof UpdateOrganisationSchema>> = {};

                    if (dirtyFields.organizationName) payload.organizationName = values.organizationName;
                    if (dirtyFields.country) payload.country = values.country;
                    if (dirtyFields.logo || (dirtyFields.logo === false && typeof values.logo === 'string' && values.logo !== initialData.logo)) {
                        // This complex condition for logo handles cases where it might be explicitly set to null/empty string by user
                        payload.logo = normalizedLogo;
                    }
                    if (dirtyFields.description) payload.description = values.description;
                    if (dirtyFields.industry) payload.industry = values.industry;
                    if (dirtyFields.orgType) payload.orgType = values.orgType;
                    if (dirtyFields.employeeCountRange) payload.employeeCountRange = values.employeeCountRange;
                    if (dirtyFields.revenueRange) payload.revenueRange = values.revenueRange;

                    // Ensure organizationName is always included if it's dirty, as it's required
                    if (dirtyFields.organizationName && payload.organizationName === undefined) {
                         // This case might happen if organizationName is dirty but somehow invalidates to undefined
                         // For this schema, it's string.min(1), so it would be empty string, which is caught by dirtyFields.organizationName
                         // and still passed to payload.organizationName. Just a safeguard.
                        payload.organizationName = values.organizationName;
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
                        form.reset(values)
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
                    <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                    Organization Name
                    </FormLabel>
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

            <span>{initialData.logo}</span>

            {/* ── Country ────────────────────────────────────────────────────────── */}
            <SelectPopover
                control={form.control}
                name="country"
                label="Country"
                placeholder="Select country"
                icon={<GlobeIcon />}
                options={countryOptions}
            />

            {/* ── Description ────────────────────────────────────────────────────── */}
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
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
            />

            {/* ── Organization Type ──────────────────────────────────────────────── */}
            <SelectPopover
                control={form.control}
                name="orgType"
                label="Organization Type (optional)"
                placeholder="Select type"
                options={orgTypeOptions}
            />

            {/* ── Employee Count Range ───────────────────────────────────────────── */}
            <SelectPopover
                control={form.control}
                name="employeeCountRange"
                label="Employee Count Range (optional)"
                placeholder="Select employee count"
                options={employeeCountRangeOptions}
            />

            {/* ── Revenue Range ──────────────────────────────────────────────────── */}
            <SelectPopover
                control={form.control}
                name="revenueRange"
                label="Revenue Range (optional)"
                placeholder="Select revenue range"
                options={revenueRangeOptions}
            />

            {/* <div className="text-right text-sm text-muted-foreground">
                {modifiedCount} {modifiedCount === 1 ? 'field' : 'fields'} modified
            </div> */}

            <FormError message={error} />
            <div className={isPending ? "opacity-50" : "opacity-100 transition-opacity"}>
                <FormSuccess message={success} />
            </div>

            <div className="flex gap-3 pt-4">
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
                    <Building2Icon className="w-4 h-4 mr-2" />
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