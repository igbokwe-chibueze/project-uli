// src/app/(protected)/user/settings/preference/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


const page = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>Adjust your settings to control which notifications you receive.</CardDescription>
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
