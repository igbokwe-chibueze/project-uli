// src/features/auth/components/card-wrapper.tsx
"use client"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Header } from "@/features/auth/components/header";
import Socials from "@/features/auth/components/socials";
import { BackButton } from "@/features/auth/components/back-button";


interface CardWrapperProps {
    children: React.ReactNode;
    headerHeading: string;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;
};

export const CardWrapper = ({ children, headerHeading, headerLabel, backButtonLabel, backButtonHref, showSocial }: CardWrapperProps) => {
    return (
        <>
            <Card className="w-[400px] shadow-md">
                <CardHeader>
                    <Header heading={headerHeading} label={headerLabel} />
                </CardHeader>

                {showSocial && (
                    <CardFooter>
                        <Socials/>
                    </CardFooter>
                )}

                <div className="px-4">
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 
                        after:flex after:items-center after:border-t after:border-border"
                    >
                        <span className="relative z-10 bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <CardContent>
                    {children}
                </CardContent>

                <CardFooter className=" flex justify-center">
                    <BackButton
                        label={backButtonLabel}
                        href={backButtonHref}
                    />
                </CardFooter>
            </Card>
        </>
    )
}  