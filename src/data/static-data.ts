// src/data/static-data.ts

// Get static data server side (Countries, Industry types, etc )

import { prisma } from "@/lib/prisma/prisma";

export interface CountryOptionProps {
  id: string;
  name: string;
  iso2?: string;
  emoji?: string;
}

/**
 * Fetch all countries (id, name, emoji) from the database,
 * sort them alphabetically by name, then return an array of
 * CountryOptionProps objects.
 */
export const getAvailableCountries = async (): Promise<CountryOptionProps[]> => {
    try {
        const countries = await prisma.country.findMany({
            select: { id: true, name: true, iso2: true, emoji: true },
            orderBy: { name: "asc" },
        });

        return countries.map((c) => ({
            id: c.id,
            name: c.name,
            // if the database field is null, emoji will be `null`
            // TS will allow that to become `undefined` in our interface
            emoji: c.emoji ?? undefined,
            iso2: c.iso2 ?? undefined,
        }));
    } catch (err) {
        // <-- Log the raw error so you see the message, stack, etc.
        console.error("[getAvailableCountries] Prisma failed:", err);
        // Rethrow so your page can catch it
        throw err;
    }
};

export interface StateOptionProps {
  id: string;
  name: string;
  countryId: string;
}

/**
 * Fetch all countries (id, name, emoji) from the database,
 * sort them alphabetically by name, then return an array of
 * CountryOptionProps objects.
 */
export const getAvailableStates = async (): Promise<StateOptionProps[]> => {
    try {
        const states = await prisma.state.findMany({
            select: { id: true, name: true, countryId: true },
            orderBy: { name: "asc" },
        });

        return states.map((s) => ({
            id: s.id,
            name: s.name,
            countryId: s.countryId,
        }));
    } catch (err) {
        // <-- Log the raw error so you see the message, stack, etc.
        console.error("[getAvailableCountries] Prisma failed:", err);
        // Rethrow so your page can catch it
        throw err;
    }
};


// Define a TypeScript interface to describe each country option.
export interface OptionProps {
  value: string; // The Prisma-generated ID for an Industry type
  label: string; // A human-readable string, e.g. "Manufacturing"
}

//
// 2) Fetch Industries
//
export const getAvailableIndustries = async (): Promise<OptionProps[]> => {

    const industries = await prisma.industry.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    return industries.map((i) => ({
        value: i.id,
        label: i.name,
    }));
};

//
// 3) Fetch Organization Types
//
export const getAvailableOrgTypes = async (): Promise<OptionProps[]> => {
    const types = await prisma.organizationType.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    return types.map((t) => ({
        value: t.id,
        label: t.name,
    }));
};

//
// 4) Fetch Employee-Count Ranges
//
export const getAvailableEmployeeCountRanges = async (): Promise<OptionProps[]> => {
    const ranges = await prisma.employeeCountRange.findMany({
        select: { id: true, label: true },
        orderBy: { minCount: "asc" },
    });

    return ranges.map((r) => ({
        value: r.id,
        label: r.label,
    }));
};

//
// 5) Fetch Revenue Ranges
//
export const getAvailableRevenueRanges = async (): Promise<OptionProps[]> => {
    const ranges = await prisma.revenueRange.findMany({
        select: { id: true, label: true },
        orderBy: { minRevenue: "asc" },
    });

    return ranges.map((r) => ({
        value: r.id,
        label: r.label,
    }));
};

//
// 6) Fetch Languages
//
export const getAvailableLanguages = async (): Promise<OptionProps[]> => {
    const languages = await prisma.language.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
    });

    return languages.map((l) => ({
        value: l.id,
        // If l.code is null/undefined, just show l.name without parentheses
        label: l.code ? `${l.name} (${l.code})` : l.name,
    }));
};

//
// 7) Fetch Specialties
//
export const getAvailableSpecialties = async (): Promise<OptionProps[]> => {
    const specialties = await prisma.specialty.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    return specialties.map((s) => ({
        value: s.id,
        label: s.name,
    }));
};

//
// 8) Fetch SocialPlatforms
//
export const getAvailableSocialPlatforms = async (): Promise<OptionProps[]> => {
    const socialPlatforms = await prisma.socialPlatform.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    return socialPlatforms.map((s) => ({
        value: s.id,
        label: s.name,
    }));
};

//
// 8) Fetch Certifications
//
export const getAvailableCertifications = async (): Promise<OptionProps[]> => {
    const certifications = await prisma.certification.findMany({
        select: { id: true, name: true,  issuer: true },
        orderBy: { name: "asc" },
    });

    return certifications.map((c) => ({
        value: c.id,
        label: c.name ?  `${c.name}- ${c.issuer}` : c.name,
    }));
};

//
// 9) Fetch ColorSchemes
//
export const getAvailableColorSchemes = async (): Promise<OptionProps[]> => {
    const colorSchemes = await prisma.colorScheme.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    return colorSchemes.map((c) => ({
        value: c.id,
        label: c.name,
    }));
};



