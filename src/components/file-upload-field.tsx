// src/components/file-upload-field.tsx

import { useRef, useState, DragEvent, MouseEvent } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Image from "next/image";
import { Info, Upload, ImageIcon, X, Check } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Define the props for the FileUploadField component, generic on form values T
interface FileUploadFieldProps<T extends FieldValues> {
    control: Control<T>;           // react-hook-form control object
    name: Path<T>;                // form field name corresponding to File (or undefined)
    label: string;                // label text displayed above the dropzone/input
    accept?: string;              // accepted file MIME types (defaults to any)
    acceptLabel?: string;         // human-readable accepted file description
    maxSizeMB?: number;           // maximum file size in megabytes
    previewWidth?: number;        // width of the preview image
    previewHeight?: number;       // height of the preview image
}

export function FileUploadField<T extends FieldValues>({
    control,
    name,
    label,
    accept = "*/*",
    acceptLabel = "Any file",
    maxSizeMB = 3,
    previewWidth = 128,
    previewHeight = 128,
}: FileUploadFieldProps<T>) {

    // Connect this field to React Hook Form, grabbing the onChange/onBlur handlers,
    // the current value (which might be a File or a URL string), and disabled state.
    const {
        field: { onChange, onBlur, value: fileOrUrl, disabled },
        fieldState: { error },
    } = useController({ name, control });

    // fileOrUrl is a generic PathValue, so cast it to unknown first
    // so TypeScript will allow us to test `instanceof File`.
    const maybeFile = fileOrUrl as unknown;

    // Determine the very first preview URL to show:
    //  • If the form value is a File, create a temporary object URL for preview.
    //  • Else, if the value is a non-empty string, we assume it’s an existing image URL.
    //  • Otherwise, there’s no preview (undefined).
    const initialPreview =
        maybeFile instanceof File
        ? URL.createObjectURL(maybeFile)            // preview new File
        : typeof fileOrUrl === "string" &&
            fileOrUrl.trim() !== ""                   // non-empty string?
        ? fileOrUrl                                  // use existing URL
        : undefined;                                 // no preview

    // previewUrl state drives what image is shown in the dropzone.
    // Initialize it to the computed initialPreview.
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(
        initialPreview
    );

    // track drag-over state for styling
    const [isDragOver, setIsDragOver] = useState(false);

    // reference to hidden file input to trigger click programmatically
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * Unified handler for file selection via drop or input change
     * @param file - the selected File object or undefined
     */
    const handleFile = (file?: File) => {
        onChange(file);        // update react-hook-form value
        onBlur();              // mark as touched for validation
        // if file is present and within size limit, create preview URL
        if (file && file.size <= maxSizeMB * 1024 * 1024) {
        setPreviewUrl(URL.createObjectURL(file));
        } else {
        // if no file or file too large, clear preview
        setPreviewUrl(undefined);
        }
    };

  return (
    <FormItem>
      {/* Label and info tooltip row */}
      <div className="flex items-center gap-2 mb-1">
        <FormLabel>{label}</FormLabel>
        {acceptLabel && (
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Info icon triggers tooltip */}
              <Info className="size-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              {/* Tooltip shows accepted types and size limit */}
              <p>{acceptLabel} up to {maxSizeMB}MB</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Dropzone / clickable upload area */}
      <div
        onDragOver={(e: DragEvent) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          setIsDragOver(false);
          const dropped = e.dataTransfer.files?.[0];
          handleFile(dropped);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center transition",
          disabled && "opacity-50 cursor-not-allowed",
          isDragOver ? "border-primary bg-primary/10" :
          previewUrl ? "border-green-500 bg-muted" :
          "hover:border-primary hover:bg-primary/10"
        )}
      >
        {/* Hidden file input for clicking */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {/* If previewUrl exists, show preview */}
        {previewUrl ? (
          <div>
            {/* Image preview with close and check icons */}
            <div className="relative mx-auto" style={{ width: previewWidth, height: previewHeight }}>
              <Image src={previewUrl} alt="Preview" fill className="object-cover rounded" />
              {/* Button to remove selected file */}
              <button
                type="button"
                onClick={(e: MouseEvent) => { e.stopPropagation(); handleFile(undefined); }}
                className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow hover:scale-110 transition"
              >
                <X className="size-4 text-destructive" />
              </button>
              {/* Visual success indicator if no error */}
              {!error && (
                <div className="absolute -bottom-2 -right-2 size-5 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  <Check className="size-3 text-white" />
                </div>
              )}
            </div>

            {/* File name and size info — only when it’s an actual File */}
            {maybeFile instanceof File && (
              <div className="text-center">
                <p className={cn(
                  "text-sm font-medium flex items-center justify-center gap-1",
                  error ? "text-destructive" : "text-green-600"
                )}>
                  {/* Inline check icon if no error */}
                  {!error && <Check className="size-3 animate-in zoom-in duration-300" />}
                  {maybeFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(maybeFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Placeholder UI when no file is selected */
          <div className="text-center space-y-3">
            <div className="mx-auto size-12 text-muted-foreground">
              {/* Icon changes on drag-over */}
              {isDragOver ? <Upload className="w-full h-full animate-bounce" /> : <ImageIcon className="w-full h-full"/>}
            </div>
            <p className="text-sm font-medium">
              {isDragOver ? `Drop ${label}` : `Click or drag to upload ${label.toLowerCase()}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {acceptLabel} up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {/* Display validation error message, if any */}
      {error && 
        <FormMessage className="text-left text-destructive animate-in slide-in-from-top duration-200">
          {error.message}
        </FormMessage>
      }
    </FormItem>
  );
}

