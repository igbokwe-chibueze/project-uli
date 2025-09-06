// src/features/organisations/components/create-organisation-form-skeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";
import { CardWrapper } from "@/features/auth/components/card-wrapper";
import { Building2Icon } from "lucide-react";

export const CreateOrganisationFormSkeleton = () => {
    return (
        <CardWrapper
            headerHeading="Create an Organization"
            headerLabel="Fill out the form below to register your organization."
            headerIcon={<Building2Icon className="size-6" />}
            className="lg:w-[620px]"
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    {/* Organization Logo */}
                    <div className="flex items-center space-x-4">
                        <Skeleton className="size-28 rounded-lg" /> {/* Image preview skeleton */}
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-10 w-52" /> {/* Upload Button skeleton */}
                            <Skeleton className="h-10 w-52" /> {/* Delete Button skeleton */}
                        </div>
                    </div>

                    {/* Organization Name */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" /> {/* Label skeleton */}
                        <Skeleton className="h-12 w-full" /> {/* Input skeleton */}
                    </div>

                    {/* Location Selector (Country) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-20" /> {/* Country Label skeleton */}
                            <Skeleton className="h-12 w-full" /> {/* Country Button skeleton */}
                        </div>

                        {/* Location Selector (State/Province) - Assume it will be present if data loads */}
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-20" /> {/* State Label skeleton */}
                            <Skeleton className="h-12 w-full" /> {/* State Button skeleton */}
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    <Skeleton className="h-10 w-full flex-1" /> {/* Register Button skeleton */}
                    <Skeleton className="h-10 w-32" /> {/* Cancel Button skeleton */}
                </div>
            </div>
        </CardWrapper>
    );
};