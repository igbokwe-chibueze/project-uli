// src/auth.ts

import NextAuth, { DefaultSession } from "next-auth"
import { authConfig } from "@/auth.config"

import { UserRole } from "@prisma/client"
import { PrismaAdapter } from "@auth/prisma-adapter"
import {prisma} from "./lib/prisma/prisma"

import { getUserById } from "@/features/auth/data/user"
import { getTwoFactorConfirmationByUserId } from "./features/auth/data/two-factor-confirmation"
import { getAccountByUserId } from "./features/auth/data/accounts"


declare module "next-auth" {
    interface Session {
      user: {
        role: UserRole;
        isTwoFactorEnabled?: boolean;
        isOAuth?: boolean;
      } & DefaultSession["user"]
      hasPasswordChanged?: boolean;
    }
}

export const { 
    handlers, 
    signIn, 
    signOut, 
    auth,
} = NextAuth({
    pages: {
        signIn: "/access",
        error: "/error",
        signOut: "/access",
    },
    events: {
        async linkAccount({ user }) {
            await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() },
            })
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            //Allow OAuth without email verification
            if (account?.provider !== "credentials" ) return true;

            const existingUser = await getUserById(user.id!);

            //prevent sign in without email verification
            if (!existingUser?.emailVerified) return false;

            //2FA check
            if (existingUser.isTwoFactorEnabled) {
                const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

                if (!twoFactorConfirmation) return false;

                // Delete two factor confirmation, so every signIn undergoes 2FA check
                await prisma.twoFactorConfirmation.delete(
                    { where: { id: twoFactorConfirmation.id } }
                )
            }

            return true;
        },
        async session({ token, session }) {
            
            if (token.sub && session.user) {
                session.user.id = token.sub
            }

            if (token.role && session.user) {
                session.user.role = token.role as UserRole;
            }

            if (session.user) {
                session.user.isOAuth = token.isOAuth as boolean;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                //session.user.image = token.picture as string;
                session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
            }

            // Propagate the custom property to the session
            session.hasPasswordChanged = token.hasPasswordChanged as boolean;

            return session
        },
        async jwt({ token }) {
            if (!token.sub) return token;

            const existingUser = await getUserById(token.sub);

            if (!existingUser) return token;

            // Global sign-out check: Compare token's issued time (iat) with passwordChangedAt.
            // Note: token.iat is in seconds; convert it to milliseconds.
            if (existingUser.passwordChangedAt && token.iat) {
                const tokenIssuedAt = token.iat * 1000; // Convert to milliseconds
                const passwordChangedAt = new Date(existingUser.passwordChangedAt).getTime();
                
                if (tokenIssuedAt < passwordChangedAt) {
                    // Mark token as invalid
                    token.hasPasswordChanged = true;
                }
            }

            // Populate additional token fields
            const existingAccount = await getAccountByUserId(existingUser.id);
            
            token.isOAuth = !!existingAccount;
            token.name = existingUser.name;
            token.email = existingUser.email;
            //token.picture = existingUser.image;
            token.role = existingUser.role;
            token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

            return token
        },
    },
    adapter: PrismaAdapter(prisma),
    // This strategy stores session data in a JWT rather than in a database due to edge compatability.
    session: {
        strategy: "jwt",
    },
    ...authConfig
})
