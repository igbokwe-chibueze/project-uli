// src/features/organisations/actions/get-organisation-theme-action.ts
"use server";

import { currentID } from '@/features/auth/lib/authenticate'
import { getOrganisationSummaryById } from '../data/organizations'

/**
 * Fetches the current org's theme via `getOrganisationSummaryById()` (server‐side),
 * then pass it on to a hook that would used it in client component,
 * For server components getOrganisationSummaryById is to be used directly instead.
 */
export const GetOrganisationThemeAction = async (organisationId: string) => {
    // (Optional) Validate the user can see this org, or throw if not authenticated:
    const userId = await currentID()
    if (!userId) throw new Error('Not authenticated')

    const org = await getOrganisationSummaryById(organisationId)

  return org?.colorScheme?.name ?? 'theme-velvet'
}
