// prisma/seed.ts

import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

async function main() {
  //
  // ──────────────────────────────────────────────────────────────────────────────
  // 1) Seed Countries
  // ──────────────────────────────────────────────────────────────────────────────
  const countryData = [
    { name: "Nigeria", iso2: "NG" },
    { name: "France", iso2: "FR" },
    { name: "United States", iso2: "US" },
    { name: "United Kingdom", iso2: "GB" },
    { name: "Canada", iso2: "CA" },
    // add more as needed...
  ];

  await prisma.country.createMany({
    data: countryData,
    skipDuplicates: true, // do not error if a country already exists
  });
  console.log(`✅ Seeded ${countryData.length} countries.`);

  //
  // ──────────────────────────────────────────────────────────────────────────────
  // 2) Seed Organization Types
  // ──────────────────────────────────────────────────────────────────────────────
  const orgTypeData = [
    { name: "Nonprofit" },
    { name: "Corporate" },
    { name: "Government" },
    { name: "Startup" },
    { name: "Small Business" },
    // add more as needed...
  ];

  await prisma.organizationType.createMany({
    data: orgTypeData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${orgTypeData.length} organization types.`);

  //
  // ──────────────────────────────────────────────────────────────────────────────
  // 3) Seed Industries
  // ──────────────────────────────────────────────────────────────────────────────
  const industryData = [
    { name: "Pharmaceutical" },
    { name: "Finance" },
    { name: "Technology" },
    { name: "Healthcare" },
    { name: "Manufacturing" },
    { name: "Retail" },
    // add more as needed...
  ];

  await prisma.industry.createMany({
    data: industryData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${industryData.length} industries.`);

  //
  // ──────────────────────────────────────────────────────────────────────────────
  // 4) Seed EmployeeCountRanges
  // ──────────────────────────────────────────────────────────────────────────────
  const employeeCounts = [
    { label: "1-10",   minCount: 1,   maxCount: 10 },
    { label: "11-50",  minCount: 11,  maxCount: 50 },
    { label: "51-200", minCount: 51,  maxCount: 200 },
    { label: "201-500", minCount: 201, maxCount: 500 },
    { label: "501-1000", minCount: 501, maxCount: 1000 },
    { label: "1000+",  minCount: 1001, maxCount: null },
  ];

  await prisma.employeeCountRange.createMany({
    data: employeeCounts,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${employeeCounts.length} employee count ranges.`);

  //
  // ──────────────────────────────────────────────────────────────────────────────
  // 5) Seed RevenueRanges
  // ──────────────────────────────────────────────────────────────────────────────
  const revenueRanges = [
    { label: "$0K-$100K",    minRevenue: 0,     maxRevenue: 100000 },
    { label: "$100K-$1M",    minRevenue: 100000, maxRevenue: 1000000 },
    { label: "$1M-$10M",     minRevenue: 1000000, maxRevenue: 10000000 },
    { label: "$10M-$50M",    minRevenue: 10000000, maxRevenue: 50000000 },
    { label: "$50M-$100M",   minRevenue: 50000000, maxRevenue: 100000000 },
    { label: "$100M+",       minRevenue: 100000000, maxRevenue: null },
  ];

  await prisma.revenueRange.createMany({
    data: revenueRanges,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${revenueRanges.length} revenue ranges.`);

  //
  // ──────────────────────────────────────────────────────────────────────────────
  // 6) Seed Languages
  // ──────────────────────────────────────────────────────────────────────────────
  const languageData = [
    { name: "English", code: "en" },
    { name: "French",  code: "fr" },
    { name: "Spanish", code: "es" },
    { name: "Arabic",  code: "ar" },
    { name: "Chinese", code: "zh" },
    // add more as needed...
  ];

  await prisma.language.createMany({
    data: languageData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${languageData.length} languages.`);

  //
  // ──────────────────────────────────────────────────────────────────────────────
  // 7) Seed Specialties
  // ──────────────────────────────────────────────────────────────────────────────
  const specialtyData = [
    { name: "Quality Assurance" },
    { name: "Regulatory Affairs" },
    { name: "Research & Development" },
    { name: "Supply Chain Management" },
    { name: "Customer Service" },
    // add more as needed...
  ];

  await prisma.specialty.createMany({
    data: specialtyData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${specialtyData.length} specialties.`);

  //
  // ──────────────────────────────────────────────────────────────────────────────
  // 8) Seed Certifications
  // ──────────────────────────────────────────────────────────────────────────────
  const certificationData = [
    { name: "ISO 9001",   issuer: "International Organization for Standardization" },
    { name: "ISO 45001",  issuer: "International Organization for Standardization" },
    { name: "GMP",        issuer: "Food and Drug Administration" },
    { name: "CE Marking", issuer: "European Union" },
    { name: "LEED",       issuer: "U.S. Green Building Council" },
    // add more as needed...
  ];

  await prisma.certification.createMany({
    data: certificationData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${certificationData.length} certifications.`);

  //
  // ──────────────────────────────────────────────────────────────────────────────
  // 9) Seed SocialPlatforms
  // ──────────────────────────────────────────────────────────────────────────────
  const socialPlatformData = [
    { name: "Twitter",    domain: "twitter.com" },
    { name: "LinkedIn",   domain: "linkedin.com" },
    { name: "Facebook",   domain: "facebook.com" },
    { name: "Instagram",  domain: "instagram.com" },
    { name: "YouTube",    domain: "youtube.com" },
    { name: "TikTok",     domain: "tiktok.com" },
    // add more as needed...
  ];

  await prisma.socialPlatform.createMany({
    data: socialPlatformData,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${socialPlatformData.length} social platforms.`);
}

main()
  .catch((e) => {
    console.error("🚨 Seed error: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
