// src/features/auth/hooks/use-current-name.ts

// src/features/auth/hooks/use-current-name.ts
// Useful for getting concatenated full name client side.
import { useSession } from "next-auth/react";

/**
 * Retrieves the concatenated full name of the current user from the client-side session.
 * It prioritizes firstName and lastName, falling back to the 'name' field if available,
 * or a generic 'User' if no name parts are found.
 * @returns The user's full name string, or a fallback string.
 */
export const useCurrentName = () => {
    const session = useSession();
    const user = session.data?.user;

    if (user?.firstName && user?.lastName) {
        return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
        return user.firstName;
    }
    if (user?.lastName) {
        return user.lastName;
    }
    // Fallback to the default 'name' field from DefaultSession if it exists
    if (user?.name) {
        return user.name;
    }
    return 'User'; // Generic fallback
};