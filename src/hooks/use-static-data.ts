// src/hooks/use-static-data.ts

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CountryOptionProps, StateOptionProps } from "@/data/static-data"; // Importing TypeScript types for data structure.
import { GetStaticDataAction } from "@/actions/get-static-data-action"; // Importing the server action to fetch data.

interface UseStaticDataOptions {
  enabled: boolean; // New prop to control when fetching starts
}

/**
 * @goal This custom React hook is designed to **manage the client-side state and lifecycle
 * of fetching static data** (countries and states).
 *  If i was fecthing in a server component static-data.ts could be used directly.
 *
 * @purpose To provide a reusable, encapsulated, and performant way for any client component (CreateOrganisationModal)
 * to access countries and states data, along with their loading and error states.
 * It abstracts away the data fetching logic, making components cleaner.
 * It implements **lazy-fetching (only fetches when `enabled` is true)**
 * and **client-side caching (stores data after the first successful fetch)**. This ensures the data
 * is loaded only once per session, and subsequent accesses (e.g., re-opening a modal) are instant,
 * significantly improving user experience and reducing unnecessary network requests
 *
 * @returns {{
 * countries: CountryOptionProps[],
 * states: StateOptionProps[],
 * loading: boolean,
 * error: Error | null,
 * refetch: () => Promise<void>
 * }} An object containing the fetched countries, states, current loading status,
 * any encountered error, and a function to manually re-fetch the data.
 */
export const useStaticData = ({ enabled }: UseStaticDataOptions) => {
    // State variables to hold the fetched data. They are initialized as empty arrays.
    const [countries, setCountries] = useState<CountryOptionProps[]>([]);
    const [states, setStates] = useState<StateOptionProps[]>([]);

    // State variables to manage the fetching process feedback.
    // `loading` is true initially as data fetching starts immediately on mount.
    const [loading, setLoading] = useState<boolean>(true);
    // `error` will hold any error object if the fetch fails.
    const [error, setError] = useState<Error | null>(null);

    // useRef to track if data has already been fetched successfully
    const hasFetched = useRef(false);

    /**
     * `fetchStaticData` is a memoized callback function responsible for executing the
     * server action `GetStaticDataAction` and updating the component's state.
     * `useCallback` ensures this function reference remains stable across renders,
     * preventing unnecessary re-runs of `useEffect` where it's a dependency.
     */
    const fetchStaticData = useCallback(async () => {
        // Only set loading to true if we haven't fetched successfully before
        if (!hasFetched.current) {
            setLoading(true);
        }
        setError(null);   // Clear any previous errors.

        try {
            // Call the server action to fetch data from the backend.
            const data = await GetStaticDataAction();
            setCountries(data.countries); // Update countries state with fetched data.
            setStates(data.states);     // Update states state with fetched data.
            hasFetched.current = true; // Mark as fetched successfully
        } catch (error) {
            // Catch and set any errors that occur during fetching.
            setError(error as Error);
            console.error("Failed to fetch static data:", error); // Log the error for debugging.
        } finally {
            setLoading(false); // Set loading to false once fetching is complete (success or error).
        }
    }, []); // Empty dependency array means `fetchStaticData` is created once and never changes.

    /**
     * `useEffect` hook to trigger the `fetchStaticData` function.
     * The effect now depends on `enabled`. It will only run `fetchStaticData`
     * if `enabled` is true AND data has NOT been fetched successfully yet.
     * The `ref` is used to prevent re-fetching if `enabled` goes true -> false -> true
     * and the data is already there.
     */
    useEffect(() => {
        if (enabled && !hasFetched.current) {
            fetchStaticData();
        }
        // No need for 'fetchStaticData' in dependencies, because it is wrapped in 'useCallback'
        // and its dependencies are empty, making it stable.
    }, [enabled, fetchStaticData]); // Effect runs when `enabled` changes.

    // Return the current state of data, loading, error, and a refetch function.
    return {
        countries,
        states,
        loading,
        error,
        refetch: fetchStaticData, // Expose `fetchStaticData` as `refetch` for manual re-triggering if needed.
    };
};