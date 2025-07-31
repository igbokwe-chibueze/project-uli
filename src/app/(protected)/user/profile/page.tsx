// src/app/(protected)/user/profile/page.tsx

import NotFound from "@/app/not-found";
import { getUserById } from "@/features/auth/data/user";
import { currentID, currentName } from "@/features/auth/lib/authenticate";
import { ProfileHeader } from "@/features/user/components/profile-header"
import { Metadata } from "next"
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile",
}

const UserProfilePage = async () => {
  // Authenticate user by getting the session Id
  const userId = await currentID();

  // Not logged in → send to login (access)
  if (!userId) redirect('/access');

  const user = await getUserById(userId!);
  if (!user) {
      return <NotFound message="No user data found." />;
  }

  // Fetch the user's display name (concatenated firstName and lastName) using a dedicated hook.
  // This centralizes the name formatting logic and ensures consistency across the UI.
  // Although `user` contains `firstName` and `lastName`, using `currentName` here
  // is an optimization for maintainability and readability, as the concatenation
  // logic (including fallbacks) is encapsulated. The performance overhead is negligible
  // as both hooks read from the same cached session data.
  const userDisplayName = await currentName()

  return (
    <div>
      <ProfileHeader user={user} userDisplayName={userDisplayName}/>
    </div>
  )
}

export default UserProfilePage