// prisma/seed.ts

import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  // ────────────────────────────────────────────────────────────────────────────────
  // 1) Seed Countries
  // ────────────────────────────────────────────────────────────────────────────────
  const countriesPath = path.join(__dirname, "seed-data", "countries.json");
  const countriesRaw = await fs.readFile(countriesPath, "utf-8");
  const countries = JSON.parse(countriesRaw) as Array<{
    id: number; // originally number in JSON
    name: string;
    iso2?: string;
    iso3?: string;
    numeric_code?: string;
    phone_code?: string;
    capital?: string;
    currency?: string;
    currency_name?: string;
    currency_symbol?: string;
    tld?: string;
    native?: string;
    region?: string;
    region_id?: string;
    subregion?: string;
    subregion_id?: string;
    nationality?: string;
    latitude?: string;
    longitude?: string;
    emoji?: string;
    emojiU?: string;
    timezones?: unknown;
    translations?: unknown;
  }>;

  await prisma.country.createMany({
    data: countries.map((c) => ({
      id: String(c.id), // convert numeric ID to string
      name: c.name,
      iso2: c.iso2,
      iso3: c.iso3,
      numericCode: c.numeric_code,
      phoneCode: c.phone_code,
      capital: c.capital,
      currency: c.currency,
      currencyName: c.currency_name,
      currencySymbol: c.currency_symbol,
      tld: c.tld,
      nativeName: c.native,
      region: c.region,
      regionId: c.region_id,
      subregion: c.subregion,
      subregionId: c.subregion_id,
      nationality: c.nationality,
      latitude: c.latitude ? new Prisma.Decimal(c.latitude) : undefined,
      longitude: c.longitude ? new Prisma.Decimal(c.longitude) : undefined,
      emoji: c.emoji,
      emojiU: c.emojiU,
      timezones: c.timezones as Prisma.InputJsonValue,
      translations: c.translations as Prisma.InputJsonValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${countries.length} countries.`);

    // ────────────────────────────────────────────────────────────────────────────────
  // 2) Seed States
  // ────────────────────────────────────────────────────────────────────────────────
  const statesPath = path.join(__dirname, "seed-data", "states.json");
  const statesRaw = await fs.readFile(statesPath, "utf-8");
  const states = JSON.parse(statesRaw) as Array<{
    id: number;
    name: string;
    country_id: number;
    state_code?: string;
    type?: string | null;
    latitude?: string;
    longitude?: string;
  }>;

  const validCountryIds = await prisma.country.findMany({
    select: { id: true },
  });

  const existingCountryIds = new Set(validCountryIds.map((c) => c.id));

  const validStates = states
    .filter((s) => existingCountryIds.has(String(s.country_id))) // ensure FK match
    .map((s) => ({
      id: String(s.id),
      name: s.name,
      countryId: String(s.country_id),
      stateCode: s.state_code ?? undefined,
      type: s.type ?? undefined,
      latitude: s.latitude ? new Prisma.Decimal(s.latitude) : undefined,
      longitude: s.longitude ? new Prisma.Decimal(s.longitude) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

  await prisma.state.createMany({
    data: validStates,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${validStates.length} valid states.`);

  // ──────────────────────────────────────────────────────────────────────────────
  // 3) Seed Organization Types
  // ──────────────────────────────────────────────────────────────────────────────
  const orgTypeData = [
    { name: "Nonprofit" },
    { name: "Corporate" },
    { name: "Government" },
    { name: "Startup" },
    { name: "Small Business" },
    // …add more here
  ];
  await prisma.organizationType.createMany({
    data: orgTypeData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${orgTypeData.length} organization types.`);
  
  // ──────────────────────────────────────────────────────────────────────────────
  // 4) Seed Industries
  // ──────────────────────────────────────────────────────────────────────────────
  const industryData = [
    { name: "Pharmaceutical" },
    { name: "Finance" },
    { name: "Technology" },
    { name: "Healthcare" },
    { name: "Manufacturing" },
    { name: "Retail" },
    // …add more here
  ];
  await prisma.industry.createMany({
    data: industryData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${industryData.length} industries.`);
  
  // ──────────────────────────────────────────────────────────────────────────────
  // 5) Seed Employee Count Ranges
  // ──────────────────────────────────────────────────────────────────────────────
  const employeeCounts = [
    { label: "1-10", minCount: 1, maxCount: 10 },
    { label: "11-50", minCount: 11, maxCount: 50 },
    { label: "51-200", minCount: 51, maxCount: 200 },
    { label: "201-500", minCount: 201, maxCount: 500 },
    { label: "501-1000", minCount: 501, maxCount: 1000 },
    { label: "1000+", minCount: 1001, maxCount: null },
  ];
  await prisma.employeeCountRange.createMany({
    data: employeeCounts,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${employeeCounts.length} employee count ranges.`);
  
  // ──────────────────────────────────────────────────────────────────────────────
  // 6) Seed Revenue Ranges
  // ──────────────────────────────────────────────────────────────────────────────
  const revenueRanges = [
    { label: "$0K-$100K", minRevenue: 0, maxRevenue: 100000 },
    { label: "$100K-$1M", minRevenue: 100000, maxRevenue: 1000000 },
    { label: "$1M-$10M", minRevenue: 1000000, maxRevenue: 10000000 },
    { label: "$10M-$50M", minRevenue: 10000000, maxRevenue: 50000000 },
    { label: "$50M-$100M", minRevenue: 50000000, maxRevenue: 100000000 },
    { label: "$100M+", minRevenue: 100000000, maxRevenue: null },
  ];
  await prisma.revenueRange.createMany({
    data: revenueRanges,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${revenueRanges.length} revenue ranges.`);
  
  // ──────────────────────────────────────────────────────────────────────────────
  // 7) Seed Languages
  // ──────────────────────────────────────────────────────────────────────────────
  const languageData = [
    { name: "English", code: "en" },
    { name: "French",  code: "fr" },
    { name: "Spanish", code: "es" },
    { name: "Arabic",  code: "ar" },
    { name: "Chinese", code: "zh" },
    // …add more here
  ];
  await prisma.language.createMany({
    data: languageData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${languageData.length} languages.`);
  
  // ──────────────────────────────────────────────────────────────────────────────
  // 8) Seed Specialties
  // ──────────────────────────────────────────────────────────────────────────────
  const specialtyData = [
    { name: "Quality Assurance" },
    { name: "Regulatory Affairs" },
    { name: "Research & Development" },
    { name: "Supply Chain Management" },
    { name: "Customer Service" },
    // …add more here
  ];
  await prisma.specialty.createMany({
    data: specialtyData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${specialtyData.length} specialties.`);
  
  // ──────────────────────────────────────────────────────────────────────────────
  // 9) Seed Certifications
  // ──────────────────────────────────────────────────────────────────────────────
  const certificationData = [
    { name: "ISO 9001",   issuer: "International Organization for Standardization" },
    { name: "ISO 45001",  issuer: "International Organization for Standardization" },
    { name: "GMP",        issuer: "Food and Drug Administration" },
    { name: "CE Marking", issuer: "European Union" },
    { name: "LEED",       issuer: "U.S. Green Building Council" },
    // …add more here
  ];
  await prisma.certification.createMany({
    data: certificationData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${certificationData.length} certifications.`);
  
  // ──────────────────────────────────────────────────────────────────────────────
  // 10) Seed Social Platforms
  // ──────────────────────────────────────────────────────────────────────────────
  const socialPlatformData = [
    { name: "Twitter",   domain: "twitter.com" },
    { name: "LinkedIn",  domain: "linkedin.com" },
    { name: "Facebook",  domain: "facebook.com" },
    { name: "Instagram", domain: "instagram.com" },
    { name: "YouTube",   domain: "youtube.com" },
    { name: "TikTok",    domain: "tiktok.com" },
    // …add more here
  ];
  await prisma.socialPlatform.createMany({
    data: socialPlatformData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${socialPlatformData.length} social platforms.`);
  
  // ──────────────────────────────────────────────────────────────────────────────
  // 11) Seed colorScheme
  // ──────────────────────────────────────────────────────────────────────────────
  const colorSchemeData = [
    { name: "theme-velvet" },
    { name: "theme-sky" },
    { name: "theme-flame" },
    { name: "theme-moss" },
    { name: "theme-stone" },
    // …add more here
  ];
  await prisma.colorScheme.createMany({
    data: colorSchemeData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${colorSchemeData.length} color scheme.`);
}

// Run main and handle errors
main()
  .catch((e) => {
    console.error("🚨 Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
