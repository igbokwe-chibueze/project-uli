// src/components/organization-name-autocomplete.tsx

"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming you have a utility for class names

// Import the server action and the type for search results
import { searchOrganisationNamesAction } from "@/features/organisations/actions/searchOrganisationNamesAction"
import { SimilarOrganizationResult } from "@/features/organisations/data/organizations"
import { useRouter } from "next/navigation"

// Debounce utility function (can be a shared utility or defined here)
function debounce<Args extends unknown[], R>(
  func: (...args: Args) => R,
  wait: number,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}


interface OrganizationNameAutocompleteProps {
  label?: string
  placeholder?: string
  value?: string // Current input value
  onChange: (value: string) => void // Callback for when the input value changes
  // Callback for when an organization is selected. It also includes similar organizations as the second argument
  onSelect?: (organizationName: string | null, similarOrganizations: SimilarOrganizationResult[]) => void
  onCreateNew?: (name: string) => void // Callback for when the user chooses to create a new organization
  className?: string
  disabled?: boolean
  required?: boolean
  name?: string
  redirectOnSelect?: boolean // Whether to redirect to the clicked existing organisation
  redirectPath?: string // Path to the selected organisation.
  allowNewEntries?: boolean // Whether to show the "Create New" option
  minSearchLength?: number // Minimum characters before starting search
  maxSuggestions?: number // Maximum number of suggestions to display
}

/**
 * OrganizationNameAutocomplete component provides an input field with fuzzy search
 * suggestions for existing organization names, including their industries.
 * It also offers an option to create a new organization if no suitable match is found.
 *
 * This component interacts directly with `searchOrganisationNamesAction` (a Server Action)
 * for fetching suggestions, ensuring all data fetching logic remains on the server.
 */
export function OrganizationNameAutocomplete({
  label = "Organization Name",
  placeholder = "Search for an organization or type a new one...",
  value = "",
  onChange,
  onSelect,
  onCreateNew,
  className,
  disabled = false,
  required = false,
  name = "organizationName",
  redirectOnSelect = false,
  //redirectPath,
  allowNewEntries = true,
  minSearchLength = 3, // Increased for better performance, adjust as needed
  maxSuggestions = 5,
}: OrganizationNameAutocompleteProps) {
  // State for the controlled input field's value
  const [inputValue, setInputValue] = useState(value)
  // State for the list of fuzzy search suggestions
  const [suggestions, setSuggestions] = useState<SimilarOrganizationResult[]>([])
  // State to indicate if suggestions are being loaded
  const [isLoading, setIsLoading] = useState(false)
  // State to control visibility of the suggestions dropdown
  const [showSuggestions, setShowSuggestions] = useState(false)
  // State to track the currently highlighted suggestion for keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(-1)
  // State to confirm if a suggestion has been explicitly selected (for UI checkmark)
  const [hasSelectedSuggestion, setHasSelectedSuggestion] = useState(false)
  // State to control visibility of the "Create New" option
  const [showCreateOption, setShowCreateOption] = useState(false)

  // Refs for managing focus and click-outside behavior
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  // Debounced search function to limit API calls while typing
  // Memoize the debounced search function so we only recreate it
// when any of its “tuning knobs” change.
const debouncedSearch = useMemo(() => {
  // Create a debounced version of our async search callback:
  // - <[string], void> tells TypeScript that `func` takes one string arg and returns void.
  return debounce<[string], void>(async (query) => {
    // --- Early exit if the query is too short ---
    // If the user hasn’t typed enough characters yet, clear out any
    // existing suggestions and hide the “create new” option.
    if (query.length < minSearchLength) {
      setSuggestions([])
      setShowCreateOption(false)
      setIsLoading(false)
      return
    }

    // --- Begin loading state ---
    // Show a spinner or similar so the user knows we’re fetching.
    setIsLoading(true)
    try {
      // Call our server action to perform a fuzzy search
      const results = await searchOrganisationNamesAction(query)

      // Respect the maximum suggestions limit
      const limitedResults = results.slice(0, maxSuggestions)
      setSuggestions(limitedResults)

      // Determine whether to show the “Create new” option:
      // only if new entries are allowed AND the exact string isn’t already in our list.
      const exactMatchFound = limitedResults.some(
        (org) => org.name.toLowerCase() === query.toLowerCase()
      )
      setShowCreateOption(allowNewEntries && !exactMatchFound)

    } catch (error) {
      // If anything goes wrong, log it and clear suggestions so the UI
      // doesn’t stay stuck in a half-loaded state.
      console.error("Error fetching organization suggestions:", error)
      setSuggestions([])
      setShowCreateOption(false)
    } finally {
      // --- End loading state ---
      // Always hide the spinner, whether we succeeded or failed.
      setIsLoading(false)
    }
  // 300ms debounce: waits until the user stops typing for this duration
  }, 300)
  // Re-run this entire creation logic whenever these props/state knobs change
}, [minSearchLength, maxSuggestions, allowNewEntries])



  // Handle input changes from the user
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue) // Update local input state
    setHasSelectedSuggestion(false) // Reset selected state as input has changed
    setSelectedIndex(-1) // Reset highlighted index
    setShowSuggestions(true) // Always show suggestions when typing

    onChange(newValue) // Notify parent component of the new input value

    if (newValue.trim()) {
      debouncedSearch(newValue.trim()) // Trigger debounced search
    } else {
      // Clear suggestions if input is empty
      setSuggestions([])
      setShowCreateOption(false)
      setIsLoading(false);
    }
  }

  // Handle selection of an existing organization from the suggestions
  const handleSelectOrganization = (organization: SimilarOrganizationResult) => {
    setInputValue(organization.name) // Set input to selected organization's name
    setHasSelectedSuggestion(true) // Mark as selected
    setShowSuggestions(false) // Hide suggestions
    setSuggestions([]) // Clear suggestions
    setShowCreateOption(false) // Hide create option

    onChange(organization.name) // Notify parent component of the selected name
    onSelect?.(organization.name, suggestions) // Notify parent component of the selection

    // if redirect is true, then reroute to the organisation details page.
    if (redirectOnSelect) {
      router.push(`/organisations/${organization.id}`)
    }
  }

  // Handle choosing the "Create New" option
  const handleCreateNew = () => {
    const trimmedValue = inputValue.trim()
    if (!trimmedValue) return // Prevent creating empty names

    setShowSuggestions(false) // Hide suggestions
    setSuggestions([]) // Clear suggestions
    setShowCreateOption(false) // Hide create option
    setHasSelectedSuggestion(true); // Mark as if something was 'selected' (the new entry)

    onCreateNew?.(trimmedValue) // Notify parent component to handle creation
  }

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    const totalOptions = suggestions.length + (showCreateOption ? 1 : 0)

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault() // Prevent cursor movement in input
        setSelectedIndex((prev) => (prev + 1) % totalOptions)
        break
      case "ArrowUp":
        e.preventDefault() // Prevent cursor movement in input
        setSelectedIndex((prev) => (prev <= 0 ? totalOptions - 1 : prev - 1))
        break
      case "Enter":
        e.preventDefault() // Prevent form submission
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            // User selected an existing organization
            handleSelectOrganization(suggestions[selectedIndex])
          } else if (showCreateOption) {
            // User selected "Create New" option
            handleCreateNew()
          }
        }
        // If Enter is pressed without a selection and there's valid input,
        // and allowNewEntries is true, you might consider automatically
        // triggering onCreateNew, but typically it requires explicit selection.
        break
      case "Escape":
        setShowSuggestions(false) // Hide suggestions
        setSelectedIndex(-1) // Reset index
        inputRef.current?.blur() // Remove focus from input
        break
    }
  }

  // Effect to handle clicks outside the component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Effect to update internal input value if the `value` prop changes (e.g., from parent form reset)
  useEffect(() => {
    if (value !== inputValue) { // Prevent infinite loop if value is already the same
      setInputValue(value)
      // If parent explicitly sets an empty value, clear selection status
      if (!value) {
        setHasSelectedSuggestion(false);
      }
    }
  }, [value, inputValue])

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id={name}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Show suggestions on focus if there are existing results or create option
            if (suggestions.length > 0 || showCreateOption || inputValue.trim().length >= minSearchLength) {
              setShowSuggestions(true)
              // If there's already input, trigger a fresh search on focus
              if (inputValue.trim().length >= minSearchLength && suggestions.length === 0 && !isLoading) {
                 debouncedSearch(inputValue.trim());
              }
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="pr-10" // Add padding-right for icons
          autoComplete="off" // Disable browser autocomplete
          role="combobox"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Checkmark icon for successful selection */}
        {hasSelectedSuggestion && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown card */}
      {showSuggestions && (suggestions.length > 0 || showCreateOption) && (
        <Card ref={suggestionsRef} className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border shadow-lg">
          <CardContent className="p-0">
            <div role="listbox" aria-label="Organization name suggestions">
              {suggestions.map((org, index) => (
                <div
                  key={org.id}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer border-b last:border-b-0 hover:bg-muted/50",
                    index === selectedIndex && "bg-muted", // Highlight selected item
                  )}
                  onClick={() => handleSelectOrganization(org)}
                >
                  <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{org.name}</div>
                    <div className="flex items-center gap-2">
                      {org.country?.name && ( // Display country if available
                        <Badge variant="secondary" className="text-xs mt-1">
                          {org.country.name}
                        </Badge>
                      )}
                      {org.industry?.name && ( // Display industry if available
                        <Badge variant="outline" className="text-xs mt-1">
                          {org.industry.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* "Create New" option */}
              {showCreateOption && (
                <div
                  role="option"
                  aria-selected={selectedIndex === suggestions.length}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 border-t",
                    selectedIndex === suggestions.length && "bg-muted", // Highlight create option
                  )}
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Create &ldquo;{inputValue}&ldquo;</div>
                    <div className="text-xs text-muted-foreground">Add as a new organization</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}