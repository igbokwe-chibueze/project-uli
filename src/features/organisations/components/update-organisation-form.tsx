// src/features/organisations/components/update-organisation-form.tsx
"use client"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangleIcon, Building2Icon, 
    BuildingIcon, 
    CalendarIcon, 
    EyeIcon, 
    FileTextIcon, 
    GlobeIcon, 
    HandCoinsIcon, 
    LetterTextIcon, 
    LoaderCircleIcon, 
    MailIcon, 
    MapPinIcon,
    PaletteIcon, 
    PencilLineIcon, PowerIcon, PowerOffIcon, RotateCcw, SaveIcon, ShieldOffIcon, Trash2Icon, Users2Icon, UsersIcon } from "lucide-react";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Organization } from "@prisma/client";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

import { useConfirm } from "@/hooks/use-confirm";
import { CountryOptionProps, OptionProps, StateOptionProps } from "@/data/static-data";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { FormSuccess } from "@/components/form-success";
import { SelectPopover } from "@/components/select-popover";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { deleteImageAction } from "@/actions/deleteImageAction";

import { UpdateOrganisationSchema } from "@/features/organisations/schemas";
import { updateOrganisationAction } from "@/features/organisations/actions/updateOrganisationAction";
import { deleteOrganisationAction } from "@/features/organisations/actions/deleteOrganisationAction";


import YearSelector from "@/components/year-selector";
import { MultiSelect } from "@/components/multi-select";
import { LocationSelector } from "@/components/location-selector";
import { PhoneNumberInput } from "@/components/phone-number-input";
import { ProfileImageUpload } from "@/components/profile-image-uploader";


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
    const { id: organisationId, isActive: initialIsActive } = initialData;

    const [isPending, startTransition] = useTransition();
    // Specific for onSubmit
    const [isSavingChanges, setIsSavingChanges]     = useState(false);
    // Specific for activate/deactivate
    const [isActivatingDeactivating, setIsActivatingDeactivating] = useState(false);
    // Specific for delete
    const [isDeleting, setIsDeleting] = useState(false);

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

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
        // --- MORE FIELDS MAPPING ---
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
        isActive:          initialIsActive,

    }), [initialData, initialIsActive]);

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
                    // — Upload logo if user picked one
                    //let finalLogoValue: string | null | undefined; // This will hold the value for the payload
                    let finalLogoValue = initialData.logo; // Start with the initial URL

                    // --- LOGO LOGIC ---
                    // Check if the logo field has been modified by the user.
                    if (dirtyFields.logo) {
                        // If the user has uploaded a new image file...
                        if (values.logo instanceof File) {
                            // Upload the new image to Cloudinary and get the public URL.
                            // The image will be stored in a folder structure like "organisations/logos".
                            finalLogoValue = await uploadToCloudinary(
                                values.logo, 
                                "logo_upload_project_uli", 
                                "organisations/logos"
                            );
                            // If there was an old logo, delete it from Cloudinary to clean up storage.
                            if (initialData.logo) await deleteImageAction(initialData.logo);
                        } else if (values.logo === null) {
                            // If the user has cleared the image, set the value to null.
                            finalLogoValue = null;
                            // Delete the old image from Cloudinary if it existed.
                            if (initialData.logo) await deleteImageAction(initialData.logo);
                        }
                    }
                    
                    const payload: Partial<z.infer<typeof UpdateOrganisationSchema>> = {};

                    if (dirtyFields.organizationName) payload.organizationName = values.organizationName;
                    if (dirtyFields.country) payload.country = values.country;
                    if (dirtyFields.state) payload.state = values.state;

                    // IMPORTANT: If logo is dirty, add it to payload.
                    // This covers new upload, keeping existing, or clearing (null).
                    // If logo is dirty, include it in the payload
                    // This is crucial for both updates and deletions.
                    if (dirtyFields.logo) payload.logo = finalLogoValue;

                    if (dirtyFields.description) payload.description = values.description;
                    if (dirtyFields.industry) payload.industry = values.industry;
                    if (dirtyFields.orgType) payload.orgType = values.orgType;
                    if (dirtyFields.employeeCountRange) payload.employeeCountRange = values.employeeCountRange;
                    if (dirtyFields.revenueRange) payload.revenueRange = values.revenueRange;
                    if (dirtyFields.colorScheme) payload.colorScheme = values.colorScheme;
                    //handle social media links

                    // --- MORE FIELDS PAYLOAD ---
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
                    //if  (dirtyFields.isActive) payload.isActive = values.isActive;


                    if (Object.keys(payload).length === 0) {
                        setError("No changes detected. Please edit at least one field to save.");
                        toast.info("No Changes", { description: "No changes detected. Please edit at least one field to save." });
                        setIsSavingChanges(false);
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
                            logo: finalLogoValue,
                            //logo: finalLogoValue === undefined ? initialData.logo ?? undefined : finalLogoValue ?? undefined
                        });
                        // revalidate the current page
                        router.refresh();
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
        });
    };

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

