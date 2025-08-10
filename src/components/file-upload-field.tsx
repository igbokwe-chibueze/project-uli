// src/components/file-upload-field.tsx

import Image from "next/image";
import { cn } from "@/lib/utils";

import { Info, Upload, ImageIcon, X, Check } from "lucide-react";
import { useRef, useState, DragEvent, MouseEvent, useEffect } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";

import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// Define the props for the FileUploadField component, generic on form values T
interface FileUploadFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    accept?: string;
    acceptLabel?: string;
    maxSizeMB?: number;
    previewWidth?: number;
    previewHeight?: number;
}

export const FileUploadField = <T extends FieldValues>({
    control,
    name,
    label,
    accept = "*/*",
    acceptLabel = "Any file",
    maxSizeMB = 3,
    previewWidth = 128,
    previewHeight = 128,
}: FileUploadFieldProps<T>) => {

    const {
        field: { onChange, onBlur, value: fileOrUrl, disabled },
        fieldState: { error },
    } = useController({ name, control });

    const maybeFile = fileOrUrl as unknown;

    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Effect to update previewUrl when fileOrUrl (the form value) changes
    // This is crucial for reacting to form.reset() or initial data loading
    useEffect(() => {
        if (maybeFile instanceof File) {
            setPreviewUrl(URL.createObjectURL(maybeFile));
        } else if (typeof fileOrUrl === "string" && fileOrUrl.trim() !== "") {
            setPreviewUrl(fileOrUrl);
        } else {
            setPreviewUrl(undefined);
        }
    }, [fileOrUrl, maybeFile]); // Re-run when fileOrUrl changes

    /**
     * Unified handler for file selection via drop or input change, or clearing
     * @param file - the selected File object, an empty string (to clear), or undefined
     */
    const handleFile = (file: File | string | undefined) => {
        // If file is explicitly passed as an empty string, set it as such
        // If file is undefined, it means clearing the selection
        if (file === undefined) {
            onChange(null); // normalize to null
            setPreviewUrl(undefined);
            if (inputRef.current) inputRef.current.value = ''; // Clear file input
        } else if (typeof file === 'string' && file.trim() === '') {
            onChange(null); // <- normalize cleared value to null
            setPreviewUrl(undefined);
            if (inputRef.current) inputRef.current.value = ''; // Clear file input
        } else if (file instanceof File) {
            // Handle actual file upload
            if (file.size <= maxSizeMB * 1024 * 1024) {
                onChange(file); // Update react-hook-form value to the File object
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                // If file too large, clear it and let RHF validation handle the error
                onChange(undefined);
                setPreviewUrl(undefined);
                if (inputRef.current) inputRef.current.value = '';
            }
        }
        onBlur(); // Mark as touched for validation
    };

    return (
        <FormItem>
            {/* Label and info tooltip row */}
            <div className="flex items-center gap-2 mb-1">
                <FormLabel>{label}</FormLabel>
                {acceptLabel && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="size-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
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
                    "relative border-2 border-dashed rounded-lg p-6 h-[280px] text-center transition",
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
                    <>
                        <div className="relative mx-auto" style={{ width: previewWidth, height: previewHeight }}>
                            <Image 
                                src={previewUrl} 
                                alt="Preview" 
                                fill 
                                className="object-fill rounded"
                            />
                            {/* Button to remove selected file or clear existing URL */}
                            <button
                                type="button"
                                onClick={(e: MouseEvent) => {
                                    e.stopPropagation();
                                    // If it's an existing URL, pass an empty string to clear it
                                    // Otherwise, pass undefined to clear a newly selected File
                                    handleFile(typeof fileOrUrl === "string" && fileOrUrl.trim() !== "" ? "" : undefined);
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow hover:scale-110 transition"
                            >
                                <X className="size-4 text-destructive" />
                            </button>
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
                                    {!error && <Check className="size-3 animate-in zoom-in duration-300" />}
                                    {maybeFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {(maybeFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        )}
                        {/* Show "Existing Logo" or similar if it's an existing URL 
                            this code block serves as a label to inform the user that the image they are seeing is the 
                            logo currently saved in the database, not a new one they've just picked
                        */}
                        {typeof fileOrUrl === "string" && fileOrUrl.trim() !== "" && !(maybeFile instanceof File) && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Current Logo
                            </p>
                        )}
                    </>
                ) : (
                    /* Placeholder UI when no file is selected */
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                        <div className="mx-auto size-12 text-muted-foreground">
                            {isDragOver ? (
                                <Upload className="w-full h-full animate-bounce" />
                            ) : (
                                <ImageIcon className="w-full h-full" />
                            )}
                        </div>
                        <p className="text-sm font-medium">
                            {isDragOver
                                ? `Drop ${label}`
                                : `Click or drag to upload ${label.toLowerCase()}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {acceptLabel} up to {maxSizeMB}MB
                        </p>
                    </div>
                )}
            </div>

            {error &&
                <FormMessage className="text-left text-destructive animate-in slide-in-from-top duration-200">
                    {error.message}
                </FormMessage>
            }
        </FormItem>
    );
}