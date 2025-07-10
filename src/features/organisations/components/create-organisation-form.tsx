//src/features/organisations/components/create-organisation-form.tsx

"use client"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon, InfoIcon, LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { CountryOptionProps, StateOptionProps } from "@/data/static-data";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { FileUploadField } from "@/components/file-upload-field";

import { CreateOrganisationSchema } from "@/features/organisations/schemas";
import { createOrganisationAction } from "@/features/organisations/actions/createOrganisationAction";
import { CardWrapper } from "@/features/auth/components/card-wrapper"
import { LocationSelector } from "@/components/location-selector";
import { Callout } from "@/components/callout";
import { ResponsiveModal } from "@/components/responsive-modal";

import { OrganizationNameAutocomplete } from "@/components/organization-name-autocomplete";
import { SimilarOrganizationResult } from "@/features/organisations/data/organizations";
import Link from "next/link";

/**
 * Props for the CreateOrganisationForm component:
 * - onCancel?: an optional callback for when the user clicks "Cancel".
 * - countryOptions: an array of { value: id, label: "Name (ISO2)" } pairs populated server-side.
 */
interface CreateOrganisationFormProps {
  onCancel?: () => void;
  countries: CountryOptionProps[];
  states?: StateOptionProps[];

  // Is the create form being used in a modal (e.g CreateOrganisationModal)?
  // This is false by default.
  isModal?: boolean;
};

