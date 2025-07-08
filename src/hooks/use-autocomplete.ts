// src/hooks/use-autocomplete.ts

"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"

/**
 * @interface AutocompleteOption
 * @description Defines the structure for an autocomplete suggestion option.
 * @property {string} id - A unique identifier for the option.
 * @property {string} label - The text displayed to the user for this option.
 * @property {string} value - The actual value associated with the option, often the same as label or a specific ID.
 */
export interface AutocompleteOption {
  id: string
  label: string
  value: string
}

/**
 * @interface UseAutocompleteProps
 * @description Defines the props accepted by the `useAutocomplete` hook.
 * @property {(query: string) => Promise<AutocompleteOption[]>} fetchSuggestions - Function to fetch suggestions based on user query.
 * @property {() => Promise<AutocompleteOption[]>} [fetchInitialSuggestions] - Optional function to fetch initial suggestions when the input is focused or component mounts.
 * @property {(query: string) => Promise<AutocompleteOption>} [createNew] - Optional function to handle the creation of a new option if `allowCreateNew` is true.
 * @property {number} [debounceMs=300] - The debounce time in milliseconds for fetching suggestions after query changes.
 * @property {number} [minQueryLength=1] - The minimum length of the query before suggestions are fetched.
 * @property {"single" | "multiple"} [mode="single"] - The selection mode: "single" for one option, "multiple" for many.
 * @property {AutocompleteOption | AutocompleteOption[]} [initialValue] - Initial selected value(s) for the autocomplete.
 * @property {(value: AutocompleteOption | AutocompleteOption[] | null) => void} [onChange] - Callback function triggered when the selected value(s) change.
 * @property {boolean} [showInitialSuggestions=false] - If true, initial suggestions are shown when the input is empty and focused.
 * @property {number} [initialSuggestionsCount=5] - The maximum number of initial suggestions to display.
 * @property {boolean} [allowCreateNew=true] - If true, allows the creation of new options if `createNew` function is provided.
 */
interface UseAutocompleteProps {
  fetchSuggestions: (query: string) => Promise<AutocompleteOption[]>
  fetchInitialSuggestions?: () => Promise<AutocompleteOption[]>
  createNew?: (query: string) => Promise<AutocompleteOption>
  debounceMs?: number
  minQueryLength?: number
  mode?: "single" | "multiple"
  initialValue?: AutocompleteOption | AutocompleteOption[]
  onChange?: (value: AutocompleteOption | AutocompleteOption[] | null) => void
  showInitialSuggestions?: boolean
  initialSuggestionsCount?: number
  allowCreateNew?: boolean
}

/**
 * @function useAutocomplete
 * @description A custom React hook for building autocomplete input fields with features like debouncing,
 * initial suggestions, single/multiple selection, and dynamic option creation.
 * @param {UseAutocompleteProps} props - The configuration properties for the autocomplete hook.
 * @returns {object} An object containing state, functions, and flags to control the autocomplete component.
 */
