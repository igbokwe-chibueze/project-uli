// src/app/(protected)/user/settings/security/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


const page = () => {
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

export default page
