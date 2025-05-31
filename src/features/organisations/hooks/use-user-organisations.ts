// src/features/organisations/hooks/use-user-organisations.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { GetUserOrganisationsAction } from "../actions/get-user-organisations-action";

interface Organization {
    id: string;
    name: string;
    logo: string | null;
    country: string | null;
    // If you need more fields, add them here:
    // description: string;
    // …
}

/**
 * Custom React hook for fetching the current user’s organizations.
 *
 * - `organizations`: array of { id, name }
 * - `loading`: true while the RPC is in flight
 * - `error`: an Error if something went wrong
 * - `refetch()`: call this again to re‐run the server action
 *
 * Because your layout mounts exactly once, this hook will only fetch once per session
 * unless you explicitly call `refetch()`.
 */
export function useUserOrganizations() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchOrganizations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // This calls the server action (RPC) under the hood
            const data = await GetUserOrganisationsAction();
            setOrganizations(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
            setOrganizations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch once on mount
    useEffect(() => {
        fetchOrganizations();
        // Because fetchOrganizations is stable (useCallback with []), this only runs once
    }, [fetchOrganizations]);

    return {
        organizations,
        loading,
        error,
        refetch: fetchOrganizations,
    };
}