export function useAutocomplete({
  fetchSuggestions,
  fetchInitialSuggestions,
  createNew,
  debounceMs = 300,
  minQueryLength = 1,
  mode = "single",
  initialValue,
  onChange,
  showInitialSuggestions = false,
  initialSuggestionsCount = 5,
  allowCreateNew = true,
}: UseAutocompleteProps) {
  // State variables
  const [query, setQuery] = useState("") // The current text input by the user.
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([]) // Suggestions fetched based on the current query.
  const [initialSuggestions, setInitialSuggestions] = useState<AutocompleteOption[]>([]) // Suggestions displayed when the query is empty.
  const [selectedValue, setSelectedValue] = useState<AutocompleteOption | AutocompleteOption[] | null>(() => {
    // The currently selected option(s). Initializes based on `initialValue` or an empty array for multiple mode.
    return initialValue || (mode === "multiple" ? [] : null)
  })
  const [isLoading, setIsLoading] = useState(false) // True when fetching query-based suggestions.
  const [isLoadingInitial, setIsLoadingInitial] = useState(false) // True when fetching initial suggestions.
  const [isOpen, setIsOpen] = useState(false) // Controls the visibility of the suggestion dropdown.
  const [selectedIndex, setSelectedIndex] = useState(-1) // Index of the currently highlighted suggestion (for keyboard navigation).
  const [error, setError] = useState<string | null>(null) // Stores any error messages during data fetching.
  const [isCreating, setIsCreating] = useState(false) // True when a new option is being created.
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false) // Flag to ensure initial suggestions are loaded only once.

  // Refs for managing timeouts and AbortControllers to prevent memory leaks and handle race conditions.
  const debounceRef = useRef<NodeJS.Timeout | null>(null) // Ref to store the debounce timeout ID.
  const abortControllerRef = useRef<AbortController | null>(null) // Ref to store the AbortController for query-based fetches.
  const initialAbortControllerRef = useRef<AbortController | null>(null) // Ref to store the AbortController for initial fetches.
  const onChangeRef = useRef(onChange) // Ref to store the onChange callback, preventing re-renders due to callback changes.

  // Effect to keep the onChangeRef up-to-date with the latest onChange prop.
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Effect to initialize the selected value only once when the component mounts.
  const initializedRef = useRef(false) // Local ref to track if initial value has been processed.
  useEffect(() => {
    if (initialValue && !initializedRef.current) {
      setSelectedValue(initialValue)
      initializedRef.current = true
    }
  }, [initialValue])

  // Effect to notify the parent component whenever `selectedValue` changes.
  // Uses onChangeRef to avoid unnecessary re-renders of this effect if onChange prop changes.
  useEffect(() => {
    if (onChangeRef.current) {
      onChangeRef.current(selectedValue)
    }
  }, [selectedValue])

  /**
   * @function loadInitialSuggestions
   * @description Memoized callback to fetch and set initial suggestions.
   * It handles loading state, errors, and filters out already selected options.
   */
  const loadInitialSuggestions = useCallback(async () => {
    // Prevent fetching if no fetcher is provided or if suggestions have already been loaded.
    if (!fetchInitialSuggestions || hasLoadedInitial) return

    // Abort any ongoing initial suggestion fetch to prevent race conditions.
    if (initialAbortControllerRef.current) {
      initialAbortControllerRef.current.abort()
    }

    // Create a new AbortController for the current request.
    initialAbortControllerRef.current = new AbortController()

    setIsLoadingInitial(true) // Set loading state for initial suggestions.
    setError(null) // Clear any previous errors.

    try {
      const results = await fetchInitialSuggestions() // Fetch initial suggestions.
      const limitedResults = results.slice(0, initialSuggestionsCount) // Limit results to the specified count.

      // Filter out options that are already selected, especially in multiple selection mode.
      const filteredResults =
        mode === "multiple" && Array.isArray(selectedValue)
          ? limitedResults.filter((result) => !selectedValue.some((selected) => selected.id === result.id))
          : limitedResults

      setInitialSuggestions(filteredResults) // Update the initial suggestions state.
      setHasLoadedInitial(true) // Mark initial suggestions as loaded.
    } catch (err) {
      // Handle errors, ignoring AbortError which occurs when a request is cancelled.
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Failed to load initial suggestions")
      }
    } finally {
      setIsLoadingInitial(false) // Reset loading state.
    }
  }, [fetchInitialSuggestions, initialSuggestionsCount, mode, selectedValue, hasLoadedInitial])

  // Effect to trigger the loading of initial suggestions when relevant conditions are met.
  // This effect runs on mount and when `showInitialSuggestions`, `fetchInitialSuggestions`,
  // `hasLoadedInitial`, or `loadInitialSuggestions` (due to its own dependencies) change.
  useEffect(() => {
    if (showInitialSuggestions && fetchInitialSuggestions && !hasLoadedInitial) {
      loadInitialSuggestions()
    }
  }, [showInitialSuggestions, loadInitialSuggestions, fetchInitialSuggestions, hasLoadedInitial])

  /**
   * @function debouncedFetch
   * @description Memoized callback to fetch suggestions based on the current query.
   * It handles debouncing, loading state, errors, and filtering.
   */
  const debouncedFetch = useCallback(
    async (searchQuery: string) => {
      // Do not fetch if the query length is less than the minimum required.
      if (searchQuery.length < minQueryLength) {
        setSuggestions([]) // Clear suggestions if query is too short.
        return
      }

      // Abort any ongoing query-based fetch.
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create a new AbortController for the current request.
      abortControllerRef.current = new AbortController()

      setIsLoading(true) // Set loading state for query suggestions.
      setError(null) // Clear any previous errors.

      try {
        const results = await fetchSuggestions(searchQuery) // Fetch suggestions.

        // Filter out options that are already selected, especially in multiple selection mode.
        const filteredResults =
          mode === "multiple" && Array.isArray(selectedValue)
            ? results.filter((result) => !selectedValue.some((selected) => selected.id === result.id))
            : results

        setSuggestions(filteredResults) // Update the query suggestions state.
        setSelectedIndex(-1) // Reset selected index when new suggestions arrive.
      } catch (err) {
        // Handle errors, ignoring AbortError.
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Failed to fetch suggestions")
          setSuggestions([]) // Clear suggestions on error.
        }
      } finally {
        setIsLoading(false) // Reset loading state.
      }
    },
    [fetchSuggestions, minQueryLength, mode, selectedValue], // Dependencies for debouncedFetch.
  )

  // Effect to filter suggestions (both regular and initial) when `selectedValue` changes.
  // This ensures that selected items are removed from the suggestion lists in multi-select mode.
  useEffect(() => {
    if (mode === "multiple" && Array.isArray(selectedValue)) {
      // Filter regular suggestions
      if (suggestions.length > 0) {
        const filteredSuggestions = suggestions.filter(
          (result) => !selectedValue.some((selected) => selected.id === result.id),
        )
        // Only update state if the filtered list is different to prevent unnecessary re-renders.
        if (filteredSuggestions.length !== suggestions.length) {
          setSuggestions(filteredSuggestions)
        }
      }

      // Filter initial suggestions
      if (initialSuggestions.length > 0) {
        const filteredInitialSuggestions = initialSuggestions.filter(
          (result) => !selectedValue.some((selected) => selected.id === result.id),
        )
        // Only update state if the filtered list is different.
        if (filteredInitialSuggestions.length !== initialSuggestions.length) {
          setInitialSuggestions(filteredInitialSuggestions)
        }
      }
    }
  }, [selectedValue, mode, suggestions, initialSuggestions]) // Dependencies for this filtering effect.

  // Effect to debounce the `debouncedFetch` call based on `query` changes.
  // Clears any previous timeout and sets a new one.
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current) // Clear previous timeout.
    }

    debounceRef.current = setTimeout(() => {
      debouncedFetch(query) // Call the debounced fetch function.
    }, debounceMs)

    // Cleanup function: clear the timeout when the component unmounts or dependencies change.
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, debouncedFetch, debounceMs]) // Dependencies for the debouncing effect.

  /**
   * @function getCurrentSuggestions
   * @description Memoized callback to determine which list of suggestions to display (query-based or initial).
   * @returns {AutocompleteOption[]} The list of suggestions to display.
   */
  const getCurrentSuggestions = useCallback(() => {
    if (query.length >= minQueryLength) {
      return suggestions // Show query-based suggestions if query meets min length.
    } else if (showInitialSuggestions && query.length === 0) {
      return initialSuggestions // Show initial suggestions if enabled and query is empty.
    }
    return [] // Otherwise, show no suggestions.
  }, [query, minQueryLength, suggestions, showInitialSuggestions, initialSuggestions])

  /**
   * @function handleKeyDown
   * @description Memoized callback to handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
   * within the suggestion list.
   * @param {React.KeyboardEvent} event - The keyboard event object.
   * @returns {{ type: "select" | "create", option?: AutocompleteOption, query?: string } | void}
   * Returns an object indicating the action (select or create) if Enter is pressed, otherwise void.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return // Do nothing if the suggestion list is not open.

      const currentSuggestions = getCurrentSuggestions()
      // Calculate total options including the "create new" option if applicable.
      const totalOptions = currentSuggestions.length + (allowCreateNew && createNew && query.trim() ? 1 : 0)

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault() // Prevent default scroll behavior.
          // Move highlight down, looping back to 0 if at the end.
          setSelectedIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          event.preventDefault() // Prevent default scroll behavior.
          // Move highlight up, looping back to -1 (no selection) if at the beginning.
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case "Enter":
          event.preventDefault() // Prevent form submission.
          if (selectedIndex >= 0) {
            if (selectedIndex < currentSuggestions.length) {
              // If a suggestion is highlighted, return it for selection.
              return { type: "select", option: currentSuggestions[selectedIndex] }
            } else if (allowCreateNew && createNew && query.trim()) {
              // If "create new" is highlighted, return the query for creation.
              return { type: "create", query: query.trim() }
            }
          }
          break
        case "Escape":
          setIsOpen(false) // Close the suggestion list.
          setSelectedIndex(-1) // Reset highlighted index.
          break
      }
    },
    [isOpen, selectedIndex, getCurrentSuggestions, allowCreateNew, createNew, query], // Dependencies for handleKeyDown.
  )

  /**
   * @function selectOption
   * @description Memoized callback to handle the selection of an autocomplete option.
   * Updates `selectedValue` and resets query/dropdown state.
   * @param {AutocompleteOption} option - The option to be selected.
   * @returns {AutocompleteOption} The selected option.
   */
  const selectOption = useCallback(
    (option: AutocompleteOption) => {
      if (mode === "single") {
        setSelectedValue(option) // Set single selected value.
        setQuery(option.label) // Update input query to selected option's label.
      } else {
        // For multiple mode, add the new option to the array of selected values.
        setSelectedValue((current) => {
          const currentSelected = Array.isArray(current) ? current : []
          // Ensure no duplicates are added if the option is already selected (though filtering should prevent this).
          if (currentSelected.some(item => item.id === option.id)) {
            return currentSelected;
          }
          return [...currentSelected, option]
        })
        setQuery("") // Clear query after selection in multiple mode.
      }
      setIsOpen(false) // Close the suggestion list.
      setSelectedIndex(-1) // Reset highlighted index.
      return option
    },
    [mode], // Dependency: `mode` determines single/multiple behavior.
  )

  /**
   * @function handleCreateNew
   * @description Memoized callback to handle the creation of a new option.
   * Calls the `createNew` prop, updates `selectedValue`, and resets state.
   * @param {string} queryText - The text to be used for creating the new option.
   * @returns {Promise<AutocompleteOption | undefined>} A promise that resolves to the newly created option, or undefined if creation fails/is not allowed.
   */
  const handleCreateNew = useCallback(
    async (queryText: string) => {
      // Prevent creation if not allowed, no createNew function, or query is empty.
      if (!allowCreateNew || !createNew || !queryText.trim()) return

      setIsCreating(true) // Set creating state.
      setError(null) // Clear any previous errors.

      try {
        const newOption = await createNew(queryText.trim()) // Call the provided createNew function.

        if (mode === "single") {
          setSelectedValue(newOption) // Set the newly created option as selected.
          setQuery(newOption.label) // Update input query.
        } else {
          // For multiple mode, add the new option to the array.
          setSelectedValue((current) => {
            const currentSelected = Array.isArray(current) ? current : []
            return [...currentSelected, newOption]
          })
          setQuery("") // Clear query.
        }

        setIsOpen(false) // Close suggestion list.
        setSelectedIndex(-1) // Reset highlighted index.
        return newOption
      } catch (err) {
        setError("Failed to create new option") // Set error on failure.
        throw err // Re-throw the error for external handling.
      } finally {
        setIsCreating(false) // Reset creating state.
      }
    },
    [allowCreateNew, createNew, mode], // Dependencies for handleCreateNew.
  )

  /**
   * @function removeOption
   * @description Memoized callback to remove a selected option.
   * Applicable for both single and multiple modes.
   * @param {AutocompleteOption} optionToRemove - The option to be removed from selected values.
   */
  const removeOption = useCallback(
    (optionToRemove: AutocompleteOption) => {
      if (mode === "single") {
        setSelectedValue(null) // Clear selected value in single mode.
        setQuery("") // Clear query.
      } else {
        // In multiple mode, filter out the option to be removed.
        setSelectedValue((current) => {
          if (Array.isArray(current)) {
            return current.filter((option) => option.id !== optionToRemove.id)
          }
          return current // Return current if not an array (shouldn't happen in multiple mode).
        })
      }
    },
    [mode], // Dependency: `mode`.
  )

  /**
   * @function clearAll
   * @description Memoized callback to clear all selected options and reset the query.
   */
  const clearAll = useCallback(() => {
    setSelectedValue(mode === "multiple" ? [] : null) // Clear selected value(s) based on mode.
    setQuery("") // Clear query.
    setIsOpen(false) // Close suggestion list.
  }, [mode]) // Dependency: `mode`.

  /**
   * @function reset
   * @description Memoized callback to reset the entire hook's state to its initial values.
   */
  const reset = useCallback(() => {
    setQuery("")
    setSuggestions([])
    setIsOpen(false)
    setSelectedIndex(-1)
    setError(null)
    setSelectedValue(mode === "multiple" ? [] : null) // Reset selected value(s).
  }, [mode]) // Dependency: `mode`.

  /**
   * @function handleFocus
   * @description Memoized callback to handle input focus.
   * Triggers initial suggestions load if enabled and not already loaded.
   */
  const handleFocus = useCallback(() => {
    if (showInitialSuggestions && !hasLoadedInitial) {
      loadInitialSuggestions() // Load initial suggestions on focus if not already loaded.
    }
    setIsOpen(true) // Open the suggestion list on focus.
  }, [showInitialSuggestions, hasLoadedInitial, loadInitialSuggestions]) // Dependencies for handleFocus.

  // Return the public API of the hook.
  return {
    query, // Current input query.
    setQuery, // Function to update the query.
    suggestions: getCurrentSuggestions(), // Current list of suggestions to display.
    selectedValue, // Currently selected option(s).
    isLoading: isLoading || isLoadingInitial, // Combined loading state.
    isCreating, // True if a new option is being created.
    isOpen, // True if the suggestion list is open.
    setIsOpen, // Function to control the visibility of the suggestion list.
    selectedIndex, // Index of the highlighted suggestion.
    error, // Any error message.
    handleKeyDown, // Keyboard event handler for navigation.
    selectOption, // Function to select an option.
    handleCreateNew, // Function to create a new option.
    removeOption, // Function to remove a selected option.
    clearAll, // Function to clear all selections.
    reset, // Function to reset the hook's state.
    handleFocus, // Focus event handler for the input.
    showInitialSuggestions, // Prop passed through for external component to use.
    allowCreateNew, // Prop passed through for external component to use.
  }
}
