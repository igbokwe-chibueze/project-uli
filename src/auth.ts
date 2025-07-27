// src/auth.ts

import { authConfig } from "@/auth.config"
// Import the JWT type for extending it
import { type DefaultJWT } from "next-auth/jwt";
import NextAuth, { DefaultSession } from "next-auth"

import { UserRole } from "@prisma/client"
import { PrismaAdapter } from "@auth/prisma-adapter"

import {prisma} from "@/lib/prisma/prisma"

import { getUserById } from "@/features/auth/data/user"
import { getAccountByUserId } from "./features/auth/data/accounts"
import { getTwoFactorConfirmationByUserId } from "./features/auth/data/two-factor-confirmation"


// Extend the NextAuth Session type to include custom properties.
// This allows you to add fields like firstName, lastName, role, etc
// directly to the session.user object, making them accessible throughout
// your application (e.g., via useSession() or auth()).
declare module "next-auth" {
    interface Session {
      user: {
        firstName?: string | null;
        lastName?: string | null;
        role: UserRole;
        isTwoFactorEnabled?: boolean;
        isOAuth?: boolean;
      } & DefaultSession["user"] // Keep existing DefaultSession user properties (like name, email, image)
      hasPasswordChanged?: boolean;
    }
}

/**
 * Augment the NextAuth JWT (JSON Web Token) type.
 *
 * This declaration extends the default 'JWT' interface provided by NextAuth.js.
 * It's crucial for type safety when you add custom properties to the JWT 'token'
 * object within the `jwt` callback. Without this augmentation, TypeScript would
 * report errors because these custom properties (like `firstName`, `lastName`,
 * and `hasPasswordChanged`) are not part of NextAuth's default JWT type.
 *
 * By declaring them here, you inform TypeScript that these properties will
 * exist on the 'token' object, enabling proper type checking, autocompletion,
 * and preventing runtime errors related to undefined properties.
 */
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    firstName?: string | null;
    lastName?: string | null;
    hasPasswordChanged?: boolean; // Ensure this is also in the JWT type
    isTwoFactorEnabled?: boolean; // Ensure this is also in the JWT type
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
                //session.user.name = token.name as string; // This line might be redundant if you use firstName/lastName
                session.user.firstName = token.firstName as string | null;
                session.user.lastName = token.lastName as string | null;
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
            token.firstName = existingUser.firstName;
            token.lastName = existingUser.lastName;
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
