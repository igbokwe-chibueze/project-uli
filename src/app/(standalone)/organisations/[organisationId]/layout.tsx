// src/app/(standalone)/organisations/[organisationId]/layout.tsx

import { auth } from "@/auth";
import { Metadata } from "next";
import NotFound from "@/app/not-found";
import { SessionProvider } from "next-auth/react";

import { StandaloneNavbar } from "@/components/navigation/standalone-navbar";
import { getOrganisationSummaryById } from "@/features/organisations/data/organizations";

export const metadata: Metadata = {
  title: "App Marketplace",
  description: "Discover and manage your modules easily",
};
interface StandaloneLayoutProps {
  params: Promise<{ organisationId: string }>;
  children: React.ReactNode;
};

const StandaloneOrgLayout = async ({ children, params }: StandaloneLayoutProps) => {
  // Retrieve the current session (user authentication state)
  const session = await auth();

  // Get the OrganisationId from the URL
  const orgId = (await params).organisationId;

  // Fetch the organization details by its ID.
  // If the organization does not exist, render a 404-like page.
  const organisation = await getOrganisationSummaryById(orgId);
  if (!organisation) {
      return <NotFound message="Organisation not found." />;
  }

  // Now you can access the color scheme name
  const colorSchemeName = organisation.colorScheme?.name || 'theme-velvet'; // Provide a fallback if no color scheme is set

  return (
    <SessionProvider session={session}>
      <StandaloneNavbar />
      <div className={`pt-12 ${colorSchemeName}`}>
        <main className="min-h-screen">
          <div className="max-w-screen-2xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  )
}

export default StandaloneOrgLayout;