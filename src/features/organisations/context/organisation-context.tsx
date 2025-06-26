// src/features/organisations/context/OrganisationContext.ts

// The context holds the current organisation summary so that
// any component within the client boundary can access it.
// We mark this module as a client component because we'll
// use React hooks (useContext) here.

import { createContext, useContext } from "react";
import type { OrganisationSummaryType } from "@/features/organisations/data/organizations";

// Create a Context for OrganisationSummaryType, defaulting to null
export const OrganisationContext = createContext<OrganisationSummaryType | null>(null);

/**
 * Custom hook to consume the OrganisationContext.
 * @throws if used outside of a provider
 * @returns the current OrganisationSummaryType
 */
export function useOrganisation() {
    // Read the context value
    const ctx = useContext(OrganisationContext);
    // If context is null, the hook is being used outside of its provider
    if (!ctx) {
        throw new Error("useOrganisation must be used within an OrganisationClientProvider");
    }
    // Return the valid context
    return ctx;
}
