// src/components/multi-select.tsx
// A fully responsive multi-select component with optional flag icons.
// On small screens, only the first selected item is displayed along with a "+X more" badge for the rest.
// Uses shadcn/ui components + Tailwind CSS for styling.
// Extensively commented for clarity and maintainability.

import { forwardRef, useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { CheckIcon, XCircle, ChevronsUpDown, XIcon, FlagIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

interface MultiSelectProps {
  options: {
    label: string;
    value: string;
    code?: string; // Optional ISO country code for flags
  }[];
  value: string[]; // Currently selected values
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  maxCount?: number; // Max number of badges shown on large screens
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, value, onValueChange, placeholder = "Select options", maxCount = 3 }, ref) => {
    const [open, setOpen] = useState(false);

    // Add/remove an option from the selection
    const toggleOption = (val: string) => {
      const newValues = value.includes(val)
        ? value.filter((v) => v !== val)
        : [...value, val];
      onValueChange(newValues);
    };

    // Clear all selections
    const clearAll = () => onValueChange([]);

    // Keep only the first `maxCount` selections
    const clearExtras = () => onValueChange(value.slice(0, maxCount));

    // Select all or clear all if already fully selected
    const selectAll = () =>
      onValueChange(value.length === options.length ? [] : options.map((o) => o.value));

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* 
            Responsive trigger button:
            - flex-wrap allows wrapping badges on larger screens
            - On small screens, we'll conditionally render only one badge
          */}
          <Button
            ref={ref}
            variant="outline"
            className="w-full min-h-11 justify-between px-3 py-2 flex-wrap gap-y-2"
            onClick={() => setOpen(!open)}
          >
            {value.length > 0 ? (
              <div className="flex flex-wrap sm:gap-2 items-center justify-between w-full">
                {/* ================================
                    Selected Badges Area
                    ================================ */}
                <div className="flex flex-wrap gap-2 items-center max-w-full overflow-hidden">
                  {/* --- On small screens: show ONLY the first two selected badges --- */}
                  <div className="flex sm:hidden">
                    {/* Render first two badges */}
                    {value.slice(0, 2).map((val) => {
                      const opt = options.find((o) => o.value === val);
                      return (
                        <Badge
                          key={val}
                          className="px-2 py-1 rounded-md text-sm bg-muted text-foreground flex items-center"
                        >
                          {opt?.code && (
                            <CircleFlag
                              countryCode={opt.code}
                              height={16}
                              width={16}
                              className="mr-1 shrink-0"
                            />
                          )}
                          <span className="truncate">{opt?.label}</span>
                        </Badge>
                      );
                    })}

                    {/* Show "+X more" if more than one is selected */}
                    {value.length > 1 && (
                      <Badge className="ml-2 bg-muted text-foreground px-2 py-1 text-sm flex items-center">
                        +{value.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* --- On screens >= sm: show up to `maxCount` badges normally --- */}
                  <div className="hidden sm:flex flex-wrap gap-2 items-center">
                    {value.slice(0, maxCount).map((val) => {
                      const opt = options.find((o) => o.value === val);
                      return (
                        <Badge
                          key={val}
                          className="px-2 py-1 rounded-md text-sm bg-muted text-foreground flex items-center"
                        >
                          {opt?.code && (
                            <CircleFlag
                              countryCode={opt.code}
                              height={16}
                              width={16}
                              className="mr-1 shrink-0"
                            />
                          )}
                          <span className="truncate">{opt?.label}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={`Remove ${opt?.label}`}
                            className="ml-1 size-3 cursor-pointer text-muted-foreground shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOption(val);
                            }}
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

                    {/* If more than maxCount, show "+X more" badge */}
                    {value.length > maxCount && (
                      <Badge className="bg-muted text-foreground px-2 py-1 text-sm flex items-center">
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
                          <XCircle />
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* ================================
                    Clear & Dropdown Icons
                    ================================ */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    role="button"
                    tabIndex={0}
                    className="size-4 text-muted-foreground cursor-pointer"
                    aria-label="Clear all selections"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAll();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        clearAll();
                      }
                    }}
                  >
                    <XIcon />
                  </span>
                  <Separator orientation="vertical" className="min-h-6" />
                  <ChevronsUpDown className="size-4 text-muted-foreground" />
                </div>
              </div>
            ) : (
              /* ================================
                  Placeholder (no selections)
                  ================================ */
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 truncate">
                  <FlagIcon className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{placeholder}</span>
                </div>
                <ChevronsUpDown className="size-4 opacity-50 shrink-0" />
              </div>
            )}
          </Button>
        </PopoverTrigger>

        {/* ================================
            Popover Dropdown Content
            ================================ */}
        <PopoverContent
          className="w-full p-0"
        >
          <Command className="max-h-[70vh] overflow-auto">
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {/* "Select All" option */}
                <CommandItem onSelect={selectAll}>
                  <div className="mr-2 size-4 rounded-sm border border-primary flex items-center justify-center">
                    <CheckIcon
                      className={cn(
                        "size-4 transition",
                        value.length === options.length ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                  (Select All)
                </CommandItem>

                {/* List each option */}
                {options.map((opt) => {
                  const isSelected = value.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => toggleOption(opt.value)}
                    >
                      <div className="mr-2 size-4 rounded-sm border border-primary flex items-center justify-center">
                        <CheckIcon
                          className={cn(
                            "size-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
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

            {/* Footer buttons */}
            <CommandGroup>
              <div className="flex items-center justify-between">
                {value.length > 0 && (
                  <>
                    <CommandItem
                      onSelect={clearAll}
                      className="flex-1 justify-center cursor-pointer"
                    >
                      Clear
                    </CommandItem>
                    <Separator orientation="vertical" className="flex min-h-6 h-full" />
                  </>
                )}
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

MultiSelect.displayName = "MultiSelect";
