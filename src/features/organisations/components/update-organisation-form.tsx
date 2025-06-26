// src/features/organisations/components/update-organisation-form.tsx
"use client"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2Icon, 
    BuildingIcon, 
    CalendarIcon, 
    GlobeIcon, 
    HandCoinsIcon, 
    LetterTextIcon, 
    LoaderCircleIcon, 
    MailIcon, 
    MapPinIcon, 
    Paintbrush2Icon, 
    PencilLineIcon, RotateCcw, SaveIcon, UsersIcon } from "lucide-react";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Organization } from "@prisma/client";
import { CountryOptionProps, OptionProps, StateOptionProps } from "@/data/static-data";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

import { Input } from "@/components/ui/input";
import { FileUploadField } from "@/components/file-upload-field";
import { SelectPopover } from "@/components/select-popover";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { UpdateOrganisationSchema } from "@/features/organisations/schemas";
import { updateOrganisationAction } from "@/features/organisations/actions/updateOrganisationAction";
import { Switch } from "@/components/ui/switch";
import { LocationSelector } from "@/components/location-selector";
import { PhoneNumberInput } from "@/components/phone-number-input";
import { MultiSelect } from "@/components/multi-select";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import YearSelector from "@/components/year-selector";

interface UpdateOrganisationFormProps {
    //Its ok for me to use prisma generated types here, 
    // because getOrganisationById runs server side and returns all fields, i didn't specify fields.
    initialData: Organization & {
        languages: {
            language: {
                id: string;
                name: string;
                countryCode: string | null ;
            };
        }[];
    };
    
    countries: CountryOptionProps[];
    states?:   StateOptionProps[];
    industryOptions: OptionProps[];
    orgTypeOptions: OptionProps[];
    employeeCountRangeOptions: OptionProps[];
    revenueRangeOptions: OptionProps[];
    colorSchemeOptions: OptionProps[];
    languageOptions: OptionProps[];
};

