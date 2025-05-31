// src/features/auth/hooks/use-current-user-id.ts

//Useful for getting user data client side, unlike authenticate.ts that get it sever side.
import { useSession } from "next-auth/react";


export const UseCurrentUserId = () => {
  const session = useSession();

  return session.data?.user.id;
}