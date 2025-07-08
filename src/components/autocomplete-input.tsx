// src/components/autocomplete-input.tsx

"use client"

import type React from "react"
import { forwardRef, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAutocomplete, type AutocompleteOption } from "@/hooks/use-autocomplete"

// Define props for the AutocompleteInput component
interface AutocompleteInputProps {
  placeholder?: string // Placeholder text for the input field
  value?: AutocompleteOption | AutocompleteOption[] // Controlled value (single or multiple)
  onChange?: (value: AutocompleteOption | AutocompleteOption[] | null) => void // Callback when selection changes
  fetchSuggestions: (query: string) => Promise<AutocompleteOption[]> // Async fetcher for suggestion list
  fetchInitialSuggestions?: () => Promise<AutocompleteOption[]> // Optional fetcher for initial suggestions
  createNew?: (query: string) => Promise<AutocompleteOption> // Optional callback to create a new option
  debounceMs?: number // How long to debounce input events
  minQueryLength?: number // Minimum characters before fetching suggestions
  mode?: "single" | "multiple" // Single or multi-select mode
  allowCreateNew?: boolean // Allow creating new options not in suggestions
  showInitialSuggestions?: boolean // Show initial suggestions when focused
  initialSuggestionsCount?: number // Number of initial suggestions to display
  createNewLabel?: string // Label text for create-new button
  className?: string // Additional class names for styling
  disabled?: boolean // Disable the entire input
  required?: boolean // Mark input as required
  name?: string // Input name attribute
  maxSelections?: number // Maximum number of selections in multi-mode
}

// ForwardRef to allow parent components to access the underlying input element
export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  (
    {
      placeholder = "Type to search...",
      value,
      onChange,
      fetchSuggestions,
      fetchInitialSuggestions,
      createNew,
      debounceMs = 300,
      minQueryLength = 1,
      mode = "single",
      allowCreateNew = true,
      showInitialSuggestions = false,
      initialSuggestionsCount = 5,
      createNewLabel = "Create new",
      className,
      disabled = false,
      required = false,
      name,
      maxSelections,
    },
    ref,
  ) => {
    // Refs for container and input elements
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Wrap onChange in useCallback to avoid unnecessary re-renders
    const handleChange = useCallback(
      (newValue: AutocompleteOption | AutocompleteOption[] | null) => {
        onChange?.(newValue)
      },
      [onChange],
    )

    // Destructure hook-provided state and actions
    const {
      query,
      setQuery,
      suggestions,
      selectedValue,
      isLoading,
      isCreating,
      isOpen,
      setIsOpen,
      selectedIndex,
      error,
      handleKeyDown,
      selectOption,
      handleCreateNew,
      removeOption,
      clearAll,
      handleFocus,
    } = useAutocomplete({
      fetchSuggestions,
      fetchInitialSuggestions,
      createNew: allowCreateNew ? createNew : undefined,
      debounceMs,
      minQueryLength,
      mode,
      initialValue: value,
      onChange: handleChange,
      showInitialSuggestions,
      initialSuggestionsCount,
      allowCreateNew,
    })

    // Close dropdown when clicking outside component
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [setIsOpen])

    // Update internal query state on input change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
      },
      [setQuery],
    )

    // Delegate option selection to hook
    const handleOptionSelect = useCallback(
      (option: AutocompleteOption) => {
        selectOption(option)
      },
      [selectOption],
    )

    // Create new option when requested
    const handleCreateNewOption = useCallback(async () => {
      if (query.trim()) {
        await handleCreateNew(query.trim())
      }
    }, [query, handleCreateNew])

    // Wrap keydown logic to handle arrow, enter, and create new via keyboard
    const handleKeyDownWrapper = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        const result = handleKeyDown(e)
        if (result) {
          if (result.type === "select") {
            handleOptionSelect(result.option!) // Selecting existing suggestion
          } else if (result.type === "create") {
            handleCreateNewOption() // Creating new option
          }
        }
      },
      [handleKeyDown, handleOptionSelect, handleCreateNewOption],
    )

    // Open dropdown on focus
    const handleInputFocus = useCallback(() => {
      handleFocus()
    }, [handleFocus])

    // Determine if "create new" option should show
    const showCreateOption =
      allowCreateNew &&
      query.trim() &&
      !suggestions.some((s) => s.label.toLowerCase() === query.toLowerCase()) &&
      (!maxSelections || !(Array.isArray(selectedValue) && selectedValue.length >= maxSelections))

    // Check if user can select more items (multi-mode)
    const canAddMore = !maxSelections || !(Array.isArray(selectedValue) && selectedValue.length >= maxSelections)

    // Display text in the input: selected label or typing query
    const displayValue =
      mode === "single" && selectedValue && !Array.isArray(selectedValue) ? selectedValue.label : query

    // Determine when to render dropdown
    const shouldShowDropdown = isOpen && canAddMore && (suggestions.length > 0 || showCreateOption || error)

    return (
      <div ref={containerRef} className="relative w-full">
        {/* Render selected items for multi-select mode */}
        {mode === "multiple" && Array.isArray(selectedValue) && selectedValue.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedValue.map((option) => (
              <Badge key={option.id} variant="secondary" className="flex items-center gap-1">
                {option.label}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeOption(option)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <div className="relative">
          {/* Main input field */}
          <Input
            ref={ref || inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDownWrapper}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className={cn("pr-16", className)}
            disabled={disabled || (mode === "multiple" && !canAddMore)}
            required={required}
            name={name}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />

          {/* Loading spinner and clear button */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {(isLoading || isCreating) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

            {((mode === "single" && selectedValue && !Array.isArray(selectedValue)) ||
              (mode === "multiple" && Array.isArray(selectedValue) && selectedValue.length > 0)) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={clearAll}
                disabled={disabled}
                title={mode === "single" ? "Clear selection" : "Clear all selections"}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Dropdown suggestions panel */}
        {shouldShowDropdown && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto border shadow-lg">
            {error ? (
              <div className="p-3 text-sm text-destructive">{error}</div> // Display error message
            ) : suggestions.length > 0 || showCreateOption ? (
              <div role="listbox" className="py-1">
                {/* Map through fetched suggestions */}
                {suggestions.map((option, index) => (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                      index === selectedIndex && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {/* Highlight selected index */}
                      {index === selectedIndex && <Check className="h-4 w-4" />}
                    </div>
                  </button>
                ))}

                {/* Render create-new option if applicable */}
                {showCreateOption && (
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none border-t",
                      selectedIndex === suggestions.length && "bg-accent text-accent-foreground",
                    )}
                    onClick={handleCreateNewOption}
                    disabled={isCreating}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>
                        {createNewLabel}: “{query}” // Show label for creating new option
                      </span>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              // No suggestions or creation allowed
              <div className="p-3 text-sm text-muted-foreground">
                {query.length < minQueryLength && !showInitialSuggestions
                  ? `Type at least ${minQueryLength} character${minQueryLength === 1 ? "" : "s"} to search`
                  : "No results found"}
              </div>
            )}
          </Card>
        )}

        {/* Display count for multi-select mode */}
        {mode === "multiple" && maxSelections && Array.isArray(selectedValue) && (
          <div className="mt-1 text-xs text-muted-foreground">
            {selectedValue.length} / {maxSelections} selected
          </div>
        )}
      </div>
    )
  },
)

AutocompleteInput.displayName = "AutocompleteInput"