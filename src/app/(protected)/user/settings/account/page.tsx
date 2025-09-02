// src/app/(protected)/user/settings/account/page.tsx

import NotFound from "@/app/not-found";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getUserById } from "@/features/auth/data/user";
import { currentID } from "@/features/auth/lib/authenticate";

import { StatusMessageCard } from "@/components/status-message-card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangleIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DangerZone from "@/features/user/components/danger-zone";


const AccountPage = async () => {
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
      {user.isActive ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Account Management</CardTitle>
              </div>
              <CardDescription>Manage your account data</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div 
                  className=" flex flex-row items-center justify-between
                  disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
                  dark:bg-input/30 border-input h-20 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs outline-none"
                >
                  <div className="space-y-0.5">
                    <Label>
                      Export Acount Data
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Download a copy of your account data
                    </p>
                  </div>

                  <Button variant="outline">
                    <DownloadIcon className="size-5 mr-2" />
                    <span>Export Data</span>
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <StatusMessageCard status="deactivated" />
      )}

      <Separator/>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive"> {/* Apply red text to header */}
            <AlertTriangleIcon className="size-5" /> {/* Warning icon */}
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <CardDescription>Delete or deactivate your account</CardDescription>
        </CardHeader>

        <CardContent>
          <DangerZone initialData={user}/>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountPage