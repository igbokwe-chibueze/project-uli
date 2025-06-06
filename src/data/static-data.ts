// src/data/static-data.ts

// Get static data server side (Countries, Industry types, etc )

import { prisma } from "@/lib/prisma/prisma";

// Define a TypeScript interface to describe each country option.
// "value" will hold the country ID (string), and "label" will be "Name (ISO2)".
export interface CountryOption {
  value: string; // The Prisma-generated ID for the country
  label: string; // A human-readable string, e.g. "Nigeria (NG)"
}

/**
 * Fetch all countries (id, name, iso2) from the database,
 * sort them alphabetically by name, then return an array of
 * CountryOption objects.
 */
export const getAvailableCountries = async (): Promise<CountryOption[]> => {
    try {
        // Query Prisma for id, name, and iso2 for each country
        const countries = await prisma.country.findMany({
            select: { id: true, name: true, iso2: true },
            orderBy: { name: "asc" },
        });

        // Map each country row into a CountryOption
        const countryOptions: CountryOption[] = countries.map((c) => ({
            value: c.id,
            // If c.iso2 is null/undefined, just show c.name without parentheses
            label: c.iso2 ? `${c.name} (${c.iso2})` : c.name,
        }));

        return countryOptions;
    } catch (error) {
        console.error("Error fetching countries", { error });
        throw error; // Let the caller handle the error
    }
};
