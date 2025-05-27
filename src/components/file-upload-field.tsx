// src/components/file-upload-field.tsx

import { useRef, useState, DragEvent } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info, Upload, ImageIcon, X, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    accept?: string;
    acceptLabel?: string;    // friendly text for file types
    maxSizeMB?: number;
    previewWidth?: number;
    previewHeight?: number;
}

export const FileUploadField = <T extends FieldValues>({
    control,
    name,
    label,
    accept,
    acceptLabel,
    maxSizeMB,
    previewWidth,
    previewHeight,
}: FileUploadFieldProps<T>) => {
    const { field, fieldState: { error } } = useController({ name, control });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const file = (field.value as File) ?? undefined;
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(
        file ? URL.createObjectURL(file) : undefined
    );

    const finalizeChange = (file?: File) => {
        field.onChange(file);
        field.onBlur();
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            finalizeChange(file);
            const passesType = accept === "*/*" || accept?.split(",").some(a => file.type.match(a.replace("*", ".*")));
            const passesSize = file.size <= maxSizeMB! * 1024 * 1024;
            if (passesType && passesSize) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(undefined);
            }
        }
    };

    const handleClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            finalizeChange(file);
            const passesType = accept === "*/*" || accept?.split(",").some(a => file.type.match(a.replace("*", ".*")));
            const passesSize = file.size <= maxSizeMB! * 1024 * 1024;
            if (passesType && passesSize) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(undefined);
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        finalizeChange(undefined);
        setPreviewUrl(undefined);
    };

    return (
        <FormItem key={file ? file.name : 'empty'}>
            <FormItem>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <FormLabel htmlFor={name.toString()}>{label}</FormLabel>
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
                    <div
                        id={name.toString()}
                        className={cn(
                            "relative border-2 border-dashed rounded-lg p-6 transition-all duration-300",
                            isDragOver ? "border-primary bg-primary/5 scale-[1.02]" :
                            previewUrl && !error ? "border-green-500 bg-muted" :
                            previewUrl ? "border-yellow-500 bg-yellow-50" :
                            "hover:border-gray-400 hover:bg-gray-50",
                            field.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={field.disabled ? undefined : handleClick}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            className="hidden"
                            onChange={handleFileChange}
                            onBlur={() => field.onBlur()}
                            disabled={field.disabled}
                        />

                        {previewUrl ? (
                            <div className="space-y-3">
                                <div className="relative mx-auto" style={{width: previewWidth, height: previewHeight}}>
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover rounded-lg transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemove}
                                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:scale-110 transition"
                                    >
                                        <X className="size-4 text-destructive" />
                                    </button>
                                    {!error && (
                                        <div className="absolute -bottom-2 -right-2 size-6 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                            <Check className="size-3 text-white" />
                                        </div>
                                    )}
                                </div>

                                {file && (
                                    <div className="text-center">
                                        <p className={cn(
                                            "text-sm font-medium flex items-center justify-center gap-1",
                                            error ? "text-destructive" : "text-green-600"
                                        )}>
                                            {!error && <Check className="size-3 animate-in zoom-in duration-300" />}
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="text-center space-y-3">
                                <div className="mx-auto size-12 text-muted-foreground transition-transform duration-200">
                                    {isDragOver 
                                        ? <Upload className="w-full h-full animate-bounce" /> 
                                        : <ImageIcon className="w-full h-full" />
                                    }
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-secondary-foreground">
                                        {isDragOver ? `Drop your ${label.toLowerCase()} here` : `Upload ${label.toLowerCase()}`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Drag and drop or click to select</p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {acceptLabel} up to {maxSizeMB}MB
                                </p>
                            </div>
                        )}
                    </div>
                    {error && <FormMessage className="text-left text-destructive animate-in slide-in-from-top duration-200">{error.message}</FormMessage>}
                </div>
            </FormItem>
        </FormItem>
    )
}
