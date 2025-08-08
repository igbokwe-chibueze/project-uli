// src/app/(protected)/user/settings/profile/page.tsx

import NotFound from "@/app/not-found";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvailableCountries, getAvailableLanguages, getAvailableStates } from "@/data/static-data";
import { getUserById } from "@/features/auth/data/user";
import { currentID } from "@/features/auth/lib/authenticate";
import UpdateUserProfileForm from "@/features/user/components/update-user-profile-form";
import { Gender } from "@prisma/client";
import { redirect } from "next/navigation";

const page = async () => {
  // Authenticate user by getting the session Id
  const userId = await currentID();

  // Not logged in → send to login (access)
  if (!userId) redirect('/access');

  const user = await getUserById(userId!);
  if (!user) {
      return <NotFound message="No user data found." />;
  }
  const countries = await getAvailableCountries();
  const states = await getAvailableStates();
  const languageOptions = await getAvailableLanguages();

  // Create the options array from the Gender enum
  const genderOptions = [
    { value: Gender.MALE, label: "Male" },
    { value: Gender.FEMALE, label: "Female" },
    { value: Gender.PREFER_NOT_TO_SAY, label: "Prefer not to say" },
  ];

  return (
    <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your public profile details.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <UpdateUserProfileForm
              initialData={user}
              countries={countries} 
              states={states}
              languageOptions={languageOptions}
              genderOptions={genderOptions}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default page
