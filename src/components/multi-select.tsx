

import { forwardRef, useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { CheckIcon, XCircle, ChevronsUpDown, XIcon, FlagIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent,} from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator,} from "@/components/ui/command";

// Props for the MultiSelect component
interface MultiSelectProps {
    options: {
        label: string;       // User-visible label for each option
        value: string;       // Underlying value for internal state
        code?: string;       // Optional country code for flag icons
    }[];
    value: string[];                      // Currently selected values
    onValueChange: (value: string[]) => void; // Callback when selection changes
    placeholder?: string;                // Placeholder text when no selection
    maxCount?: number;                   // Max number of badges to show before collapsing
}

// Forward-ref to allow parent components to control focus on the trigger button
export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
    ({ options, value, onValueChange, placeholder = "Select options", maxCount = 3 }, ref ) => {
        // Local state for popover open/close
        const [open, setOpen] = useState(false);

        // Toggle a single option: add or remove from current selection
        const toggleOption = (val: string) => {
        const newValues = value.includes(val)
            ? value.filter((v) => v !== val)
            : [...value, val];
        onValueChange(newValues);
        };

        // Clear all selected options
        const clearAll = () => onValueChange([]);

        // Limit selection to first `maxCount` items
        const clearExtras = () => onValueChange(value.slice(0, maxCount));

        // Select all options, or deselect all if already fully selected
        const selectAll = () =>
        onValueChange(
            value.length === options.length ? [] : options.map((o) => o.value)
        );

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    {/* Trigger button: shows current selection or placeholder */}
                    <Button
                        ref={ref}
                        variant="outline"
                        className="w-full h-11 justify-between"
                        onClick={() => setOpen(!open)}
                    >
                        {value.length > 0 ? (
                            // Render selected values as badges when any are chosen
                            <div className="flex flex-wrap gap-2 items-center justify-between w-full">
                                <div className="flex flex-wrap gap-2 items-center">
                                    {value.slice(0, maxCount).map((val) => {
                                        const opt = options.find((o) => o.value === val);
                                        return (
                                            <Badge
                                                key={val}
                                                className="px-2 py-1 rounded-md text-sm bg-muted text-foreground"
                                            >
                                                {/* Optional flag icon when a country code is provided */}
                                                {opt?.code && (
                                                    <CircleFlag
                                                        countryCode={opt.code}
                                                        height={16}
                                                        width={16}
                                                        className="mr-1"
                                                    />
                                                )}
                                                {opt?.label}
                                                {/* Remove this tag when the X icon is clicked */}
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-label={`Remove ${opt?.label}`}
                                                    className="ml-1 size-3 cursor-pointer text-muted-foreground"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleOption(val);
                                                    }}
                                                    // Support keyboard activation: Enter or Space
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            toggleOption(val);
                                                        }
                                                    }}
                                                >
                                                    <XCircle />
                                                </span>
                                            </Badge>
                                        );
                                    })}

                                    {/* Show a collapsed badge when more items than `maxCount` */}
                                    {value.length > maxCount && (
                                        <Badge className="bg-muted text-foreground px-2 py-1 text-sm">
                                            +{value.length - maxCount} more
                                            <span
                                                role="button"
                                                tabIndex={0}
                                                aria-label="Show fewer selections"
                                                className="ml-1 size-3 cursor-pointer text-muted-foreground"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearExtras();
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        clearExtras();
                                                    }
                                                }}
                                            >
                                                <XCircle/>
                                            </span>
                                        </Badge>
                                    )}
                                </div>

                                {/* Controls: clear all & dropdown icon */}
                                <div className="flex items-center gap-2">
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="size-4 text-muted-foreground cursor-pointer"
                                        aria-label="Clear all selections"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the outer PopoverTrigger button from also toggling
                                            clearAll(); // Clear all selected items
                                        }}
                                        onKeyDown={(e) => {
                                            // Support keyboard activation: Enter or Space
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault(); // Avoid scrolling on Space
                                                clearAll();
                                            }
                                        }}
                                    >
                                        <XIcon />
                                    </span>
                                    {/* <XIcon
                                        className="size-4 text-muted-foreground cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearAll();
                                        }}
                                    /> */}
                                    <Separator orientation="vertical" className="min-h-6" />
                                    <ChevronsUpDown className="size-4 text-muted-foreground" />
                                </div>
                            </div>
                            ) : (
                            // Placeholder state when nothing is selected
                            <>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="size-4 text-muted-foreground">
                                        <FlagIcon />
                                    </div>
                                    <span className="text-sm">{placeholder}</span>
                                </div>
                                <ChevronsUpDown className="ml-2 size-4 opacity-50" />
                            </>
                        )}
                    </Button>
                </PopoverTrigger>

                {/* Dropdown content: searchable command list */}
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Search..." />

                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {/* "Select All" control at the top of the list */}
                                <CommandItem onSelect={selectAll}>
                                    <div
                                        className="mr-2 size-4 rounded-sm border border-primary flex items-center justify-center"
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "size-4 transition",
                                                value.length === options.length
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                        />
                                    </div>
                                    (Select All)
                                </CommandItem>
                                {/* Render each option with its own selectable item */}
                                {options.map((opt) => {
                                    const isSelected = value.includes(opt.value);
                                    return (
                                        <CommandItem
                                            key={opt.value}
                                            value={opt.label}
                                            onSelect={() => toggleOption(opt.value)}
                                        >
                                            <div
                                                className="mr-2 size-4 rounded-sm border border-primary flex items-center justify-center"
                                            >
                                                <CheckIcon className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")}/>
                                            </div>

                                            {/* Optional flag next to label */}
                                            {opt.code && (
                                                <CircleFlag
                                                countryCode={opt.code}
                                                height={16}
                                                width={16}
                                                className="mr-2"
                                                />
                                            )}
                                            
                                            {opt.label}

                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>

                        <CommandSeparator />
                        
                        {/* Footer Buttons */}
                        <CommandGroup>
                            <div className="flex items-center justify-between">
                                {/* Clear action if any are selected */}
                                {value.length > 0 && (
                                    <>
                                        <CommandItem
                                        onSelect={clearAll}
                                        className="flex-1 justify-center cursor-pointer"
                                        >
                                        Clear
                                        </CommandItem>
                                        <Separator
                                        orientation="vertical"
                                        className="flex min-h-6 h-full"
                                        />
                                    </>
                                )}

                                {/* Close dropdown */}
                                <CommandItem
                                    onSelect={() => setOpen(false)}
                                    className="flex-1 justify-center cursor-pointer max-w-full"
                                >
                                    Close
                                </CommandItem>
                            </div>
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }
);

// Assign a display name for React DevTools
MultiSelect.displayName = "MultiSelect";
