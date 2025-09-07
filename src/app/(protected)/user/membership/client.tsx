// src/app/(protected)/user/membership/client.tsx
'use client';

import { format } from "date-fns";
import { CalendarIcon, EditIcon, EyeIcon, MoreHorizontalIcon, PlusIcon, UsersIcon } from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { getInitials } from "@/lib/getInitials";
import { DashboardPageHeaders } from "@/components/dashboard-page-headers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Define a type for the incoming data based on the Prisma query
type Membership = {
  organization: {
    id: string;
    name: string;
    logo: string | null;
    //isActive: ;
    description: string | null;
    country: { name: string } | null;
    industry: { name: string } | null;
    employeeCountRange: { label: string } | null;
    _count: {
      members: number;
    };
  };
  joinedAt: Date; // The join date is directly on the membership object
};

type MembershipClientProps = {
    userName: string;
    memberships: Membership[];
};

/**
 * @description A client component to display a list of organizations a user is a member of.
 * @param {MembershipClientProps} props - The component props containing the list of memberships.
 */
export const MembershipClient = ({userName, memberships}: MembershipClientProps) => {
    const router = useRouter();
    
    const handleCreateNew = () => {
        router.push("/organisations/create")
    }

    const handleViewOrganization = (id: string) => {
        router.push(`/organisations/${id}`);
    }

    const handleEditOrganization = (id: string) => {
        router.push(`/organisations/${id}/settings/general`)
    }


    // If the memberships array is empty, display a message to the user
    if (memberships.length === 0) {
        return (
            <div className="flex flex-1 p-4">
                <Card className="flex flex-1 items-center justify-center text-center">
                    <CardContent className="flex flex-col items-center gap-6">
                        
                        {/* Illustration for empty state */}
                        <div className="relative size-56 md:size-72 lg:size-80 ">
                            <Image
                                src="/illustrations/characters/character-02.svg"
                                alt="No memberships illustration"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Text */}
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">No memberships yet</h2>
                            <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground">
                                You haven’t joined or created any organization.  
                                Start by creating one or accept an invite.
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button onClick={handleCreateNew}>
                                <PlusIcon className="mr-2 size-4" />
                                Create Organisation
                            </Button>
                            <Button variant="outline">
                                <UsersIcon className="mr-2 size-4" />
                                Join with Invite
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }


  return (
    <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
            <DashboardPageHeaders
                title="Your memberships"
                description={
                    <>
                        Hi {userName || "there"}! You belong to {memberships.length}{" "}
                        organization{memberships.length === 1 ? "" : "s"}.
                    </>
                }
            />

            <div className="flex justify-end px-4">
                <Button onClick={handleCreateNew}>
                    <PlusIcon className="mr-2 size-4" />
                    Create New Organisation
                </Button>
            </div>


            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
                {memberships.map((membership) => (
                    // Use a Card component to display each organization
                    <Card key={membership.organization.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-22 h-16 rounded-lg">
                                        <AvatarImage src={membership.organization.logo || undefined} alt={membership.organization.name} />
                                        <AvatarFallback className="rounded-lg text-2xl">
                                            {getInitials(membership.organization.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="flex flex-col">
                                            <span className="text-lg">{membership.organization.name}</span>
                                            <span className="text-sm truncate">[{membership.organization.country?.name || "country"}]</span>
                                        </CardTitle>
                                        
                                        <CardDescription className="text-sm">
                                            {membership.organization.industry?.name || "Industry type"}
                                        </CardDescription>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontalIcon className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleViewOrganization(membership.organization.id)}>
                                            <EyeIcon className="size-4 mr-2" />
                                            Visit
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => handleEditOrganization(membership.organization.id)}>
                                            <EditIcon className="size-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {membership.organization.description || "No description provided."}
                                </p>

                                <div className="flex items-center justify-between text-sm">
                                    <Badge
                                        variant={"default"}>
                                        {"active"}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                        {membership.organization.employeeCountRange?.label || "0"} employees
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <UsersIcon className="size-3" />
                                        <span>
                                            {membership.organization._count.members}{" "}
                                            member{membership.organization._count.members === 1 ? "" : "s"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="size-3" />
                                        <span>Joined {format(new Date(membership.joinedAt), "MMMM d, yyyy")}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
            </div>
        </div>
    </div>
  )
}
