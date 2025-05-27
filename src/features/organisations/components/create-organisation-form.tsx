// src/features/organisations/components/create-organisation-form.tsx
"use client"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CardWrapper } from "@/features/auth/components/card-wrapper"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreateOrganisationSchema } from "../schemas";
import { createOrganisationAction } from "../actions/createOrganisationAction";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { SelectPopover } from "@/components/select-popover";
import { useRouter } from "next/navigation";
import { FileUploadField } from "@/components/file-upload-field";
import { Building2Icon, GlobeIcon,  } from "lucide-react";

const industries = [
    "Technology",
    "Healthcare",
    "Education",
    "Finance",
    "Manufacturing",
    "Retail",
    "Construction",
    "Transportation",
    "Energy",
    "Agriculture",
    "Entertainment",
    "Non-profit",
    "Government",
    "Consulting",
    "Real Estate",
    "Other",
]

const countries = [
    "Nigeria",
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Australia",
    "New Zealand",
    "Japan",
    "South Korea",
    "Singapore",
    "India",
    "China",
    "Brazil",
    "Mexico",
    "Argentina",
    "Chile",
    "South Africa",
    "Kenya",
    "Egypt",
    "Israel",
    "United Arab Emirates",
    "Saudi Arabia",
]

const CreateOrganisationForm = () => {
    //const router = useRouter();
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
            description: "",
            industry: "",
            country: "",
            logo: undefined,
        },
    });

    const onSubmit = (values: z.infer<typeof CreateOrganisationSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            createOrganisationAction(values)
                .then((res) => {
                    setError(res.error);
                    setSuccess(res.success);
                    form.reset();
                    setLogoKey((prev) => prev + 1); // Triggers re-render of FileUploadField
                    //router.push(`/organisations/${res.organizationId}`);
                })
                .catch((err) => {
                    setError(err.message);
                });
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
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormMessage className="text-left"/>
                            </FormItem>
                        )}
                    />

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Describe your organization, its mission, and what you do..."
                                        disabled={isPending}
                                        className="min-h-[120px]"
                                    />
                                </FormControl>
                                <FormDescription className="text-left">{field.value?.length}/500 characters</FormDescription>
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
                        maxSizeMB={1}
                        previewWidth={128}
                        previewHeight={128}
                    />


                    {/* Industry and Country - Responsive Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Industry */}
                        <SelectPopover
                            control={form.control}
                            name="industry"
                            label="Industry"
                            options={industries}
                            placeholder="Select your industry"
                            icon={<Building2Icon/>}
                            required={true}
                        />

                        {/* Country */}
                        <SelectPopover
                            control={form.control}
                            name="country"
                            label="Country"
                            options={countries}
                            placeholder="Select your country"
                            icon={<GlobeIcon/>}
                            required={true}
                        />

                    </div>
                </div>

                <FormError message={error} />
                <FormSuccess message={success} />
                
                {/* Submit Button */}
                <Button type="submit" className="w-full buttons" disabled={isPending}>
                    {isPending ? (
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

            </form>

        </Form>
    </CardWrapper>
  )
}

export default CreateOrganisationForm