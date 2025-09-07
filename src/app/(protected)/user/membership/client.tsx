// src/app/(protected)/user/membership/client.tsx
'use client';

import { useRouter } from "next/navigation";
import { DashboardPageHeaders } from "@/components/dashboard-page-headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/getInitials";
import { CalendarIcon, EditIcon, EyeIcon, MoreHorizontalIcon, PlusIcon, UsersIcon } from "lucide-react";

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

    // If the memberships array is empty, display a message to the user
    if (memberships.length === 0) {
        return (

            // <div className="flex justify-center items-center h-full p-4">
            //     <p className="text-muted-foreground">You are not a member of any organization.</p>
            // </div>

            <Card className="p-8 text-center">
                <div className="text-lg font-medium">You are not a member of any organization yet</div>
                <p className="text-sm mt-2 text-muted-foreground">When you join or get invited, they will appear here.</p>
            </Card>
        );
    }

    const handleCreateNew = () => {
        router.push("/organisations/create")
    }

    const handleViewOrganization = (id: string) => {
        router.push(`/organisations/${id}`);
    }

    const handleEditOrganization = (id: string) => {
        router.push(`/organisations/${id}/settings/general`)
    }

    // Define options for long date format
    const dateFormatOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };

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
                                    <Avatar className="w-22 h-12 rounded-lg">
                                        <AvatarImage src={membership.organization.logo || undefined} alt={membership.organization.name} />
                                        <AvatarFallback className="rounded-lg text-2xl">
                                            {getInitials(membership.organization.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="flex flex-col">
                                            <span className="text-lg">{membership.organization.name}</span>
                                            <span className="text-sm truncate">[{membership.organization.country?.name}]</span>
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
                                        {membership.organization.employeeCountRange?.label} employees
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
                                        <span>Joined {new Date(membership.joinedAt).toLocaleDateString("en-US", dateFormatOptions)}</span>
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
