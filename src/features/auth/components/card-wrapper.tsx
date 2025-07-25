// src/features/auth/components/card-wrapper.tsx
"use client"

import { cn } from "@/lib/utils";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

import Socials from "@/features/auth/components/socials";
import { Header } from "@/features/auth/components/header";
import { BackButton } from "@/features/auth/components/back-button";


interface CardWrapperProps {
    children: React.ReactNode;
    headerHeading: string;
    headerLabel?: string;
    headerIcon?: React.ReactNode;
    backButtonLabel?: string;
    backButtonHref?: string;
    showSocial?: boolean;
    className?: string;
};

export const CardWrapper = ({ 
    children, headerHeading, headerLabel, headerIcon, backButtonLabel, backButtonHref, showSocial, className 
}: CardWrapperProps) => {
    return (
        <>
            <Card className={cn("shadow-md", "w-[350px] lg:w-[450px]", className)}>
                <CardHeader>
                    <Header heading={headerHeading} label={headerLabel} icon={headerIcon}/>
                </CardHeader>

                {showSocial && (
                    <>
                        <CardFooter>
                            <Socials/>
                        </CardFooter>

                        <div className="px-4">
                            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 
                                after:flex after:items-center after:border-t after:border-border"
                            >
                                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                    OR
                                </span>
                            </div>
                        </div>
                    </>
                )}


                <CardContent>
                    {children}
                </CardContent>
                
                {backButtonHref && backButtonLabel && (
                    <CardFooter className=" flex justify-center">
                        <BackButton
                            label={backButtonLabel}
                            href={backButtonHref}
                        />
                    </CardFooter>
                )}
            </Card>
        </>
    )
}  