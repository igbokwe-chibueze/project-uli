// src/components/LocationSelector.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Globe2Icon, PencilLineIcon } from "lucide-react"
import { useController, Control, Path, FieldValues } from "react-hook-form"
import { CircleFlag } from "react-circle-flags";

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Re‑import your server‑side types here:
import { CountryOptionProps, StateOptionProps } from "@/data/static-data"

interface LocationSelectorProps<T extends FieldValues> {
    /** form control from RHF */
    control: Control<T>
    /** field name for country in your form schema */
    nameCountry: Path<T>
    /** optional field name for state in your form schema */
    nameState?: Path<T>
    /** merge this onto the outer wrapper via `cn` */
    className?: string
    /** disable both pickers while loading/submitting */
    disabled?: boolean
    /** full list of countries from server */
    countries: CountryOptionProps[]
    /** full list of states from server (filter client‑side) */
    states?: StateOptionProps[]
    isCountryDirty?: boolean;
    isStateDirty?: boolean;
}

export const LocationSelector = <T extends FieldValues>({
    control,
    nameCountry,
    nameState,
    className,
    disabled = false,
    countries,
    states = [],
    isCountryDirty = false,
    isStateDirty = false,
}: LocationSelectorProps<T>) => {
    // — bind to country field
    const { field: countryField } = useController({ control, name: nameCountry })
    // — bind to state field if provided
    const { field: stateField }   = useController({ control, name: nameState! })

    const [openCountry, setOpenCountry] = useState(false)
    const [openState,   setOpenState]   = useState(false)

    // find currently selected country object (or undefined)
    const selectedCountry = countries.find(c => c.id === countryField.value)

    // filter down only the states that match the currently selected country
    const filteredStates = states.filter(s => s.countryId === countryField.value)

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
            {/* ─── COUNTRY PICKER ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Country</label>
                {isCountryDirty && (
                    <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                )}
                <Popover open={openCountry} onOpenChange={setOpenCountry}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCountry}
                            disabled={disabled}
                            className="w-full h-12 justify-between"
                        >
                            {/* show selected country or placeholder */}
                            {selectedCountry ? (
                                // show emoji and name when a country is selected
                                <span className="flex items-center gap-2">
                                    {selectedCountry.iso2 && (
                                        <span>
                                            <CircleFlag countryCode={selectedCountry.iso2.toLowerCase()} height={20} width={20} />
                                        </span>
                                    )}
                                    {!selectedCountry.iso2 && selectedCountry.emoji && (
                                        <span>{selectedCountry.emoji}</span>
                                    )}

                                    {selectedCountry.name}
                                </span>
                            ) : (
                                // placeholder when no selection
                                <div className="flex items-center gap-2">
                                    <Globe2Icon className="size-4 text-muted-foreground"/> 
                                    <span className="text-muted-foreground">Select Country…</span>
                                </div>
                            )}
                            <ChevronsUpDown className="size-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command>
                            <CommandInput placeholder="Search country…" />
                            <CommandList>
                                <CommandEmpty>No countries found.</CommandEmpty>
                                <CommandGroup>
                                    <ScrollArea className="h-64">
                                        {countries.map(c => (
                                            <CommandItem
                                                key={c.id}
                                                value={c.name}
                                                onSelect={() => {
                                                    countryField.onChange(c.id)   // write country id into RHF
                                                    setOpenCountry(false)
                                                    // if a state field exists, clear it:
                                                    if (nameState) stateField.onChange("")
                                                }}
                                                className="flex items-center justify-between px-3 py-1"
                                            >
                                                <span className="flex items-center gap-1">
                                                    {c.iso2 && (
                                                        <span>
                                                            <CircleFlag countryCode={c.iso2.toLowerCase()} height={20} width={20} />
                                                        </span>
                                                    )}
                                                    {!c.iso2 && c.emoji && (
                                                        <span>{c.emoji}</span>
                                                    )}
                                                    {c.name}
                                                </span>
                                                <Check
                                                    className={cn(
                                                        "size-4",
                                                        countryField.value === c.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                        <ScrollBar orientation="vertical" />
                                    </ScrollArea>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* ─── STATE PICKER ───────────────────────────────────────────────── */}
            {nameState && filteredStates.length > 0 && (
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">State / Province / Region</label>
                    {isStateDirty && (
                        <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
                    )}
                    <Popover open={openState} onOpenChange={setOpenState}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openState}
                                disabled={!countryField.value}
                                className="w-full h-12 justify-between"
                            >
                                {filteredStates.find(s => s.id === stateField.value)?.name
                                    ?? "Select State…"}
                                <ChevronsUpDown className="size-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Command>
                                <CommandInput placeholder="Search state…" />
                                <CommandList>
                                <CommandEmpty>No states found.</CommandEmpty>
                                    <CommandGroup>
                                        <ScrollArea className="h-64">
                                            {filteredStates.map(s => (
                                                <CommandItem
                                                    key={s.id}
                                                    value={s.name}
                                                    onSelect={() => {
                                                        stateField.onChange(s.id)  // write state id into RHF
                                                        setOpenState(false)
                                                    }}
                                                    className="flex items-center justify-between px-3 py-1"
                                                >
                                                    <span>{s.name}</span>
                                                    <Check
                                                        className={cn(
                                                        "size-4",
                                                        stateField.value === s.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                            <ScrollBar orientation="vertical" />
                                        </ScrollArea>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            )}
        </div>
    )
}
