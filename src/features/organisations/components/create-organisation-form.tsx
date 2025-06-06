// src/features/organisations/components/create-organisation-form.tsx
"use client"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon, GlobeIcon,  } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { CountryOption } from "@/data/static-data";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { SelectPopover } from "@/components/select-popover";
import { FileUploadField } from "@/components/file-upload-field";

import { CardWrapper } from "@/features/auth/components/card-wrapper"
import { CreateOrganisationSchema } from "@/features/organisations/schemas";
import { createOrganisationAction } from "@/features/organisations/actions/createOrganisationAction";

/**
 * Props for the CreateOrganisationForm component:
 * - onCancel?: an optional callback for when the user clicks "Cancel".
 * - countryOptions: an array of { value: id, label: "Name (ISO2)" } pairs populated server-side.
 */
interface CreateOrganisationFormProps {
    onCancel?: () => void;
    countryOptions: CountryOption[];
};

const CreateOrganisationForm = ({onCancel, countryOptions}: CreateOrganisationFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading]     = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [logoKey, setLogoKey] = useState(0);

    const form = useForm<z.infer<typeof CreateOrganisationSchema>>({
        resolver: zodResolver(CreateOrganisationSchema),
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: {
            organizationName: "",
            country: "", // will store the country.id from countryOptions
            logo: undefined,
        },
    });

    /**
   * onSubmit
   * --------
   * 1. If a File is present in `values.logo`, upload it to Cloudinary first.
   * 2. Replace `values.logo` with the returned URL string.
   * 3. Call the server action to write to your Prisma DB.
   * 4. On success, reset the form, bump the logoKey (to clear the file input),
   *    and navigate to the new organisation’s detail page.
   */

    const onSubmit = (values: z.infer<typeof CreateOrganisationSchema>) => {
        // 1️⃣ Reset messages & show spinner immediately
        setError("");
        setSuccess("");
        setIsLoading(true);

        // 2️⃣ Do *all* of the async work inside a single transition
        startTransition(() => {
            (async () => {
                try {
                    // — Upload logo if user picked one
                    let logoUrl: string | undefined;
                    if (values.logo instanceof File) {
                        logoUrl = await uploadToCloudinary(
                            values.logo,
                            "logo_upload_project_uli",
                            "organisations/logos"
                        );
                    }

                    // — Persist to Prisma
                    const res = await createOrganisationAction({ ...values, logo: logoUrl });

                    // — Show toast + form feedback
                    if (res.error) {
                        setError(res.error);
                        toast.error("Creation Failed", { description: res.error });
                    } else {
                        setSuccess(res.success!);
                        toast.success("Organization Created", {
                            description: `"${values.organizationName}" is ready!`,
                        });
                        form.reset();
                        setLogoKey((prev) => prev + 1);
                        // Redirect to /organisations/[id]?created=true
                        // Pass a `created=true` flag so the details page knows “we just created this org”
                        router.push(`/organisations/${res.organizationId}?created=true`);
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
    <CardWrapper
        headerHeading="Create an Organization"
        headerLabel="Fill out the form below to register your organization."
        headerIcon={<Building2Icon className="size-6" />}
        className="lg:w-[600px]"
    >
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">

                    {/* Organization Name */}
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
                                        placeholder="Enter your organization name"
                                        type="text"
                                        autoComplete="organizationName"
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage className="text-left"/>
                            </FormItem>
                        )}
                    />

                    {/* Organization Logo */}
                    <FileUploadField
                        key={logoKey}
                        control={form.control}
                        name="logo"
                        label="Organization Logo"
                        accept="image/*"
                        acceptLabel="Images/ PNG, JPG, SVG"
                        maxSizeMB={3}
                        previewWidth={128}
                        previewHeight={128}
                    />

                    {/* Country */}
                    <SelectPopover
                        control={form.control}
                        name="country"
                        label="Country"
                        placeholder="Select your country"
                        icon={<GlobeIcon/>}
                        options={countryOptions}
                    />

                </div>

                <FormError message={error} />
                <div className={isPending ? "opacity-50" : "opacity-100 transition-opacity"}>
                    <FormSuccess message={success} />
                </div>

                
                <div className="flex gap-3 pt-4">
                    {/* Submit Button */}
                    <Button type="submit" className="flex-1 transition-all duration-200 hover:scale-[1.02]" disabled={isLoading}>
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="size-4 border-2 border-t-transparent border-solid rounded-full animate-spin" />
                                <span>Registering Organization...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Building2Icon className="w-4 h-4 mr-2" />
                                <span>Register Organization</span>
                            </div>
                        )}
                    </Button>
                    
                    {/* Cancel Button */}
                    {onCancel ? (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel Create
                        </Button>
                    ) : (

                        <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                </div>

            </form>

        </Form>
    </CardWrapper>
  )
}

export default CreateOrganisationForm