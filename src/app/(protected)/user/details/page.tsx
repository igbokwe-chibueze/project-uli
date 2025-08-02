// src/app/(protected)/user/details/page.tsx

import NotFound from "@/app/not-found";
import { redirect } from "next/navigation";

import { getUserById } from "@/features/auth/data/user";
import { currentID, currentName } from "@/features/auth/lib/authenticate";
import { UserInfo } from "@/features/user/components/user-info";


const UserDetailsPage = async () => {
  // Authenticate user by getting the session Id
  const userId = await currentID();

  // Not logged in → send to login (access)
  if (!userId) redirect('/access');

  const user = await getUserById(userId!);
  if (!user) {
    return <NotFound message="No user data found." />;
  }

  const userDisplayName = await currentName()


  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
          <h1 className="text-3xl font-bold">My Details</h1>
          <p className="text-muted-foreground">Profile Informations</p>
        </div>

        <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
          <UserInfo user={user} userDisplayName={userDisplayName}/>
        </div>
      </div>
    </div>
  )
}

export default UserDetailsPage