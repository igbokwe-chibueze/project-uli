// src/app/(protected)/organisations/create/page.tsx

import { ShieldBanIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation";

import ClientToast from "@/components/client-toast"

import { getAvailableCountries, getAvailableStates } from "@/data/static-data";

import { currentID } from "@/features/auth/lib/authenticate";
import CreateOrganisationForm from "@/features/organisations/components/create-organisation-form";


type OrganisationCreatePageProps = {
  searchParams: Promise<{
    message?: string | string[];
  }>;
};

const OrganisationCreatePage = async ({ searchParams }: OrganisationCreatePageProps) => {
    // Authenticate user by getting the session Id
    const user = await currentID();

    // Not logged in → send to login (access)
    if (!user) redirect('/access');

    //Fetch the countries and states
    const countries = await getAvailableCountries();
    const states = await getAvailableStates();


    const resolvedSearchParams = await searchParams;
    const message = resolvedSearchParams.message;
    return (
        <div className=" flex flex-col justify-center items-center gap-4 py-4 ">
            {message && <ClientToast message={message} />}
            <Link href="/" className="flex items-center gap-2 self-center font-medium">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <ShieldBanIcon className="size-6" />
                </div>
                Project-Uli.
            </Link>

            <div className="text-center space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary">Organization Registration</h1>
                <p className="text-lg text-muted-foreground">Join up and connect with other organizations worldwide</p>
            </div>

            <CreateOrganisationForm countries={countries} states={states}/>

            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By continuing, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}

export default OrganisationCreatePage