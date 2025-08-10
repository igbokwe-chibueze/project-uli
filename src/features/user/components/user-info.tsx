// src/features/user/components/user-info.tsx

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/lib/getInitials";
import { cn } from "@/lib/utils";
import { User } from "@prisma/client";
import { ShieldIcon, UserIcon, UserPenIcon, } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Define a new interface that extends User to include the relations
// For a fully typed solution, you should generate types from your schema
interface UserWithRelations extends User {
  country?: { name: string } | null;
  state?: { name: string } | null;
  userLanguages?: { language: { id: string; name: string; }; fluency?: string | null }[];
}

interface UserInfoProps {
    user: UserWithRelations;
    userDisplayName: string;
}

export const UserInfo = ({user, userDisplayName,}: UserInfoProps) => {
    // Get an array of language names
    const languagesSpoken = user.userLanguages
        ?.map(ul => `${ul.language.name}${ul.fluency ? ` (${ul.fluency})` : ''}`)
        .join(", ");

  return (
    <div className="lg:w-5xl space-y-4">
        <Card>
            <CardHeader>
                <div className="flex justify-between">

                    <div className="flex items-center gap-2">
                        <UserIcon className="size-5" />
                        <CardTitle>User Details</CardTitle>
                    </div>

                    <Link href={"/user/settings/profile"}
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                        aria-label="Edit your profile"
                    >
                        <UserPenIcon className="size-4" />
                    </Link>
                </div>
                <CardDescription>Name, country, state, bio info</CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    <Avatar className="size-22 rounded-lg">
                        <AvatarImage
                            src={user?.image || ""}
                            alt={userDisplayName || "User Avatar"}
                        />
                        <AvatarFallback className="rounded-lg text-4xl">
                            {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p>First Name</p>
                            <Input disabled value={user.firstName ?? ""}/>
                        </div>

                        <div className="space-y-2">
                            <p>Surname</p>
                            <Input disabled value={user.lastName ?? ""}/>
                        </div>

                        <div className="space-y-2">
                            <p>Username</p>
                            <Input disabled value={user.username ?? ""}/>
                        </div>

                        <div className="space-y-2">
                            <p>Other Name</p>
                            <Input disabled value={user.otherName ?? ""}/>
                        </div>

                        <div className="space-y-2">
                            <p>Gender</p>
                            <Input disabled value={user.gender ?? ""}/>
                        </div>

                        <div className="space-y-2">
                            <p>Email</p>
                            <Input disabled value={user.email ?? ""}/>
                        </div>

                        <div className="space-y-2">
                            <p>Phone Number</p>
                            <Input disabled value={user.phoneNumber ?? ""}/>
                        </div>

                        <div className="space-y-2">
                            <p>Website</p>
                            <Input disabled value={user.website ?? ""}/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p>Bio</p>
                        <Textarea disabled value={user.bio ?? ""}/>
                    </div>

                    {/* country and state*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p>Country</p>
                            <Input disabled value={user.country?.name ?? ""}/>
                        </div>

                        {user.state?.name && (
                            <div className="space-y-2">
                                <p>State / Province / Region</p>
                                <Input disabled value={user.state?.name ?? ""}/>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <p>Street Address 1</p>
                        <Input disabled value={user.streetAddress1 ?? ""}/>
                    </div>

                    <div className="space-y-2">
                        <p>Street Address 2</p>
                        <Input disabled value={user.streetAddress2 ?? ""}/>
                    </div>

                    <div className="space-y-2">
                        <p>Banner</p>
                        <AspectRatio ratio={5 / 1} className="bg-muted rounded-lg">
                            {user.bannerImage && (
                                <Image
                                    src={""}
                                    fill
                                    className="h-full w-full object-cover"
                                    alt="Profile Background"
                                />
                            )}
                        </AspectRatio>
                    </div>

                    <div className="space-y-2">
                        <p>Spoken Languages</p>
                        <Input disabled value={languagesSpoken ?? ""}/>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* ─────────────────────────────────────────────────────────────────── */}
            {/* ──── Security and Notification Preferences ──────────────── */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <Card>
            <CardHeader>
                <div className="flex justify-between">

                    <div className="flex items-center gap-2">
                        <ShieldIcon className="size-5" />
                        <CardTitle>Security and Notification Preferences</CardTitle>
                    </div>

                    <Link href={"/user/settings/security"}
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                        aria-label="Edit your profile"
                    >
                        <UserPenIcon className="size-4" />
                    </Link>
                </div>
                <CardDescription>See how you handle 2FA and Login Alerts notifications</CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">

                    {/* Two Factor Authentication */}
                    <div 
                        className=" flex flex-row items-center justify-between
                        disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
                        dark:bg-input/30 border-input h-12 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs outline-none"
                    >
                        <p className="text-muted-foreground text-base  md:text-sm">
                            Two Factor Authentication
                        </p>
                        <Badge variant= {user?.isTwoFactorEnabled ? 'default' : 'secondary'}>
                            {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>

                    {/* login Alerts */}
                    <div 
                        className=" flex flex-row items-center justify-between
                        disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
                        dark:bg-input/30 border-input h-12 w-full min-w-0 rounded-md border px-3 py-1 shadow-xs outline-none"
                    >
                        <p className="text-muted-foreground text-base  md:text-sm">
                            login Alerts
                        </p>
                        <Badge variant= {user?.loginAlertsEnabled ? 'default' : 'secondary'}>
                            {user?.loginAlertsEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>
                </div>


            </CardContent>
        </Card>
    </div>
  )
}
