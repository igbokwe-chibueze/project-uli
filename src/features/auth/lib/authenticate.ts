// src/features/auth/lib/authenticate.ts

// Useful for getting user data server side, unlike use-current-user and use-current-roles hooks that get it client side.
import { auth } from "@/auth";

/**
 * Retrieves the full user object from the session.
 * @returns The user object from the session, or null if no session.
 */
export const currentUser = async () => {
    const session = await auth();
    return session?.user;
};

/**
 * Retrieves the ID of the current user from the session.
 * @returns The user's ID, or null if no session or ID.
 */
export const currentID = async () => {
    const session = await auth();
    return session?.user?.id;
};

/**
 * Retrieves the concatenated full name of the current user from the session.
 * It prioritizes firstName and lastName, falling back to the 'name' field if available,
 * or a generic 'User' if no name parts are found.
 * @returns The user's full name string, or a fallback string.
 */
export const currentName = async () => {
  const session = await auth();
  const user = session?.user;

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

/**
 * Retrieves the first name of the current user from the session.
 * @returns The user's first name, or null if not available.
 */
export const currentFirstName = async () => {
  const session = await auth();
  return session?.user?.firstName;
};

/**
 * Retrieves the last name of the current user from the session.
 * @returns The user's last name, or null if not available.
 */
export const currentLastName = async () => {
  const session = await auth();
  return session?.user?.lastName;
};

/**
 * Retrieves the role of the current user from the session.
 * @returns The user's role, or null if not available.
 */
export const currentRole = async () => {
    const session = await auth();
    return session?.user?.role;
};