const UpdateOrganisationForm = ({
    initialData,
    
    countries,
    states,
    industryOptions,
    orgTypeOptions,
    employeeCountRangeOptions,
    revenueRangeOptions,
    colorSchemeOptions,
    languageOptions,
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
    // WRAP defaultValues in useMemo
    const memoizedDefaultValues = useMemo(() => ({
        organizationName:  initialData.name             ?? "",
        country:           initialData.countryId       ?? "",
        state:             initialData.stateId         ?? "",
        logo:              initialData.logo            ?? "",
        description:       initialData.description     ?? "",
        industry:          initialData.industryId      ?? "",
        orgType:           initialData.orgTypeId       ?? "",
        employeeCountRange:initialData.employeeCountRangeId ?? "",
        revenueRange:      initialData.revenueRangeId  ?? "",
        // --- NEW FIELDS MAPPING ---
        website:               initialData.website         ?? "",
        primaryEmail:          initialData.primaryEmail    ?? "",
        alternateEmail:        initialData.alternateEmail  ?? "",
        phoneNumber:           initialData.phoneNumber     ?? "",
        alternatePhoneNumber:  initialData.alternatePhoneNumber ?? "",
        taxId:                 initialData.taxId           ?? "",
        foundedYear:        initialData.foundedYear ?? undefined,
        registrationNumber:initialData.registrationNumber ?? "",
        colorScheme:       initialData.colorSchemeId     ?? "",
        streetAddress1:        initialData.streetAddress1 ?? "",
        streetAddress2:        initialData.streetAddress2 ?? "",
        languages:         initialData.languages?.map((l) => l.language.id) ?? [],
        //handle social media links
        // socialMediaLinks: initialData.socialMediaLinks ? 
        //     (Array.isArray(initialData.socialMediaLinks) ? initialData.socialMediaLinks : JSON.parse(initialData.socialMediaLinks as string)) 
        //     : [], // Handle JSON string from DB or null/undefined

        isPublicProfile:   initialData.isPublicProfile  ?? false,
        allowContact:      initialData.allowContact     ?? false,
        showRevenue:       initialData.showRevenue      ?? false,
        newsletterSubscription: initialData.newsletterSubscription ?? false,

    }), [initialData]);

    const form = useForm<z.infer<typeof UpdateOrganisationSchema>>({
        resolver: zodResolver(UpdateOrganisationSchema),
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: memoizedDefaultValues, // Use the memoized default values
    });

    const { formState, watch } = form;
    const { isDirty, dirtyFields } = formState;

    const formValues = watch();

    const allFormFields = useMemo(() => {
        return Object.keys(memoizedDefaultValues) as Array<keyof z.infer<typeof UpdateOrganisationSchema>>;
    }, [memoizedDefaultValues]); // Recalculate if defaultValues somehow change (they shouldn't in this component)

    const totalFields = allFormFields.length;

    const completionPercentage = useMemo(() => {
        let filledCount = 0;
        allFormFields.forEach(field => {
            const value = formValues[field];
            if (value !== undefined && value !== null && value !== "") {
                if (field === "logo" && value instanceof File) {
                    filledCount++;
                } else if (typeof value === "string" && value.trim() !== "") {
                    filledCount++;
                } else if (typeof value !== "string") {
                    filledCount++;
                }
            }
        });
        return totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;
    }, [formValues, allFormFields, totalFields]);


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
                    if (dirtyFields.state) payload.state = values.state;

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
                    if (dirtyFields.colorScheme) payload.colorScheme = values.colorScheme;
                    //handle social media links

                    // --- NEW FIELDS PAYLOAD ---
                    if (dirtyFields.website) payload.website = values.website;
                    if (dirtyFields.primaryEmail) payload.primaryEmail = values.primaryEmail;
                    if (dirtyFields.alternateEmail) payload.alternateEmail = values.alternateEmail;
                    if (dirtyFields.phoneNumber) payload.phoneNumber = values.phoneNumber;
                    if (dirtyFields.alternatePhoneNumber) payload.alternatePhoneNumber = values.alternatePhoneNumber;
                    if (dirtyFields.taxId) payload.taxId = values.taxId;
                    if (dirtyFields.registrationNumber) payload.registrationNumber = values.registrationNumber;
                    if (dirtyFields.foundedYear) payload.foundedYear = values.foundedYear;
                    if (dirtyFields.colorScheme) payload.colorScheme = values.colorScheme;
                    if (dirtyFields.streetAddress1) payload.streetAddress1 = values.streetAddress1;
                    if (dirtyFields.streetAddress2) payload.streetAddress2 = values.streetAddress2;
                    if (dirtyFields.languages) payload.languages = values.languages;

                    if  (dirtyFields.isPublicProfile) payload.isPublicProfile = values.isPublicProfile;
                    if  (dirtyFields.allowContact) payload.allowContact = values.allowContact;
                    if  (dirtyFields.showRevenue) payload.showRevenue = values.showRevenue;
                    if  (dirtyFields.newsletterSubscription) payload.newsletterSubscription = values.newsletterSubscription;


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
        form.reset(memoizedDefaultValues); // Pass defaultValues to reset the form
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

        {/* Completion Percentage Display */}
        <div className="space-y-4 mb-8">
            <div className="space-y-2">
                <span className="text-lg font-semibold">Profile Completion</span>
                <div className="flex justify-between items-center gap-2">
                    <span className="text-sm text-muted-foreground">{completionPercentage}% complete</span>
                    {isDirty && (
                        <Badge variant="secondary" className="animate-pulse">
                            {modifiedCount} unsaved change{modifiedCount === 1 ? '' : 's'}
                        </Badge>
                    )}
                </div>
            </div>
            <Progress value={completionPercentage} className="h-2" />
        </div>

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
                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                            )}
                        </div>
                        <FormControl>
                            <div className="relative">
                                <Building2Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                <Input
                                    {...field}
                                    placeholder="Enter organization name"
                                    type="text"
                                    autoComplete="organizationName"
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
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
                />
                {/* Pencil icon for Logo, placed separately due to FileUploadField's structure */}
                {dirtyFields.logo && (
                    <div className="flex justify-end -mt-4 mr-2"> {/* Adjust margin as needed */}
                        <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                    </div>
                )}

                {/* ── Country ────────────────────────────────────────────────────────── */}
                <LocationSelector
                    control={form.control}
                    nameCountry="country"
                    nameState="state"
                    countries={countries}
                    isCountryDirty={dirtyFields.country}
                    states={states}
                    isStateDirty={dirtyFields.state}
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
                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                            )}
                        </div>
                        <FormControl>
                            <div className="relative">
                                <LetterTextIcon className="absolute left-3 top-5 -translate-y-1/2 size-4 text-muted-foreground"/>
                                <Textarea
                                    {...field}
                                    placeholder="Describe your organization in a few sentences"
                                    rows={4}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </FormControl>
                        <FormMessage className="text-left" />
                    </FormItem>
                    )}
                />

                {/* ── Street Address 1 ──────────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="streetAddress1"
                    render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center gap-2">
                            <FormLabel> Street Address 1 </FormLabel>
                            {dirtyFields.streetAddress1 && (
                                <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                            )}
                        </div>
                        <FormControl>
                            <div className="relative">
                                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                <Input
                                    {...field}
                                    placeholder="e.g. 20 Marina Road"
                                    type="text"
                                    autoComplete="address"
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </FormControl>
                        <FormMessage className="text-left" />
                    </FormItem>
                    )}
                />

                {/* ── Street Address 2 ──────────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="streetAddress2"
                    render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center gap-2">
                            <FormLabel> Street Address 2 (optional) </FormLabel>
                            {dirtyFields.streetAddress2 && (
                                <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                            )}
                        </div>
                        <FormControl>
                            <div className="relative">
                                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                <Input
                                    {...field}
                                    placeholder="e.g. Lion Building, 12th FLoor"
                                    type="text"
                                    autoComplete="address"
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
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
                    icon={<BuildingIcon/>}
                    isDirty={dirtyFields.industry}
                />

                {/* ── Organization Type ──────────────────────────────────────────────── */}
                <SelectPopover
                    control={form.control}
                    name="orgType"
                    label="Organization Type (optional)"
                    placeholder="Select type"
                    options={orgTypeOptions}
                    icon={<BuildingIcon/>}
                    isDirty={dirtyFields.orgType}
                />

                {/* ── Employee Count Range ───────────────────────────────────────────── */}
                <SelectPopover
                    control={form.control}
                    name="employeeCountRange"
                    label="Employee Count Range (optional)"
                    placeholder="Select employee count"
                    options={employeeCountRangeOptions}
                    icon={<UsersIcon/>}
                    isDirty={dirtyFields.employeeCountRange}
                />

                {/* ── Langauges ───────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormLabel> Languages </FormLabel>
                                {dirtyFields.languages && (
                                    <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                )}
                            </div>
                            <FormControl>
                                <MultiSelect
                                    options={languageOptions}
                                    value={field.value ?? []}
                                    onValueChange={field.onChange}
                                    placeholder="Select options"
                                    maxCount={3}
                                />
                            </FormControl>
                            <FormDescription>Select the languages you support.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                {/* ── Revenue Range ──────────────────────────────────────────────────── */}
                <SelectPopover
                    control={form.control}
                    name="revenueRange"
                    label="Revenue Range (optional)"
                    placeholder="Select revenue range"
                    options={revenueRangeOptions}
                    icon={<HandCoinsIcon/>}
                    isDirty={dirtyFields.revenueRange}
                />

                {/* ─────────────────────────────────────────────────────────────────── */}
                    {/* ── NEW FIELDS START HERE ──────────────────────────────────────── */}
                {/* ─────────────────────────────────────────────────────────────────── */}

                {/* ── Website ──────────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center gap-2">
                            <FormLabel> Website </FormLabel>
                            {dirtyFields.website && (
                                <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                            )}
                        </div>
                        <FormControl>
                            <div className="relative">
                                <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                <Input
                                    {...field}
                                    placeholder="Enter website url"
                                    type="url"
                                    autoComplete="url"
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </FormControl>
                        <FormMessage className="text-left" />
                    </FormItem>
                    )}
                />

                {/* ── Primary Email ───────────────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="primaryEmail"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormLabel>Primary Email</FormLabel>
                                {dirtyFields.primaryEmail && (
                                    <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                )}
                            </div>
                            <FormControl>
                                <div className="relative">
                                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter primary email"
                                        autoComplete="email"
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* ── Alternate Email ─────────────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="alternateEmail"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormLabel>Alternate Email</FormLabel>
                                {dirtyFields.alternateEmail && (
                                    <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                )}
                            </div>
                            <FormControl>
                                <div className="relative">
                                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter alternate email"
                                        autoComplete="email"
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* ── Phone Number ────────────────────────────────────────────────────── */}
                <PhoneNumberInput
                    control={form.control}
                    name="phoneNumber"
                    countryFieldName="country"
                    countries={countries}  // your CountryOptionProps array
                    label="Phone Number"
                    isDirty={dirtyFields.phoneNumber}
                    disabled={isLoading}
                />

                {/* ── Alternate Phone Number ─────────────────────────────────────────── */}
                <PhoneNumberInput
                    control={form.control}
                    name="alternatePhoneNumber"
                    countryFieldName="country"
                    countries={countries}  // your CountryOptionProps array
                    label="Alternate Phone Number"
                    isDirty={dirtyFields.alternatePhoneNumber}
                    disabled={isLoading}
                />

                {/* ── Tax ID ──────────────────────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormLabel>Tax ID</FormLabel>
                                {dirtyFields.taxId && (
                                    <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                )}
                            </div>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Enter tax identifier"
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* ── Registration Number ────────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormLabel>Registration Number</FormLabel>
                                {dirtyFields.registrationNumber && (
                                    <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                )}
                            </div>
                            <FormControl>
                                <Input
                                {...field}
                                type="text"
                                placeholder="Enter registration number"
                                disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* ── Founded Year ───────────────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="foundedYear"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormLabel>Founded Year</FormLabel>
                                {dirtyFields.foundedYear && (
                                    <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                )}
                            </div>

                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value?.toString() || ''} 
                                    disabled={isLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger className="pl-10 w-full">
                                            <SelectValue placeholder="Select a year" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Years</SelectLabel>
                                            <YearSelector />
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* ── Color Scheme ───────────────────────────────────────────────────── */}
                <SelectPopover
                    control={form.control}
                    name="colorScheme"
                    label="Color Scheme"
                    placeholder="Select a color scheme"
                    options={colorSchemeOptions}
                    icon={<Paintbrush2Icon/>}
                    isDirty={dirtyFields.colorScheme}
                />

                {/* ── Public Profile Toggle ──────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="isPublicProfile"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <div className="flex items-center gap-2">
                                    <FormLabel>Public Profile</FormLabel>
                                    {dirtyFields.isPublicProfile && (
                                        <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                    )}
                                </div>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                {/* ── Allow Contact Toggle ───────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="allowContact"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <div className="flex items-center gap-2">
                                    <FormLabel>Allow Contact</FormLabel>
                                    {dirtyFields.allowContact && (
                                        <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                    )}
                                </div>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                {/* ── Show Revenue Toggle ────────────────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="showRevenue"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <div className="flex items-center gap-2">
                                    <FormLabel>Show Revenue</FormLabel>
                                    {dirtyFields.showRevenue && (
                                        <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                    )}
                                </div>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                {/* ── Newsletter Subscription Toggle ───────────────────────────────── */}
                <FormField
                    control={form.control}
                    name="newsletterSubscription"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <div className="flex items-center gap-2">
                                    <FormLabel>Subscribe to Newsletter</FormLabel>
                                    {dirtyFields.newsletterSubscription && (
                                        <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                    )}
                                </div>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                {/* Note for modified fields */}
                {isDirty && (
                    <div className="flex justify-end items-center space-x-2 animate-in slide-in-from-bottom duration-200">
                        <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                        <span className="text-right text-sm text-muted-foreground">
                            {modifiedCount} {modifiedCount === 1 ? 'field' : 'fields'} modified
                        </span>
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
                        <div className="flex items-center justify-center gap-2">
                            {isLoading ? (
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
            </form>
        </Form>
    </div>
  )
}

export default UpdateOrganisationForm