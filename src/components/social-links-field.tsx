// src/components/social-links-field.tsx
"use client";

import { useFieldArray, useFormContext, Control, UseFormSetValue, UseFormWatch, UseFormStateReturn } from "react-hook-form";
import { PlusCircleIcon, MinusCircleIcon, LinkIcon, PencilLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectPopover } from "@/components/select-popover";
import { useEffect } from "react"; // Import useEffect

import { OptionProps } from "@/data/static-data"; // This OptionProps has 'value' and 'label'
import { OrganisationSchema } from "@/features/organisations/schemas";
import { z } from "zod";

// Define OptionPair to match the structure expected by SelectPopover,
// which is now consistent with OptionProps from static-data.
// This interface explicitly uses 'value' and 'label' as required.
interface OptionPair {
  value: string;
  label: string;
}

// Define the type for a single social media link item as it appears in the form data
//type SocialMediaLinkItem = z.infer<typeof OrganisationSchema>['socialMediaLinks'][number];

interface SocialLinksFieldProps {
  socialPlatformOptions: OptionProps[];
  isLoading: boolean;
}

interface SocialLinkItemFieldProps {
  index: number;
  control: Control<z.infer<typeof OrganisationSchema>>;
  setValue: UseFormSetValue<z.infer<typeof OrganisationSchema>>;
  watch: UseFormWatch<z.infer<typeof OrganisationSchema>>;
  dirtyFields: UseFormStateReturn<z.infer<typeof OrganisationSchema>>['dirtyFields'];
  isLoading: boolean;
  platformsWithOther: OptionPair[];
  remove: (index?: number | number[]) => void;
}

/**
 * SocialLinkItemField Component
 * Renders a single dynamic social media link input block.
 * Encapsulates the logic for conditional rendering and useEffect for a single item.
 */
const SocialLinkItemField = ({
  index,
  control,
  setValue,
  watch,
  dirtyFields,
  isLoading,
  platformsWithOther,
  remove,
}: SocialLinkItemFieldProps) => {
  // Watch the current item's platformId to conditionally render customPlatformName
  // Access the specific item in the array using the index
  const currentPlatformId = watch(`socialMediaLinks.${index}.platformId`);
  const showCustomPlatformInput = currentPlatformId === "other";

  // Use a useEffect hook to clear customPlatformName when platformId changes from "other"
  useEffect(() => {
    // Only proceed if a platformId is selected and it's not "other"
    if (currentPlatformId && currentPlatformId !== "other") {
      // Get the current value of customPlatformName for this specific index
      const currentCustomPlatformName = watch(`socialMediaLinks.${index}.customPlatformName`);
      // If there's a value in customPlatformName, clear it
      if (currentCustomPlatformName) {
        setValue(`socialMediaLinks.${index}.customPlatformName`, "", { shouldDirty: true });
      }
    }
  }, [currentPlatformId, index, setValue, watch]); // Depend on currentPlatformId and index

  return (
    <div
      key={index} // Use index as key here, use field.id in the parent's map if available (fields come with a unique id)
      className="flex flex-col gap-3 rounded-lg border p-4 shadow-sm"
    >
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          disabled={isLoading}
          className="text-destructive hover:text-destructive/80"
        >
          <MinusCircleIcon className="size-4" />
          <span className="sr-only">Remove Link</span>
        </Button>
      </div>

      {/* Platform Selector */}
      <FormField
        control={control}
        name={`socialMediaLinks.${index}.platformId`}
        render={({ field: selectField }) => (
          <FormItem>
            <FormLabel>Platform</FormLabel>
            <FormControl>
              <SelectPopover
                control={control}
                name={selectField.name as "socialMediaLinks.0.platformId"} // Cast for correct type inference
                label="Select Platform"
                placeholder="Select a platform"
                options={platformsWithOther}
                icon={<LinkIcon />} // Generic link icon
                // Check dirty state for this specific nested field
                isDirty={(dirtyFields.socialMediaLinks?.[index])?.platformId} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Custom Platform Name Input (conditionally rendered) */}
      {showCustomPlatformInput && (
        <FormField
          control={control}
          name={`socialMediaLinks.${index}.customPlatformName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                Custom Platform Name
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="e.g., Threads, Discord, Custom Blog"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* URL Input */}
      <FormField
        control={control}
        name={`socialMediaLinks.${index}.url`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
              URL
            </FormLabel>
            <FormControl>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  {...field}
                  placeholder="e.g., https://twitter.com/yourorg"
                  type="url"
                  autoComplete="url"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};


/**
 * SocialLinksField Component
 * Manages a dynamic list of social media links for an organization.
 * Allows users to select from predefined platforms or define custom ones,
 * and input the corresponding URL.
 *
 * @param {SocialLinksFieldProps} props - Component props.
 * @param {OptionProps[]} props.socialPlatformOptions - Array of available social media platforms.
 * @param {boolean} props.isLoading - Whether the parent form is in a loading state.
 */
export const SocialLinksField = ({
  socialPlatformOptions,
  isLoading,
}: SocialLinksFieldProps) => {
  // Get the form context including control, watch, formState, and setValue for direct field manipulation
  const { control, watch, formState, setValue } = useFormContext<z.infer<typeof OrganisationSchema>>();
  const { dirtyFields } = formState;

  // Use useFieldArray to manage the dynamic list of social media links
  // The 'name' here must match the field name in your Zod schema (e.g., "socialMediaLinks")
  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialMediaLinks",
  });

  // Prepare platforms for the SelectPopover.
  // Use OptionProps directly as it already conforms to { value: string, label: string }.
  // Add an "Other" option to allow users to input a custom platform name.
  const platformsWithOther: OptionPair[] = [
    ...socialPlatformOptions,
    { value: "other", label: "Other (Specify Name)" },
  ];

  return (
    <FormItem>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FormLabel>Social Media Links</FormLabel>
          {dirtyFields.socialMediaLinks && (
            <PencilLineIcon className="h-4 w-4 text-primary animate-in zoom-in duration-300" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ platformId: "", customPlatformName: "", url: "" })}
          disabled={isLoading}
        >
          <PlusCircleIcon className="mr-2 size-4" />
          Add Link
        </Button>
      </div>
      <FormDescription>
        Add links to your organizations social media profiles.
      </FormDescription>
      
      <div className="space-y-4">
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">No social media links added yet.</p>
        )}
        {fields.map((field, index) => (
          // Render the new SocialLinkItemField component for each item
          <SocialLinkItemField
            key={field.id} // Use the unique ID provided by useFieldArray for the key
            index={index}
            control={control}
            setValue={setValue}
            watch={watch}
            dirtyFields={dirtyFields}
            isLoading={isLoading}
            platformsWithOther={platformsWithOther}
            remove={remove}
          />
        ))}
      </div>
    </FormItem>
  );
};
