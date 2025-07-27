// src/features/auth/hooks/use-current-user.ts

//Useful for getting user data client side, unlike authenticate.ts that get it sever side.
import { useSession } from "next-auth/react";

/**
 * Retrieves the full user object from the client-side session.
 * @returns The user object from the session, or null if no session.
 */
export const UseCurrentUser = () => {
  const session = useSession();

  return session.data?.user;
}
