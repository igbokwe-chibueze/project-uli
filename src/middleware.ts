// src/middleware.ts

import NextAuth from "next-auth";
// Import the authentication configuration.
import { authConfig } from "@/auth.config";

// Import constants for redirect URLs and route prefixes.
import { DEFAULT_LOGIN_REDIRECT_URL, apiAuthPrefix, authRoutes, publicRoutes } from "@/routes";


// Initialize NextAuth with the provided configuration.
// Destructure the auth function that will be used to wrap the middleware.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    // Destructure nextUrl from the request; it contains URL information.
    const { nextUrl } = req;

    // Determine if the user is logged in. req.auth is set after NextAuth processes the request.
    const isLoggedIn = !!req.auth;

    // Check if the current route is an API authentication route by matching the prefix.
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    // Check if the current route is a public route (accessible without authentication).
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    // Check if the current route is an authentication-specific route (e.g., login or register pages).
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    // If it's an API auth route, allow the request to pass through without redirection.
    if (isApiAuthRoute) {
        return;
    }

    // If the request is for an auth route (like login/register) and the user is already logged in,
    // redirect them to the default page (to prevent showing login pages to authenticated users).
    if (isAuthRoute) {
        if (isLoggedIn) {
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT_URL, nextUrl));
        }
        return; // No redirect if not logged in; allow the auth route to be processed.
    }

    // For all other protected routes (non-public), if the user is not logged in,
    // redirect them to the login page.
    if (!isLoggedIn && !isPublicRoute) {
        // Construct the callback URL from the current pathname and search parameters.
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
        callbackUrl += nextUrl.search;
        }
        // Encode the callback URL to safely include it as a query parameter.
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        
        // Redirect the user to the login page with the callbackUrl query parameter.
        return Response.redirect(new URL(
            `/login?callbackUrl=${encodedCallbackUrl}`, 
            nextUrl
        ));
    }

    // Otherwise, allow the request to proceed without any special response.
    return;
});


// Export a configuration object for Next.js Middleware.
// The matcher property defines which paths the middleware should run on.
// It skips Next.js internal routes and static assets, ensures it runs on the homepage,
// and always runs for API routes.
export const config = {
    matcher: [
        // Skip Next.js internals and static files (e.g., files under _next and common asset extensions).
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Ensure middleware runs on the homepage (root route).
        '/',
        // Always run the middleware for API and tRPC routes.
        '/(api|trpc)(.*)',
    ],
};
