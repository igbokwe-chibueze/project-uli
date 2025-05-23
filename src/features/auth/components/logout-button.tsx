// src/features/auth/components/logout-button.tsx

import { logout } from "@/features/auth/actions/logout";

interface LoginButtonProps {
    children: React.ReactNode;
}


export const LogoutButton = ({children}: LoginButtonProps) => {

    const onClick = () => {
        logout();
    };

    return (
        <span
            onClick={onClick}
            className="cursor-pointer"
        >
            {children}
        </span>
    );
};