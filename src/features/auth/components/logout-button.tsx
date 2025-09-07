// src/features/auth/components/logout-button.tsx

import { logout } from "@/features/auth/actions/logout";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
    children: React.ReactNode;
    className?: string;
}


export const LogoutButton = ({children, className}: LoginButtonProps) => {

    const onClick = () => {
        logout();
    };

    return (
        <span
            onClick={onClick}
            className={cn("cursor-pointer", className)}
        >
            {children}
        </span>
    );
};