{/* ───────────────── Active Status ──────────────────────────────────────── */}
    // For activation success/error message
    const [activationError, setActivationError] = useState<string | undefined>("");
    const [activationSuccess, setActivationSuccess] = useState<string | undefined>("");

    // // inside your component, after you’ve pulled out initialIsActive:
    // const isActive = initialIsActive;

    // // Build a dynamic title and message
    // const actionTitle = isActive ? "Deactivate Organisation" : "Reactivate Organisation";
    // const actionDescription = isActive
    // ? "Are you absolutely sure you want to deactivate this organisation? This will prevent users from seeing or interacting with it."
    // : "Are you sure you want to reactivate this organisation? It will become visible and usable again.";

    // // State for the deactivation/reactivation confirmation dialog
    // const [ActivationStatusDialog, organisationActivationStatus] = useConfirm(
    //     actionTitle,
    //     actionDescription
    // )

    const [ActivationDialog, confirmActivation] = useConfirm(
        "Reactivate Organisation",
        "Reactivating this organisation would make it become visible and usable again."
    )

    const [DeactivationDialog, confirmDeactivation] = useConfirm(
        "Deactivate Organisation",
        "Are you absolutely sure you want to deactivate this organisation? This will prevent users from seeing or interacting with it."
    )

    // Handler for deactivation/reactivation action
    const handleOrganisationActivationStatusChange = async () => {
        setActivationError(""); // Clear previous errors
        setActivationSuccess(""); // Clear previous success

        // Trigger the dialog
        if (initialIsActive) {
            const ok = await confirmDeactivation();
            // User cancelled
            if (!ok) return;
        } else {
            const ok = await confirmActivation();
            // User cancelled
            if (!ok) return;
        }

        setIsActivatingDeactivating(true); // Start activate/deactivate loading state

        startTransition(async () => {
            try {
                const newIsActiveStatus = !initialIsActive; // Toggle the status
                const res = await updateOrganisationAction(organisationId, { isActive: newIsActiveStatus });

                if (res.error) {
                    setActivationError(res.error);
                    toast.error(`Failed to ${newIsActiveStatus ? 'reactivate' : 'deactivate'} organization`, { description: res.error });
                } else {
                    setActivationSuccess(`Organization ${newIsActiveStatus ? 'reactivated' : 'deactivated'} successfully!`);
                    toast.success(`Organization ${newIsActiveStatus ? 'Reactivated' : 'Deactivated'}`, {
                        description: `"${initialData.name}" is now ${newIsActiveStatus ? 'active' : 'inactive'}.`,
                    });
                    router.refresh(); // Revalidate data to show updated status
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Something went wrong";
                setActivationError(msg);
                toast.error("Error", { description: msg });
            } finally {
                setIsActivatingDeactivating(false); // End activate/deactivate loading state
            }
        });
    };

{/* ───────────────── Deleting ──────────────────────────────────────── */}
    // For delete success/error message
    const [deleteError, setDeleteError] = useState<string | undefined>("");
    const [deleteSuccess, setDeleteSuccess] = useState<string | undefined>("");

    // State for confirming organization name before deletion
    const [confirmOrgName, setConfirmOrgName] = useState("");

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Organisation",
        "Are you absolutely sure you want to delete this organisation? This action cannot be undone.",
        "destructive"
    )

    const handleDelete = async () => {
        if (confirmOrgName !== initialData.name) {
            setDeleteError("Please type the organization name correctly to confirm deletion.");
            return;
        }

        const ok = await confirmDelete(); // Trigger the dialog
        if (!ok) return; // User cancelled

        setIsDeleting(true); // Start deleting loading state

        startTransition(async () => {
            setDeleteError("");
            setDeleteSuccess(""); // Clear previous messages

            const result = await deleteOrganisationAction(organisationId);
            if (result?.error) {
                setDeleteError(result.error);
                toast.error("Delete Failed", { description: result.error });
            } else {
                setDeleteSuccess("Organisation deleted successfully. Redirecting...");
                toast.success("Organisation deleted successfully.", {
                    description: `"${initialData.name}" has been deleted.`,
                });
                // Redirect to home, doing a hard refresh that clears any cache.
                window.location.href = "/organisations";
            }
            setIsDeleting(false); // End deleting loading state
        });
    };

  return (
    <div className="lg:w-[900px] space-y-6">
        {initialIsActive && (
            <>
                {/* Completion Percentage Display */}
                <Card>
                    <CardHeader>
                        <CardTitle>Update Organization</CardTitle>
                        <CardDescription>Modify any of the fields below, then click “Save Changes.”</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
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
                    </CardContent>
                </Card>
            </>
        )}

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {initialIsActive ? (
                    <>
                        {/* ─────────────────────────────────────────────────────────────────── */}
                            {/* ── Basic Information ──────────────────────────────────────── */}
                        {/* ─────────────────────────────────────────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Building2Icon className="size-5" />
                                    <CardTitle>Basic Information</CardTitle>
                                </div>
                                <CardDescription>Core organization details from your initial setup</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    {/* ── Logo (existing URL or new File) ───────────────────────────────── */}
                                    <ProfileImageUpload
                                        form={form}
                                        name="logo"
                                        label="Organization Logo"
                                        userName={initialData.name}
                                        isDirty={dirtyFields.logo}
                                        disabled={isSavingChanges}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>

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
                                                        disabled={isSavingChanges}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-left" />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>


                        {/* ─────────────────────────────────────────────────────────────────── */}
                            {/* ── Business Details ──────────────────────────────────────── */}
                        {/* ─────────────────────────────────────────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileTextIcon className="size-5" />
                                    <CardTitle>Business Details</CardTitle>
                                </div>
                                <CardDescription>Organization type, industry, and business information</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                        disabled={isSavingChanges}
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
                                                {/* ⚠️ Fixed Height for error message */}
                                                <div className="h-5 overflow-auto">
                                                    <FormMessage className="text-left" />
                                                </div>
                                            </FormItem>
                                        )}
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
                                                        disabled={isSavingChanges}
                                                    />
                                                </FormControl>
                                                {/* ⚠️ Fixed Height for error message */}
                                                <div className="h-5 overflow-auto">
                                                    <FormMessage className="text-left" />
                                                </div>
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
                                                    disabled={isSavingChanges}
                                                    />
                                                </FormControl>
                                                {/* ⚠️ Fixed Height for error message */}
                                                <div className="h-5 overflow-auto">
                                                    <FormMessage className="text-left" />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* ── Color Scheme ───────────────────────────────────────────────────── */}
                                    <SelectPopover
                                        control={form.control}
                                        name="colorScheme"
                                        label="Bussiness Color"
                                        placeholder="Select a color scheme"
                                        options={colorSchemeOptions}
                                        icon={<PaletteIcon/>}
                                        isDirty={dirtyFields.colorScheme}
                                    />
                                </div>
                            </CardContent>
                        </Card>


                        {/* ─────────────────────────────────────────────────────────────────── */}
                            {/* ── Contact Information ──────────────────────────────────────── */}
                        {/* ─────────────────────────────────────────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <MailIcon className="size-5" />
                                    <CardTitle>Contact Information</CardTitle>
                                </div>
                                <CardDescription>Additional contact details and social media</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
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

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                        {/* ── Phone Number ────────────────────────────────────────────────────── */}
                                        <PhoneNumberInput
                                            control={form.control}
                                            name="phoneNumber"
                                            countryFieldName="country"
                                            countries={countries}  // your CountryOptionProps array
                                            label="Phone Number"
                                            isDirty={dirtyFields.phoneNumber}
                                            disabled={isSavingChanges}
                                        />

                                        {/* ── Alternate Phone Number ─────────────────────────────────────────── */}
                                        <PhoneNumberInput
                                            control={form.control}
                                            name="alternatePhoneNumber"
                                            countryFieldName="country"
                                            countries={countries}  // your CountryOptionProps array
                                            label="Alternate Phone Number"
                                            isDirty={dirtyFields.alternatePhoneNumber}
                                            disabled={isSavingChanges}
                                        />
                                    </div>

                                    <Separator />
                                    {/* ************ TODO: Social Media Links********* */}
                                </div>
                            </CardContent>
                        </Card>


                        {/* ─────────────────────────────────────────────────────────────────── */}
                            {/* ── Operational Information ──────────────────────────────────────── */}
                        {/* ─────────────────────────────────────────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Users2Icon className="size-5" />
                                    <CardTitle>Operational Information</CardTitle>
                                </div>
                                <CardDescription>Services, languages, and operational details</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    {/* ************ TODO: Specialties********* */}

                                    {/* ************ TODO: Operating Hours********* */}

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
                                </div>
                            </CardContent>
                        </Card>


                        {/* ─────────────────────────────────────────────────────────────────── */}
                            {/* ── Privacy & Security Settings ──────────────────────────────────────── */}
                        {/* ─────────────────────────────────────────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <EyeIcon className="size-5" />
                                    <CardTitle>Privacy & Security Settings</CardTitle>
                                </div>
                                <CardDescription>Control how your organization information is presented</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    {/* ── Public Profile Toggle ──────────────────────────────────────────── */}
                                    <FormField
                                        control={form.control}
                                        name="isPublicProfile"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between">
                                                <div className="space-y-1 leading-none">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Public Profile</FormLabel>
                                                            {dirtyFields.isPublicProfile && (
                                                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">Make your organization profile visible to the public or only team members</p>
                                                    </div>
                                                    <FormMessage />
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSavingChanges}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* ── Allow Contact Toggle ───────────────────────────────────────────── */}
                                    <FormField
                                        control={form.control}
                                        name="allowContact"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between">
                                                <div className="space-y-1 leading-none">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Allow Contact</FormLabel>
                                                            {dirtyFields.allowContact && (
                                                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">Allow others to contact your organization</p>
                                                    </div>
                                                    <FormMessage />
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSavingChanges}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* ── Show Revenue Toggle ────────────────────────────────────────────── */}
                                    <FormField
                                        control={form.control}
                                        name="showRevenue"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between">
                                                <div className="space-y-1 leading-none">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Show Revenue</FormLabel>
                                                            {dirtyFields.showRevenue && (
                                                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">Display annual revenue information publicly</p>
                                                    </div>
                                                    <FormMessage />
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSavingChanges}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* ── Newsletter Subscription Toggle ───────────────────────────────── */}
                                    <FormField
                                        control={form.control}
                                        name="newsletterSubscription"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between">
                                                <div className="space-y-1 leading-none">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Newsletter Subscription</FormLabel>
                                                            {dirtyFields.newsletterSubscription && (
                                                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">Receive updates and newsletters</p>
                                                    </div>
                                                    <FormMessage />
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSavingChanges}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>


                        {/* ─────────────────────────────────────────────────────────────────── */}
                            {/* ── Modified Fields & Buttons ──────────────────────────────────────── */}
                        {/* ─────────────────────────────────────────────────────────────────── */}
                        <Card>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        {/* Note for modified fields */}
                                        {isDirty && (
                                            <div className="flex justify-end items-center space-x-2 animate-in slide-in-from-bottom duration-200">
                                                <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
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
                                                <RotateCcw className="size-4 mr-2" />
                                                Reset Changes
                                            </Button>
                                        )}

                                        {/* Save Changes */}
                                        <Button
                                            type="submit"
                                            className="flex-1"
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
                            </CardContent>
                        </Card>
                    </>
                )   : (
                    // Deactivated Organization Message Card
                    <Card className="border-amber-500 bg-amber-50 text-amber-900">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ShieldOffIcon className="size-6 text-amber-600" />
                                <CardTitle className="text-amber-900">Organization Deactivated</CardTitle>
                            </div>
                            <CardDescription className="text-amber-800">
                                This organization is currently deactivated. Most of its information is hidden from public view and cannot be edited until it is reactivated. Only the owner can reactivate it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-amber-700">
                                To make changes or restore public visibility, please reactivate the organization using the button below.
                            </p>
                        </CardContent>
                    </Card>
                )}


                {/* ─────────────────────────────────────────────────────────────────── */}
                {/* ── Delete Organisation Zone ─────────────────────────────────────── */}
                {/* ─────────────────────────────────────────────────────────────────── */}
                <DeleteDialog/>
                <DeactivationDialog/>
                <ActivationDialog/>

                <Card className="border-destructive"> {/* Use a red border for emphasis */}
                    <CardHeader>
                        <div className="flex items-center gap-2 text-destructive"> {/* Apply red text to header */}
                            <AlertTriangleIcon className="size-5" /> {/* Warning icon */}
                            <CardTitle>Delete Organisation</CardTitle>
                        </div>
                        <CardDescription>
                            Permanently delete this organization and all its associated data. This action is irreversible.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                            <FormError message={deleteError || activationError} />
                            <div className={isPending || isDeleting || isActivatingDeactivating ? "opacity-50" : "opacity-100 transition-opacity"}>
                                <FormSuccess message={deleteSuccess || activationSuccess} />
                            </div>

                            {/* Add a text input to confirm the organization name for extra safety */}
                            <div className="space-y-2">
                                <Label htmlFor="confirm-delete">To confirm, type the company name &quot;{initialData.name}&quot;</Label>
                                <Input
                                    id="confirm-delete"
                                    value={confirmOrgName}
                                    onChange={(e) => setConfirmOrgName(e.target.value)}
                                    disabled={isPending || isSavingChanges || isActivatingDeactivating || isDeleting}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-2">
                        {/* Deactivate/Reactivate Button */}
                        <Button
                            type="button"
                            onClick={handleOrganisationActivationStatusChange}
                            disabled={isPending || isSavingChanges || isActivatingDeactivating || isDeleting}
                            variant={initialIsActive ? "secondary" : "default"} // Change variant based on status
                            className="flex items-center gap-2"
                        >
                            {isActivatingDeactivating ? (
                                <>
                                    <LoaderCircleIcon className="size-4 mr-2 animate-spin" />
                                    <span>{initialIsActive ? "Deactivating..." : "Reactivating..."}</span>
                                </>
                            ) : (
                                <>
                                    {initialIsActive ?(
                                        <>
                                            <PowerOffIcon className="size-4 mr-2" />
                                            <span>Deactivate Organisation</span>
                                        </>
                                    ) : (
                                        <>
                                            <PowerIcon className="size-4 mr-2" />
                                            <span>Reactivate Organisation</span>
                                        </>
                                    )}
                                    
                                </>
                            )}
                        </Button>
                        
                        {/* Delete Button */}
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={handleDelete}
                            disabled={!confirmOrgName || isPending || isSavingChanges || isActivatingDeactivating || isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <LoaderCircleIcon className="size-4 mr-2 animate-spin" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2Icon className="size-4 mr-2" />
                                    <span>Delete Organisation</span>
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    </div>
  )
}

export default UpdateOrganisationForm