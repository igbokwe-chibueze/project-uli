// src/features/auth/components/global-logout-button.tsx
"use client";

import { useState, useTransition } from "react";
import { LoaderCircleIcon } from "lucide-react";

import { logout } from "@/features/auth/actions/logout";
import { globalLogoutAction } from "@/features/auth/actions/global-logout-action";


interface GlobalLogoutButtonProps {
    children: React.ReactNode;
}

export const GlobalLogoutButton = ({ children }: GlobalLogoutButtonProps) => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const onClick = () => {
        setError(null);
        startTransition(async () => {
            try {
                const res = await globalLogoutAction();
                if (res.success) {
                    // After the server action updates passwordChangedAt, sign out the current device.
                    await logout();
                } else if (res.error) {
                    setError(res.error);
                }
            } catch (err) {
                console.error("Global sign out error:", err);
                setError("Something went wrong. Try again.");
            }
        });
    };
      

    return (
        <span
            onClick={onClick}
            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending ? (
                <span className="flex items-center gap-2">
                    <LoaderCircleIcon className="size-4 mr-2 animate-spin" />
                    Logging out...
                </span>
            ) : (
                children
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </span>
    );
};
