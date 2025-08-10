// src/features/user/components/update-user-profile-form.tsx
"use client"

import { CountryOptionProps, OptionProps, StateOptionProps } from "@/data/static-data";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { SelectPopover } from "@/components/select-popover";
import { FileUploadField } from "@/components/file-upload-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UpdateUserSchema } from "@/features/user/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateUserAction } from "@/features/user/actions/updateUserAction";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { AtSignIcon, GlobeIcon, LetterTextIcon, LoaderCircleIcon, MailIcon, MapPinIcon, PencilLineIcon, RotateCcwIcon, SaveIcon, ShieldOffIcon, UserIcon, VenusAndMarsIcon } from "lucide-react";
import { PhoneNumberInput } from "@/components/phone-number-input";
import { Separator } from "@/components/ui/separator";
import { LocationSelector } from "@/components/location-selector";
import { MultiSelect } from "@/components/multi-select";
import { ProfileImageUpload } from "@/components/profile-image-uploader";

interface UpdateUserProfileFormProps {
    initialData: User & {
        userLanguages: {
            language: {
                id: string;
                name: string;
                countryCode: string | null ;
            };
        }[];
    };
    
    countries: CountryOptionProps[];
    states?:   StateOptionProps[];
    languageOptions: OptionProps[];
    genderOptions: OptionProps[];

};

