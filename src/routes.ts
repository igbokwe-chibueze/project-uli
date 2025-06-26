// src/routes.ts

/**
 * An array of routes that are accessible to the public but not accessible to logged in users
 * These routes will redirect logged in users to /organisations
 * @type {string[]}
 */
export const marketingRoutes = [
    "/", 
    "/about", 
    "/features",
];

/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
    "/email-verification",
    "/pricing",
    "/faq"
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /organisations
 * @type {string[]}
 */
export const authRoutes = [
    "/access",
    "/registration",
    "/error",
    "/initiate-password-reset",
    "/complete-password-reset",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API autthentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT_URL = "/organisations";
