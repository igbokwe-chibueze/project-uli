// src/features/auth/hooks/use-current-user.ts

//Useful for getting user data client side, unlike authenticate.ts that get it sever side.
import { useSession } from "next-auth/react";


export const UseCurrentUser = () => {
  const session = useSession();

  return session.data?.user;
}