const CreateOrganisationForm = ({ onCancel, countries, states = [], isModal = false }: CreateOrganisationFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [logoKey, setLogoKey] = useState(0);

  // State to control the guidelines modal
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // State for storing similar organizations to display a warning
  const [similarOrganizationsWarning, setSimilarOrganizationsWarning] = useState<SimilarOrganizationResult[]>([]);

  const form = useForm<z.infer<typeof CreateOrganisationSchema>>({
    resolver: zodResolver(CreateOrganisationSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      organizationName: "",
      country: "",
      state: "",
      logo: undefined,
    },
  });

  /**
   * handleOrganizationNameChange
   * A wrapper function for the organization name field's onChange and onSelect handlers.
   * This function will update the form field and manage the display of duplicate warnings.
   */
  const handleOrganizationNameChange = (
    value: string,
    similarOrgs: SimilarOrganizationResult[] = [],
    isSelection: boolean = false // was a suggested org name clicked.
  ) => {
    // Always clear any previous duplicate warning when the user types or makes a new selection
    setSimilarOrganizationsWarning([]);

    // Update the react-hook-form field
    form.setValue("organizationName", value, { shouldValidate: true });

    // If a selection is made and there are similar organizations (but not an exact match of the selected one),
    // display a warning.
    if (isSelection && similarOrgs.length > 0) {
      // Filter out the exact selected organization from the similar list
      const exactMatches = similarOrgs.filter(
        (org) => org.name.toLowerCase() === value.toLowerCase()
        //If i want all matches, i would have done !== value.toLowerCase() instead.
      );
      if (exactMatches.length > 0) {
        setSimilarOrganizationsWarning(exactMatches);
      }
    }
  };

  /**
   * onSubmit
   * --------
   * 1. If a File is present in `values.logo`, upload it to Cloudinary first.
   * 2. Replace `values.logo` with the returned URL string.
   * 3. Call the server action to write to your Prisma DB.
   * 4. On success, reset the form, bump the logoKey (to clear the file input),
   * and navigate to the new organisation’s detail page.
   */
  const onSubmit = (values: z.infer<typeof CreateOrganisationSchema>) => {
    // 1️⃣ Reset messages & show spinner immediately
    setError("");
    setSuccess("");
    setIsLoading(true);
    setSimilarOrganizationsWarning([]); // Clear warning on submit

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
            toast.error("Creation Failed", { description: "The Organisation could not be created" });
          } else {
            setSuccess(res.success!);
            toast.success("Organization Created", {
              description: `"${values.organizationName}" is ready!`,
            });
            form.reset();
            setLogoKey((prev) => prev + 1);
            router.push(`/organisations/${res.organizationId}?created=true`);
          }
        } catch (err: unknown) {
            // optionally log the real error for debugging
            console.error(err);
            const msg = "Something went wrong";
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
    <>
      <ResponsiveModal
        open={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        title="Registration Guidelines"
      >
        <CardWrapper
          headerHeading="Registration Guidelines"
          headerIcon={<InfoIcon className="size-6 text-blue-800" />}
          className="lg:w-[620px]"
        >
          <div className="space-y-3">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Multi-Country Organizations</h4>
              <p className="text-amber-800 text-sm leading-relaxed">
                If your company is resident in different countries, create separate organizations for each
                country of residence.
                (e.g., if you operate in Nigeria and Ghana, create one entry for Nigeria and another for Ghana,
                using the same organisation name.)
              </p>
            </div>

            <div className="text-sm space-y-2">
              <p>
                <strong>Why separate registrations?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Ensures compliance with local regulations</li>
                <li>Enables country-specific features and services</li>
                <li>Provides better data organization and reporting</li>
              </ul>
            </div>
          </div>
        </CardWrapper>
      </ResponsiveModal>

      <CardWrapper
        headerHeading="Create an Organization"
        headerLabel="Fill out the form below to register your organization."
        headerIcon={<Building2Icon className="size-6" />}
        className="lg:w-[620px]"
      >
        <Callout
          variant="info"
          title="💡 Note !"
        >
          <div className="flex flex-col space-y-4">
            <p>If your organization operates in multiple countries, please see guide</p>
            <Button onClick={() => setIsGuideOpen(true)}>View Guide</Button>
          </div>
        </Callout>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">

              {/* Organization Name Autocomplete Field */}
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <OrganizationNameAutocomplete
                        label=""
                        placeholder="Type organization name..."
                        value={field.value}
                        onChange={(value) => handleOrganizationNameChange(value)}
                        onSelect={(selectedName, similarOrgs) => {
                          if (selectedName) {
                            handleOrganizationNameChange(selectedName, similarOrgs, true);
                          }
                        }}
                        onCreateNew={(newName) => {
                          handleOrganizationNameChange(newName);
                        }}
                        disabled={isLoading}
                        required
                      />
                    </FormControl>
                    <FormMessage />

                    {/* Duplicate Warning Display with Visit Buttons */}
                    {similarOrganizationsWarning.length > 0 && (
                        <Callout variant="warning" title="Possible Duplicates Found!">
                        <p className="text-sm">An organization with a similar name might already exist:</p>
                        <div className="flex flex-wrap w-full gap-2 mt-2">
                            {similarOrganizationsWarning.map((org) => (
                                <Link  
                                    key={org.id}
                                    href={`/organisations/${org.id}`}
                                    className="flex flex-col w-full gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center justify-center gap-4">
                                      <Building2Icon className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                      <span className="font-medium text-sm truncate">{org.name}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="xs"
                                        onClick={() => router.push(`/organisations/${org.id}`)}
                                        className="flex-shrink-0"
                                    >
                                        Visit
                                    </Button>
                                  </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex gap-1 mt-1">
                                            {org.country && (
                                                <Badge variant="secondary" className="text-xs">
                                                {org.country.name}
                                                </Badge>
                                            )}
                                            {org.industry && (
                                                <Badge variant="outline" className="text-xs">
                                                {org.industry.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                </Link>
                            ))}
                        </div>
                        <p className="text-xs mt-2 text-muted-foreground">
                            Please review and ensure you are not creating a duplicate.
                        </p>
                        </Callout>
                    )}
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

              <LocationSelector
                control={form.control}
                nameCountry="country"
                nameState="state"
                countries={countries}
                states={states}
                portal={!isModal}
              />
            </div>

            <FormError message={error} />
            <div className={isPending ? "opacity-50" : "opacity-100 transition-opacity"}>
              <FormSuccess message={success} />
            </div>

            <div className="flex gap-3 pt-4">
              {/* Submit Button */}
              <Button type="submit"
                className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                disabled={!form.formState.isValid || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoaderCircleIcon className="size-4 mr-2 animate-spin" />
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
    </>
  )
}

export default CreateOrganisationForm