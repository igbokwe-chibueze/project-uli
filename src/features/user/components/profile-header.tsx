// src/features/user/components/profile-header.tsx

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserPenIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"


interface ProfileHeaderUser {
    firstName: string;
    lastName: string;
    image: string | null;
}

interface ProfileHeaderProps {
    user: ProfileHeaderUser;
    userDisplayName: string;
}

export const ProfileHeader = ({user, userDisplayName,}: ProfileHeaderProps) => {

    // Function to get the initials (first letter of first name + first letter of last name)
    const getUserInitials = () => {
        const firstInitial = user?.firstName?.charAt(0) || '';
        const lastInitial = user?.lastName?.charAt(0) || '';
        // If both initials are available, combine them. Otherwise, fall back to the first two
        // characters of the display name, or a default if that's also empty.
        return (firstInitial + lastInitial).toUpperCase() || userDisplayName.slice(0, 2).toUpperCase() || '??';
    };

  return (
    <section className="bg-background border-y border-border">
        <AspectRatio ratio={5 / 1} className="bg-muted">
            {user.firstName && (
                <Image
                    src={""}
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
                    {getUserInitials()}
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
