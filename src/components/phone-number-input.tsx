// src/components/phone-number-input.tsx
"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { Control, useController, useWatch, Path, FieldValues } from "react-hook-form"
import { parsePhoneNumberFromString, AsYouType, CountryCode, isPossiblePhoneNumber, isValidPhoneNumber } from "libphonenumber-js"

import { Input } from "@/components/ui/input"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { PencilLineIcon } from "lucide-react";

/**
 * Props for PhoneNumberInput2 component:
 * @template T - The form field values type
 * @property control - RHF control instance
 * @property name - The name of the phone number field
 * @property label - Optional label text for the field
 * @property countryFieldName - RHF field name for the selected country ID
 * @property countries - Array of country data to map ID → iso2 + emoji
 * @property disabled - Optional flag to disable the input
 */
interface PhoneNumberInputProps<T extends FieldValues> {
    control: Control<T>
    name: Path<T>
    label?: string
    countryFieldName: Path<T>
    countries: { id: string; iso2?: string; emoji?: string }[]
    required?: boolean;
    isDirty?: boolean;
    disabled?: boolean
}

/**
 * Fallback: derive flag emoji from ISO2 code
 * Useful when dynamically parsed country not in provided list
 */
function getEmojiFromIso(iso2: string) {
    return iso2
        .toUpperCase()
        .split("")
        .map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
        .map(cp => String.fromCodePoint(cp))
        .join("")
}

/**
 * PhoneNumberInput2
 * A phone number input that:
 * - Watches a separate country selector field for context
 * - Displays the country flag inside a circle using react-circle-flags
 * - Formats the number as you type via AsYouType
 * - Validates and reformats on blur using libphonenumber-js
 */
export function PhoneNumberInput<T extends FieldValues>({
    control,
    name,
    label = "Phone Number",
    countryFieldName,
    countries,
    required = false,
    isDirty = false,
    disabled = false,
}: PhoneNumberInputProps<T>) {

    // Bind to RHF field state
    const {
        field: { value, onChange, onBlur },
        fieldState: { invalid, error },
    } = useController({ control, name })

    // Local state for phone validity
    const [numberValid, setNumberValid] = useState<boolean>(true)

    // Watch the selected country ID from the form
    const countryId = useWatch({ control, name: countryFieldName }) as string | undefined
    // Find the selected country from provided options
    const selected = countries.find(c => c.id === countryId)
    // Extract ISO2 and default emoji or fallback
    const iso2 = selected?.iso2 as CountryCode | undefined
    const defaultFlag = selected?.emoji ?? (iso2 ? getEmojiFromIso(iso2) : "")
    // Local state for the displayed flag
    const [flagEmoji, setFlagEmoji] = useState<string>(defaultFlag)

    // Effect: update flag when phone value or selected country changes
    useEffect(() => {
        if (value && iso2) {
            const pn = parsePhoneNumberFromString(value as string)
            if (pn?.country === iso2) {
                setFlagEmoji(defaultFlag)
            } else if (pn?.country) {
                setFlagEmoji(getEmojiFromIso(pn.country))
            } else {
                setFlagEmoji(defaultFlag)
            }
        } else {
            setFlagEmoji(defaultFlag)
        }
    }, [value, iso2, defaultFlag])

    /**
     * handleBlur
     * On input blur, validate and format to international style
     */
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const raw = e.target.value
        const possible = iso2 ? isPossiblePhoneNumber(raw, iso2) : false
        const valid = iso2 ? isValidPhoneNumber(raw, iso2) : false
        let overallValid = possible && valid

        // Country-specific enforcement: Nigeria requires 10-digit national number
        if (iso2 === 'NG' && overallValid) {
        const pn = parsePhoneNumberFromString(raw, iso2)
        if (pn) {
            overallValid = overallValid && pn.nationalNumber.length === 10
        }
        }

        setNumberValid(overallValid)
        if (overallValid) {
        const pn = parsePhoneNumberFromString(raw, iso2)
        if (pn) onChange(pn.formatInternational())
        }
        onBlur()
    }

    /**
     * handleChange
     * Format number as user types for better UX
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        const formatter = new AsYouType(iso2)
        onChange(formatter.input(raw))
    }

  return (
    <FormItem>
        <div className="flex items-center gap-2">
            <FormLabel>
                {label}
                {required && (
                    <span className="ml-0.5 text-destructive" aria-hidden="true">
                        *
                    </span>
                )}
            </FormLabel>

            {isDirty && (
                <PencilLineIcon className="size-4 text-primary animate-in zoom-in duration-300" />
            )}
        </div>
        <FormControl>
            <div className="relative flex items-center">
                {/* Render circular flag via react-circle-flags if iso2 present */}
                {iso2 && (
                    <span className="absolute left-3">
                        <CircleFlag countryCode={iso2.toLowerCase()} height={20} width={20} />
                    </span>
                )}
                {/* Fallback to emoji if circle flag fails or iso2 missing */}
                {!iso2 && flagEmoji && (
                    <span className="absolute left-3 leading-none">{flagEmoji}</span>
                )}

                <Input
                    type="tel"
                    value={(value as string) || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="tel"
                    placeholder="Enter phone number"
                    disabled={disabled}
                    aria-invalid={invalid}
                    className={cn(iso2 || flagEmoji ? 'pl-12' : 'pl-3')}
                />
            </div>
        </FormControl>
        <div className="min-h-[1.25rem]">
            {(!numberValid || invalid) && (
                <FormMessage className="text-destructive">
                    {invalid ? error?.message : 'Invalid phone number for selected country.'}
                </FormMessage>
            )}
        </div>

    </FormItem>
  )
}
