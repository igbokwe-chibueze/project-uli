// src/features/auth/hooks/use-current-user-role.ts

//Useful for getting user data client side, unlike authenticate.ts that get it sever side.
import { useSession } from "next-auth/react";

/**
 * Retrieves the role of the current user from the client-side session.
 * @returns The user's role, or null if not available.
 */
export const useCurrentRole = () => {
    const session = useSession();

    return session.data?.user?.role;
};