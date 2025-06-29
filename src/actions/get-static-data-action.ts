// src/actions/get-static-data-action.ts

"use server";

import { revalidateTag } from 'next/cache';

import { getAvailableCountries, getAvailableStates } from '@/data/static-data';

/**
 * @goal This script serves as a **backend data provider** for static, global data.
 * It's specifically designed to fetch lists of countries and states from the database and return them to be used client side.
 *
 * @purpose To centralize and expose server-side data fetching logic to client components (CreateOrganisationModal)
 * via a Next.js Server Action. This avoids exposing database logic directly to the client
 * and allows for secure, efficient data retrieval from the server.
 *
 * @returns {Promise<{countries: CountryOptionProps[], states: StateOptionProps[]}>} An object
 * containing arrays of available countries and states.
 */
export const GetStaticDataAction = async () => {
    // Define a tag for this data. This allows for manual revalidation later if needed.
    const CACHE_TAG = 'static-location-data';

    // --- Data Fetching Logic ---
    // Fetch the countries and states using Prisma, which runs on the server.
    // This ensures database queries are performed securely on the backend.
    const countries = await getAvailableCountries();
    const states = await getAvailableStates();

    // After fetching, associate this data with a specific tag.
    // This action ensures that if an administrative operation later calls
    // `revalidateTag('static-location-data')`, any cached results of this
    // Server Action will be cleared, forcing a fresh fetch on the next request.
    revalidateTag(CACHE_TAG);


    // Return the fetched data. This data will be serialized and sent to the client
    // component that calls this Server Action.
    return ({countries, states});
}

// Reminder: To manually revalidate this data (e.g., after an admin updates countries/states):
// In the server action/route that performs the update, call:
// import { revalidateTag } from 'next/cache';
// revalidateTag('static-location-data');