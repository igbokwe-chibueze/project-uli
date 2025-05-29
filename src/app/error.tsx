// src/app/error.tsx

"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
        useEffect(() => {
            // Log the error to an error reporting service
            console.error(error);
        }, [error]);

    return (
        <div className="h-screen flex flex-col gap-y-4 items-center justify-center">
            <AlertTriangle className="size-6 text-muted-foreground"/>
            <p className="text-sm text-muted-foreground">Something went wrong!</p>

            <Button
                variant={"muted"}
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </Button>

            <Button variant={"secondary"} size={"sm"}>
                <Link href={"/"}>
                    Back to Home
                </Link>
            </Button>
        </div>
    );
}