const UpdateUserProfileForm = ({initialData, countries, states, languageOptions, genderOptions} : UpdateUserProfileFormProps) => {

    const router = useRouter();
    const { id: userId, isActive: initialIsActive } = initialData;

    const [isPending, startTransition] = useTransition();
    // Specific for onSubmit
    const [isSavingChanges, setIsSavingChanges]     = useState(false);

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    // We bump this key each time we want to reset the FileUploadField to show existing banner image as “preview”
    const [bannerImageKey, setBannerImageKey] = useState(0);

    // Build defaultValues from initialData. For any null/undefined, we pass "" to keep controlled.
    // Correctly map fields from the Prisma model to the form schema.
    // WRAP defaultValues in useMemo.
    // Example
    // This value, initialData.firstName, represents the source of truth for the user's first name as it's currently stored. 
    // The entire line of code is about using this database value to set the initial state of the firstName field in your form.
    const memoizedDefaultValues = useMemo(() => ({
        firstName:          initialData.firstName       ?? "",
        lastName:            initialData.lastName       ?? "",
        otherName:          initialData.otherName       ?? "",
        userName:           initialData.username        ?? "",

        email:              initialData.email           ?? "",
        phoneNumber:        initialData.phoneNumber     ?? "",
        website:            initialData.website         ?? "",
        bio:                initialData.bio             ?? "",

        country:            initialData.countryId       ?? "",
        state:              initialData.stateId         ?? "",
        streetAddress1:     initialData.streetAddress1  ?? "",
        streetAddress2:     initialData.streetAddress2  ?? "",

        bannerImage:        initialData.bannerImage     ?? "",
        image:              initialData.image           ?? "",
        gender:             initialData.gender          ?? "",

        languages:      initialData.userLanguages.map((l) => l.language.id) ?? [],
        
        isTwoFactorEnabled: initialData.isTwoFactorEnabled ?? false,
        loginAlertsEnabled: initialData.loginAlertsEnabled ?? false,
        isActive:          initialIsActive,
    }), [initialData, initialIsActive]);


    const form = useForm<z.infer<typeof UpdateUserSchema>>({
        resolver: zodResolver(UpdateUserSchema),
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: memoizedDefaultValues, // Use the memoized default values
    });

    const { formState } = form;
    const { isDirty, dirtyFields } = formState;

    // Calculate number of modified fields
    const modifiedCount = Object.keys(dirtyFields).length;


    const onSubmit = (values: z.infer<typeof UpdateUserSchema>) => {
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
                    // — Upload image if user picked one
                    let finalImageValue: string | null | undefined; // This will hold the value for the payload

                    // Only process image if it was changed
                    if (dirtyFields.image) {
                        if (values.image instanceof File) {
                            // New file uploaded
                            finalImageValue = await uploadToCloudinary(
                                values.image,
                                "logo_upload_project_uli",
                                "users/profiles"
                            );
                        } else if (typeof values.image === "string") {
                            // Existing URL or explicitly cleared to empty string
                            // If it's an empty string, set to null, otherwise keep the URL
                            finalImageValue = values.image.trim() ? values.image.trim() : null;
                        } else {
                            // If values.image is undefined (e.g., cleared from new file selection)
                            finalImageValue = null; // Explicitly set to null for deletion in DB
                        }
                    } else {
                        // Image field was NOT dirty, keep its initial value from DB.
                        // Important: Initial value might be null in DB, which would be undefined in initialData
                        finalImageValue = initialData.image ?? null;
                    }

                    // — Upload banner image if user picked one
                    let finalBannerImageValue: string | null | undefined; // This will hold the value for the payload

                    // Only process banner image if it was changed
                    if (dirtyFields.bannerImage) {
                        if (values.bannerImage instanceof File) {
                            // New file uploaded
                            finalBannerImageValue = await uploadToCloudinary(
                                values.bannerImage,
                                "logo_upload_project_uli",
                                "users/bannerImages"
                            );
                        } else if (typeof values.bannerImage === "string") {
                            // Existing URL or explicitly cleared to empty string
                            // If it's an empty string, set to null, otherwise keep the URL
                            finalBannerImageValue = values.bannerImage.trim() ? values.bannerImage.trim() : null;
                        } else {
                            // If values.image is undefined (e.g., cleared from new file selection)
                            finalBannerImageValue = null; // Explicitly set to null for deletion in DB
                        }
                    } else {
                        // Image field was NOT dirty, keep its initial value from DB.
                        // Important: Initial value might be null in DB, which would be undefined in initialData
                        finalBannerImageValue = initialData.bannerImage ?? null;
                    }

                    // Construct a payload with only the dirty fields
                    const payload: Partial<z.infer<typeof UpdateUserSchema>> = {};

                    if (dirtyFields.firstName) payload.firstName= values.firstName;
                    if (dirtyFields.lastName) payload.lastName= values.lastName;
                    if (dirtyFields.otherName) payload.otherName= values.otherName;
                    if (dirtyFields.userName) payload.userName= values.userName;

                    if (dirtyFields.email) payload.email= values.email;
                    if (dirtyFields.phoneNumber) payload.phoneNumber= values.phoneNumber;
                    if (dirtyFields.website) payload.website= values.website;
                    if (dirtyFields.bio) payload.bio= values.bio;

                    if (dirtyFields.country) payload.country = values.country;
                    if (dirtyFields.state) payload.state = values.state;
                    if (dirtyFields.streetAddress1) payload.streetAddress1 = values.streetAddress1;
                    if (dirtyFields.streetAddress2) payload.streetAddress2 = values.streetAddress2;

                    if (dirtyFields.languages) payload.languages = values.languages;
                    if (dirtyFields.gender) payload.gender = values.gender;

                    if (dirtyFields.isTwoFactorEnabled) payload.isTwoFactorEnabled = values.isTwoFactorEnabled;
                    if (dirtyFields.loginAlertsEnabled) payload.loginAlertsEnabled = values.loginAlertsEnabled;

                    //handle social media links
                    //if  (dirtyFields.isActive) payload.isActive = values.isActive;

                    // IMPORTANT: If image is dirty, add it to payload.
                    // This covers new upload, keeping existing, or clearing (null).
                    // If image is dirty, include it in the payload
                    if (dirtyFields.image) {
                        payload.image = finalImageValue; // This will be URL string, or null
                    } else {
                        // Edge case: if image was in initialData, and user didn't touch it,
                        // but it needs to be included for consistency or other reasons,
                        // you might add it here. But typically, if !dirty, you don't send.
                        // However, if the initialData.image was null, and the form default is undefined,
                        // and nothing was done, it shouldn't be in dirtyFields.image.
                        // The current structure correctly handles new uploads and explicit clears.
                    }

                    if (dirtyFields.bannerImage) {
                        payload.bannerImage = finalBannerImageValue; // This will be URL string, or null
                    }

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
                            // Ensure logo is correctly set for reset,
                            // particularly if it went from File to URL, or to null
                            image: finalImageValue === undefined ? initialData.image ?? undefined : finalImageValue ?? undefined,
                            bannerImage: finalBannerImageValue === undefined ? initialData.bannerImage ?? undefined : finalBannerImageValue ?? undefined
                        });
                        setBannerImageKey((prev) => prev + 1);
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
        setBannerImageKey((prev) => prev + 1); // Force FileUploadField to re-render with initial logo
        setError(""); // Clear any error messages
        setSuccess(""); // Clear any success messages
        toast.info("Form Reset", { description: "All changes have been reverted." });
    };


  return (
    <div className="lg:w-[900px] space-y-6">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {initialIsActive ? (
                    <div className="space-y-4">
                        {/* ─────────────────────────────────────────────────────────────────── */}
                            {/* ── Basic Information ──────────────────────────────────────── */}
                        {/* ─────────────────────────────────────────────────────────────────── */}

                        {/* ── Profile Image ──────────────────────────────────────────────── */}
                        <ProfileImageUpload
                            form={form}
                            name="image"
                            label="Profile Image"
                            userName={initialData.firstName}
                            isDirty={dirtyFields.image}
                            disabled={isSavingChanges}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ── First Name ──────────────────────────────────────────────── */}
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                                                First Name
                                            </FormLabel>
                                            {dirtyFields.firstName && (
                                                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                            )}
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter your first name"
                                                    type="text"
                                                    autoComplete="firstName"
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

                            {/* ── Surname ──────────────────────────────────────────────── */}
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel> Surname </FormLabel>
                                            {dirtyFields.lastName && (
                                                <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                            )}
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter Surname"
                                                    type="text"
                                                    autoComplete="lastName"
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

                            {/* ── Other Name ──────────────────────────────────────────────── */}
                            <FormField
                                control={form.control}
                                name="otherName"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel> Other Name </FormLabel>
                                            {dirtyFields.otherName && (
                                                <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                            )}
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter other name here"
                                                    type="text"
                                                    autoComplete="otherName"
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

                            {/* ── User Name ──────────────────────────────────────────────── */}
                            <FormField
                                control={form.control}
                                name="userName"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel> User Name </FormLabel>
                                            {dirtyFields.userName && (
                                                <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
                                            )}
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter username here"
                                                    type="text"
                                                    autoComplete="userName"
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

                            {/* ── Gender ───────────────────────────────────────────────────── */}
                            <SelectPopover
                                control={form.control}
                                name="gender"
                                label="Gender"
                                placeholder="Select a gender"
                                options={genderOptions}
                                icon={<VenusAndMarsIcon/>}
                                isDirty={dirtyFields.gender}
                            />
                        </div>

                        {/* ── Bio ────────────────────────────────────────────────────── */}
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>Bio (optional)</FormLabel>
                                        {dirtyFields.bio && (
                                            <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                        )}
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <LetterTextIcon className="absolute left-3 top-5 -translate-y-1/2 size-4 text-muted-foreground"/>
                                            <Textarea
                                                {...field}
                                                placeholder="Describe yourself in a few sentences"
                                                rows={4}
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

                        {/* ─────────────────────────────────────────────────────────────────── */}
                            {/* ── Contact Information ──────────────────────────────────────── */}
                        {/* ─────────────────────────────────────────────────────────────────── */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ── Email ──────────────────────────────────────────────── */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel> Email </FormLabel>
                                            {dirtyFields.email && (
                                                <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
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
                                                    //disabled={isSavingChanges}
                                                    disabled
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
                                                    autoComplete="website"
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

                        <div className="space-y-5 mt-10">
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

                            {/* ── Banner Image (existing URL or new File) ───────────────────────────────── */}
                            <FileUploadField
                                key={bannerImageKey}
                                control={form.control}
                                name="bannerImage"
                                label="User Banner Image"
                                accept="image/*"
                                acceptLabel="Images (PNG, JPG, SVG, etc.)"
                                maxSizeMB={3}
                                previewWidth={600}
                                previewHeight={200}
                            />
                            {/* Pencil icon for Banner Image, placed separately due to FileUploadField's structure */}
                            {dirtyFields.bannerImage && (
                                <div className="min-h-[1.25rem] flex justify-end -mt-4 mr-2"> {/* Adjust margin as needed */}
                                    <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                                </div>
                            )}
                        </div>

                        {/* ── Phone Number ──────────────────────────────────────────────── */}
                        <PhoneNumberInput
                            control={form.control}
                            name="phoneNumber"
                            countryFieldName="country"
                            countries={countries}  // your CountryOptionProps array
                            label="Phone Number"
                            isDirty={dirtyFields.phoneNumber}
                            disabled={isSavingChanges}
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
                                    <FormDescription>Select the languages you speak.</FormDescription>
                                    <FormMessage />
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
            </form>
        </Form>
    </div>
  )
}

export default UpdateUserProfileForm