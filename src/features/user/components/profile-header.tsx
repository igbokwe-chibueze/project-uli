// src/features/user/components/profile-header.tsx

import Link from "next/link"
import Image from "next/image"
import { UserPenIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/getInitials"

import { buttonVariants } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


interface ProfileHeaderUser {
    firstName: string;
    lastName: string;
    image: string | null;
    bannerImage?: string | null;
}

interface ProfileHeaderProps {
    user: ProfileHeaderUser;
    userDisplayName: string;
}

export const ProfileHeader = ({user, userDisplayName,}: ProfileHeaderProps) => {
  return (
    <section className="bg-background border-y border-border">
        <AspectRatio ratio={5 / 1} className="bg-muted">
            {user.bannerImage && (
                <Image
                    src={user.bannerImage}
                    fill
                    className="h-full w-full object-cover"
                    alt="Profile Background"
                />
            )}
        </AspectRatio>

        <div className="relative w-full flex flex-col items-center gap-2 p-4 md:flex-row">
            <Avatar className="size-32 -mt-20 md:size-40 rounded-lg">
                <AvatarImage
                    src={user?.image || ""}
                    alt={userDisplayName || "User Avatar"}
                    className="border-4 border-background"
                />
                <AvatarFallback className="border-4 border-background rounded-lg text-6xl">
                    {getInitials(user.firstName + " " + user.lastName)}
                </AvatarFallback>
            </Avatar>
            
            <Link
                href={"/user/details"}
                className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "absolute top-4 end-4"
                )}
                aria-label="Edit your profile"
            >
                <UserPenIcon className="size-4" />
            </Link>

            <div className="text-center md:text-start">
                <div>
                    <h1 className="text-2xl font-bold line-clamp-1 capitalize">{userDisplayName}</h1>
                    <p className="text-muted-foreground line-clamp-1">
                        User State
                        User Country
                    </p>
                </div>
                <div className="inline-flex w-full">
                    <p className="text-primary after:content-['\00b7'] after:mx-1">
                        20 followers
                    </p>
                    <p className="text-primary">
                        30 connections
                    </p>
                </div>
            </div>
        </div>
    </section>
  )
}
