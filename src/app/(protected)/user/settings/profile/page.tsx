// src/app/(protected)/user/settings/profile/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const page = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your public profile details.</CardDescription>
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
