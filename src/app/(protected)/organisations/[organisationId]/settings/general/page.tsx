// src/app/(protected)/organisations/[organisationId]/settings/general/page.tsx

import { redirect } from "next/navigation";
import NotFound from "@/app/not-found";

import { getAvailableCertifications, getAvailableColorSchemes, getAvailableCountries, getAvailableEmployeeCountRanges, getAvailableIndustries, getAvailableLanguages, getAvailableOrgTypes, getAvailableRevenueRanges, getAvailableSocialPlatforms, getAvailableSpecialties, getAvailableStates } from "@/data/static-data";

import { currentID } from "@/features/auth/lib/authenticate";
import UpdateOrganisationForm from "@/features/organisations/components/update-organisation-form"
import { getOrganisationById, isUserOrganizationMember } from "@/features/organisations/data/organizations";

interface GeneralSettingsPageProps {
  params: Promise<{ organisationId: string }>;
}

const GeneralSettingsPage = async ({params,}: GeneralSettingsPageProps) => {
  // Authenticate user by getting the session Id
  const userId = await currentID();

  // Not logged in → send to login (access)
  if (!userId) redirect('/access');

  // Get the OrganisationId from the URL
  const orgId = (await params).organisationId;

  // Fetch the organization details by its ID.
  // If the organization does not exist, render a 404-like page.
  const organisation = await getOrganisationById(orgId);
  if (!organisation) {
      return <NotFound message="Organisation not found." />;
  }

  // Check if the authenticated user is a member of the organization.
  // If not a member, render a 404-like page with an access denied message.
  const isMember = await isUserOrganizationMember(userId, orgId);
  if (!isMember) {
      return (
          <NotFound message="Access denied: you are not a member of this organisation." />
      );
  }

  const countries = await getAvailableCountries();
  const states = await getAvailableStates();

  // Fetch countryOptions (id + label) on the server
  const industryOptions = await getAvailableIndustries();
  const orgTypeOptions = await getAvailableOrgTypes();
  const employeeCountRangeOptions = await getAvailableEmployeeCountRanges();
  const revenueRangeOptions = await getAvailableRevenueRanges();
  const languageOptions = await getAvailableLanguages();
  const specialtyOptions = await getAvailableSpecialties();
  const socialPlatformOptions = await getAvailableSocialPlatforms();
  const certificationOptions = await getAvailableCertifications();
  const colorSchemeOptions = await getAvailableColorSchemes();


  return (
    <>        
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
                    <h1 className="text-3xl font-bold">Update Organization</h1>
                    <p className="text-muted-foreground">Modify any of the fields below, then click “Save Changes.</p>
                </div>

                <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
                    <UpdateOrganisationForm
                      initialData={organisation}
                      countries={countries} 
                      states={states}
                      industryOptions={industryOptions}
                      orgTypeOptions={orgTypeOptions}
                      employeeCountRangeOptions={employeeCountRangeOptions}
                      revenueRangeOptions={revenueRangeOptions}
                      languageOptions={languageOptions}
                      specialtyOptions={specialtyOptions}
                      socialPlatformOptions={socialPlatformOptions}
                      certificationOptions={certificationOptions}
                      colorSchemeOptions={colorSchemeOptions}
                    />
                </div>
            </div>
        </div>
    </>
  )
}

export default GeneralSettingsPage