// src/app/(protected)/organisations/[organisationId]/page.tsx

import { redirect } from "next/navigation"

import NotFound from "@/app/not-found"
import { currentID } from "@/features/auth/lib/authenticate"
import { getOrganisationById, isUserOrganizationMember } from "@/features/organisations/data/organizations"
import Link from "next/link";
import { ArrowRightIcon, Building2Icon, CheckCircle2Icon, Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ organisationId: string }>;
  searchParams: Promise<{ created?: string }>;
}

const OrganisationIdPage = async ({params, searchParams}: PageProps) => {
    // Authenticate user by getting the session Id
    const user = await currentID();

    // Not logged in → send to login (access)
    if (!user) redirect('/access');

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
    const isMember = await isUserOrganizationMember(user, orgId);
    if (!isMember) {
        return (
            <NotFound message="Access denied: you are not a member of this organisation." />
        );
    }

    const createdFlag = (await searchParams).created === "true";

  return (
    <>        
        {createdFlag ? (
            <div className="min-h-screen bg-background py-8">
                <div className="max-w-2xl mx-auto px-2">
                    <Card className="text-center ">
                        <CardContent className="pt-8 pb-8">
                            <div className="space-y-6">
                                <div className="mx-auto size-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2Icon className="size-8 text-green-600" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-semibold">Organization Created Successfully!</h2>
                                    <p className="text-muted-foreground text-sm">
                                        {organisation.name} has been created with the basic information. 
                                        You can now complete your profile with additional details.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    {/* Button to “Continue to Details” (removing ?created from the URL) */}
                                    <Link href={`/organisations/${orgId}`} passHref >
                                        <Button size="lg" className="flex items-center gap-2">
                                            <Building2Icon className="size-4" />
                                            Continue to {organisation.name}
                                            <ArrowRightIcon className="size-4" />
                                        </Button>
                                    </Link>

                                    {/* Button to “Update Profile” (you might have a separate edit page) */}
                                    <Link href={`/organisations/${orgId}/update-organisation`} passHref>
                                        <Button variant="outline" size="lg" className="flex items-center gap-2">
                                            <Settings2Icon className="size-4" />
                                            Update Company Profile
                                        </Button>
                                    </Link>
                                </div>

                                <div className="text-muted-foreground text-sm">
                                    <p>💡 Tip: Complete your profile to unlock additional features and improve discoverability</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        ) : (

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
                        <h1 className="text-3xl font-bold">{organisation.name}</h1>
                        <p className="text-muted-foreground">Oraganisation overview and key metrics</p>
                    </div>

                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        
                    </div>
                </div>
            </div>
        )}
    </>
  )
}

export default OrganisationIdPage