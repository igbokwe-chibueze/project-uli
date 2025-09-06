// src/components/profile-image-uploader.tsx

'use client';

// Importing necessary icons and React hooks
import { UploadIcon, Trash2Icon, PencilLineIcon } from 'lucide-react';
import { ChangeEvent, useState, useRef } from 'react';
import { UseFormReturn, FieldValues, FieldPath, FieldPathValue } from 'react-hook-form';

// Importing a helper function to get initials from a name
import { getInitials } from '@/lib/getInitials';

// Importing UI components from Shadcn/ui
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


// Defining the props interface for the component using generics.
// This makes the component reusable with any form schema that has a file upload field.
interface ProfileImageUploadProps<TForm extends FieldValues> {
  form: UseFormReturn<TForm>; // The form object from react-hook-form
  name: FieldPath<TForm>; // The name of the form field, typed to be a valid path in TForm
  label: string; // The label to display for the component
  userName?: string; // Optional user name for generating initials
  isDirty?: boolean; // Flag to indicate if the field has been modified
  disabled?: boolean; // Flag to disable the component
}

// The main component, typed with generics for reusability.
export const ProfileImageUpload = <TForm extends FieldValues>({
  form,
  name,
  label,
  userName,
  isDirty = false,
  disabled = false,
}: ProfileImageUploadProps<TForm>) => {
  // Creating a ref to access the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State to store the URL of the selected image for immediate preview
  const [preview, setPreview] = useState<string | null>(null);

  /**
   * Handles the file selection change event.
   * Reads the selected file and sets it as a preview and updates the form state.
   * @param event The ChangeEvent from the file input.
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a FileReader to read the file content
      const reader = new FileReader();
      reader.onloadend = () => {
        // Set the preview state with the data URL of the image
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file); // Read the file as a data URL

      // Set the file value in the react-hook-form state with correct typing.
      // We use a type assertion here to tell TypeScript that the file is the expected type for this field.
      form.setValue(name, file as FieldPathValue<TForm, typeof name>, { shouldDirty: true });
    }
  };

  /**
   * This function is called when the "Upload" button or the avatar is clicked.
   * It programmatically triggers a click on the hidden file input.
   */
  const handleUploadClick = () => {
    // Check if the file input ref exists and is not disabled
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handles the removal of the selected image.
   * Clears the preview, sets the form value to null, and resets the file input.
   */
  const handleRemoveClick = () => {
    setPreview(null);
    // Set the form value to null with correct typing
    form.setValue(name, null as FieldPathValue<TForm, typeof name>, { shouldDirty: true });
    // Reset the file input's value to allow the same file to be re-uploaded
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center space-x-4">
          <div className="relative">
            {/* Make the avatar clickable. The onClick handler triggers the hidden file input.
              The cursor-pointer class provides visual feedback to the user.
            */}
            <Avatar className="size-28 rounded-lg cursor-pointer" onClick={handleUploadClick}>
              <AvatarImage
                src={preview || (field.value as string) || '/placeholder-profile.jpg'}
                alt="Profile picture preview"
              />
              <AvatarFallback className='rounded-lg text-4xl'>
                {/* The getInitials function uses the userName prop if available,
                  otherwise it falls back to the provided label.
                */}
                {getInitials(userName || label)}
              </AvatarFallback>
            </Avatar>
            {isDirty && (
              <PencilLineIcon className="absolute bottom-1 right-1 size-4 text-primary animate-in zoom-in duration-300" />
            )}
          </div>
          <div className="space-y-2">
            <FormLabel>{""}</FormLabel>
            <div className="flex flex-col gap-2">
              {/* This is the hidden file input that will be triggered by the avatar or the "Upload" button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                disabled={disabled}
              >
                <UploadIcon className="size-4 mr-2" />
                Upload {label}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveClick}
                disabled={!field.value || disabled}
              >
                <Trash2Icon className="size-4 mr-2" />
                Remove {label}
              </Button>
            </div>

            <FormDescription>
              Upload a new {label}. Max size: 3MB.
            </FormDescription>

            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}