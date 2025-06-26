// src/features/organisations/context/organisation-client-provider.tsx

// This is the client boundary that actually provides the organisation
// object to all client-side components via React Context.
"use client";

import { ReactNode } from "react";
import type { OrganisationSummaryType } from "@/features/organisations/data/organizations";
import { OrganisationContext } from "@/features/organisations/context/organisation-context";

interface Props {
    /** The organisation data to be supplied down the tree */
    organisation: OrganisationSummaryType;
    /** Child components that will consume the organisation context */
    children: ReactNode;
}

/**
 * OrganisationClientProvider
 * Wrap this around any client-side subtree to make `useOrganisation()` work.
 * Must be rendered inside a React component marked `"use client"`.
 */
export function OrganisationClientProvider({ organisation, children }: Props) {
    return (
        <OrganisationContext.Provider value={organisation}>
        {children}
        </OrganisationContext.Provider>
    );
}
