// src/app/(protected)/user/settings/security/page.tsx

import NotFound from "@/app/not-found";
import { redirect } from "next/navigation";

import { getUserById } from "@/features/auth/data/user";
import { currentID } from "@/features/auth/lib/authenticate";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UpdateUserEmailPasswordForm from "@/features/user/components/update-user-email-password-form";


const UserSecurityUpdatePage = async () => {
  // Authenticate user by getting the session Id
  const userId = await currentID();

  // Not logged in → send to login (access)
  if (!userId) redirect('/access');

  const user = await getUserById(userId!);
  if (!user) {
      return <NotFound message="No user data found." />;
  }
  return (
    <div className=" space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Update your password to keep your account secure. Choose a strong, unique password.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <UpdateUserEmailPasswordForm
              initialData={user}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Security Preferences</CardTitle>
          </div>
          <CardDescription>Update your security settings to enhance account protection and manage security features.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">

          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Active Sessions</CardTitle>
          </div>
          <CardDescription>View recent activity on your account. Check for any unusual or suspicious actions.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">

          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserSecurityUpdatePage
