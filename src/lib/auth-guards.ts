// src/lib/auth-guards.ts

"use server";

import { prisma } from "@/lib/prisma/prisma";
import type { OrganizationMember, OrgRole, User } from "@prisma/client";

import { currentID } from "@/features/auth/lib/authenticate"; // your existing helper that returns current user id or null

/**
 * Error types thrown by the guard. Consumers can check error.message or error.name
 * to decide how to respond (redirect to login, show 403, etc).
 */
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Options for the guard.
 * - allowedRoles: explicit OrgRole list that is considered authorized (defaults to ADMIN & OWNER)
 * - fetchUser: if true, include the related User object in the return (may add DB cost)
 */
export type AuthGuardOrgOptions = {
  allowedRoles?: OrgRole[]; // roles permitted to pass the guard (defaults to OWNER & MANAGER)
};

/**
 * authGuardOrgAdminAction
 *
 * Server-side guard that:
 *  1. Ensures the caller is authenticated (uses currentID())
 *  2. Ensures the target organization exists and is active
 *  3. Ensures the authenticated user is a member of the organization
 *  4. Ensures the member's role is in the allowedRoles list
 *
 * Returns the OrganizationMember record (optionally including the user relation) upon success.
 *
 * Throws:
 *  - AuthError         => when user is not authenticated
 *  - NotFoundError     => when organization does not exist or is inactive
 *  - AuthorizationError=> when user is not a member or not in allowed roles
 *
 * Usage:
 *   const membership = await authGuardOrgAdminAction(orgId);
 *   // membership contains the member record (and user)
 *
 * @param orgId - id of the organisation to guard
 * @param opts  - optional guard options (allowedRoles)
 */
export const authGuardOrgAdminAction = async (
  orgId: string,
  opts: AuthGuardOrgOptions = {}
): Promise<OrganizationMember & { user: User }> => {
  // Defensive checks
  if (!orgId) throw new Error("orgId is required");

  // Default roles considered 'admin' for the guard: you can adjust to your OrgRole enum
  const DEFAULT_ALLOWED_ROLES: OrgRole[] = ["OWNER", "MANAGER"];

  const allowedRoles = opts.allowedRoles ?? DEFAULT_ALLOWED_ROLES;

  // 1) Check authentication
  const userId = await currentID();
  if (!userId) {
    // Caller is not authenticated
    // Upstream code should handle redirect-to-login when it sees this
    throw new AuthError("AUTH_REQUIRED");
  }

  // 2) Verify organisation exists and is active (prevent actions against disabled orgs)
  const organisation = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, isActive: true },
  });

  if (!organisation) {
    throw new NotFoundError("ORG_NOT_FOUND");
  }

  if (organisation.isActive === false) {
    // Organization exists but is deactivated
    throw new NotFoundError("ORG_INACTIVE");
  }

  // 3) Find membership for user in this organisation
  // Because you defined @@unique([orgId, userId]) Prisma generated a compound unique field name:
  // where: { orgId_userId: { orgId, userId } }
  const membership = await prisma.organizationMember.findUnique({
    where: {
      // Prisma's generated compound unique name for ([orgId, userId]) is typically `orgId_userId`
      // If your generated name differs, adjust accordingly. This pattern works with standard Prisma names.
      orgId_userId: { orgId, userId },
    },
    include: { user: true }, // ✅ Always include the user
  });

  if (!membership) {
    // Not a member of the org
    throw new AuthorizationError("NOT_A_MEMBER");
  }

  // 4) Check role
  // Ensure membership.role is in allowedRoles
  if (!allowedRoles.includes(membership.role)) {
    // The member exists but doesn't have required privileges
    throw new AuthorizationError("NOT_AUTHORISED");
  }

  // Passed all checks: return membership
  return membership;
}

/**
 * Compatibility alias so existing imports `authGuardOrgAdmin` continue to work.
 * You can stop using the alias and import the Action-named function directly.
 */
export const authGuardOrgAdmin = authGuardOrgAdminAction;

/**
 * Example usage in server actions:
 *
 * // throws if not authenticated or not admin
 * const adminMembership = await authGuardOrgAdminAction(orgId);
 * // adminMembership.user -> user object
 *
 * // or with custom allowed roles:
 * const membership = await authGuardOrgAdminAction(orgId, { allowedRoles: ["OWNER", "SUPER_ADMIN"] });
 *
 * Handle thrown errors upstream to:
 * - redirect to login when message === "AUTH_REQUIRED"
 * - show 404 when message === "ORG_NOT_FOUND" or "ORG_INACTIVE"
 * - show 403 when message === "NOT_AUTHORISED" or "NOT_A_MEMBER"
 */
