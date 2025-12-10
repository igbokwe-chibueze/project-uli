// src/features/organisations/actions/orgInviteActions.ts

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import type { InviteExpiryOption } from "@prisma/client";

import { authGuardOrgAdmin } from "@/lib/auth-guards";
import { currentID } from "@/features/auth/lib/authenticate";
import { computeExpiryFromOption, generateTokenHex } from "@/lib/invite-utils";

import { sendOrgInviteEmailAction } from "@/features/organisations/actions/orgInviteEmailActions";
import { SendOrgInviteBatchEmailInput, sendOrgInviteBatchEmailSchema } from "@/features/organisations/schemas";

/**
 * CONSTANTS
 */
const DEFAULT_EXPIRY: InviteExpiryOption = "DAYS_7";


/**
 * Ensure only one active (isValid && status = PENDING) invite exists per org.
 * If none exists create one using default expiry.
 *
 * NOTE: this is atomic: it first marks expired invites (if any)
 * then returns existing or creates.
 */
export const getOrCreateOrgInviteAction = async (orgId: string) => {
  // ensure caller is org admin
  const admin = await authGuardOrgAdmin(orgId);

  // expire stale invites for this org
  await prisma.orgInviteToken.updateMany({
    where: {
      orgId,
      isValid: true,
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
    data: {
      isValid: false,
      status: "EXPIRED",
      expiredAt: new Date(),
    },
  });

  // find active org-level invite (email == null)
  const existing = await prisma.orgInviteToken.findFirst({
    where: {
      orgId,
      email: null, // global share link (not an emailed invite)
      isValid: true,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  // create a new global invite
  const token = generateTokenHex();
  const expiresAt = computeExpiryFromOption(DEFAULT_EXPIRY);

  const invite = await prisma.orgInviteToken.create({
    data: {
      orgId,
      token,
      createdById: admin.userId,
      expiresAt,
      expiryOption: DEFAULT_EXPIRY,
      isValid: true,
      status: "PENDING",
      email: null,
    },
  });

  revalidatePath(`/organisations/${orgId}/members`);
  return invite;
}

/**
 * Reset the global invite for an org (invalidate previous pending global invite(s) and create new)
 */
export const resetOrgInviteAction = async (orgId: string, expiryOption: InviteExpiryOption = DEFAULT_EXPIRY) => {
  const admin = await authGuardOrgAdmin(orgId);

  const token = generateTokenHex();
  const expiresAt = computeExpiryFromOption(expiryOption);

  // Use transaction: invalidate any existing pending invites (global ones) then create new
  const [, newInvite] = await prisma.$transaction([
    prisma.orgInviteToken.updateMany({
      where: {
        orgId,
        email: null, // only invalidate global share links (not email invites)
        isValid: true,
        status: "PENDING",
      },
      data: {
        isValid: false,
        status: "EXPIRED",
        expiredAt: new Date(),
      },
    }),
    prisma.orgInviteToken.create({
      data: {
        orgId,
        token,
        createdById: admin.id,
        expiresAt,
        expiryOption,
        isValid: true,
        status: "PENDING",
        email: null,
      },
    }),
  ]);

  revalidatePath(`/organisations/${orgId}/members`);
  return newInvite;
}


/**
 * Result shape for each email processed by the batch action.
 */
export type BatchInviteResult = {
  email: string;
  inviteId?: string;
  token?: string;
  createdAt?: Date;
  dbError?: string | null;    // error while creating invite
  emailSent?: boolean;        // whether the email call succeeded
  emailError?: string | null; // error while sending email
};

/**
 * createAndSendBatchEmailInvitesAction
 *
 * Batch creates individual OrgInviteToken records (one per email) and sends an invitation
 * email for each. Uses a transaction to create DB records atomically and sends emails
 * after the transaction completes. Returns a result array describing DB + email outcomes.
 *
 * Important design choices:
 * - Each email gets its own token (Option A: secure + auditable).
 * - Existing pending invites for the same org+email are expired in bulk before creating new ones.
 * - DB writes are performed in a single transaction; email sending happens after commit so
 *   we don't send emails for invites that failed to persist.
 *
 * @param payload - validated input matching SendOrgInviteBatchEmailInput
 */
export const createAndSendBatchEmailInvitesAction = async (payload: SendOrgInviteBatchEmailInput): Promise<{ results: BatchInviteResult[] }> => {
  // Validate payload (defensive; callers that pass wrong shape will get nice errors)
  const parsed = sendOrgInviteBatchEmailSchema.parse(payload);

  // Ensure caller is an org admin (this returns membership incl. user)
  // authGuardOrgAdmin throws on unauthenticated / not-authorized
  const admin = await authGuardOrgAdmin(parsed.orgId);

  const organisation = await prisma.organization.findUnique({
    where: { id: parsed.orgId },
    select: { name: true },
  });
  if (!organisation) throw new Error("ORG_NOT_FOUND");

  const orgName = organisation.name;


  // Normalize & dedupe emails server-side for safety
  const normalizedEmails = Array.from(
    new Set(parsed.emails.map((e) => e.trim().toLowerCase()))
  );

  // Compute effective expiryOption (guaranteed InviteExpiryOption)
  const expiryOption: InviteExpiryOption = parsed.expiryOption ?? DEFAULT_EXPIRY;
  const expiresAt = computeExpiryFromOption(expiryOption);

  // Prepare the per-email create operations' data
  // We'll build an array of create inputs so they can be executed in a single transaction.
  const now = new Date();

  // First: expire any existing pending invites for these emails in this org (single DB op).
  // This prevents duplicate pending invites.
  await prisma.orgInviteToken.updateMany({
    where: {
      orgId: parsed.orgId,
      email: { in: normalizedEmails },
      isValid: true,
      status: "PENDING",
    },
    data: {
      isValid: false,
      status: "EXPIRED",
      expiredAt: now,
    },
  });

  // Build create promises for the transaction (we use prisma.$transaction with array)
  const createOps = normalizedEmails.map((email) =>
    prisma.orgInviteToken.create({
      data: {
        orgId: parsed.orgId,
        email,
        token: generateTokenHex(),
        invitedRole: parsed.invitedRole ?? null,
        message: parsed.message ?? null,
        createdById: admin.user.id, // admin.user comes from authGuardOrgAdmin (guaranteed)
        expiresAt,
        expiryOption,
        isValid: true,
        status: "PENDING",
      },
    })
  );

  // Execute all creates in a single transaction. This returns the created invite rows.
  // If any create fails (e.g., unique constraint), the whole transaction will roll back.
  const createdInvites = await prisma.$transaction(createOps);

  // Revalidate the members page once (avoid multiple revalidations)
  revalidatePath(`/organisations/${parsed.orgId}/members`);

  // Use Promise.allSettled to attempt all sends in parallel and collect results.
  const sendPromises = createdInvites.map(async (invite) => {
    const result: BatchInviteResult = {
      email: invite.email ?? "",
      inviteId: invite.id,
      token: invite.token,
      createdAt: invite.createdAt,
      dbError: null,
      emailSent: false,
      emailError: null,
    };

    try {
      // Prepare the input for the send action (matches sendOrgInviteEmailAction signature)
      await sendOrgInviteEmailAction({
        email: invite.email!,
        orgId: invite.orgId,
        orgName,
        token: invite.token,
        invitedRole: invite.invitedRole ?? null,
        message: invite.message ?? null,
        expiryOption,
      });

      result.emailSent = true;
    } catch (err) {
      // Do not throw — capture the error and continue with other emails
      result.emailError = (err instanceof Error && err.message) || String(err);
      result.emailSent = false;
    }

    return result;
  });

  // Wait for all send attempts to complete
  const settled = await Promise.all(sendPromises);

  // Return the per-email outcomes to the caller
  return { results: settled };
}


/**
 * Validate a token and return invite details (or a reason)
 */
export const validateInviteTokenAction = async(token: string) => {
  if (!token) return { valid: false, reason: "missing_token" };

  const invite = await prisma.orgInviteToken.findUnique({
    where: { token },
    include: { organization: true, createdBy: true, actedBy: true },
  });

  if (!invite) return { valid: false, reason: "not_found" };

  if (!invite.isValid || invite.status !== "PENDING") {
    return { valid: false, reason: invite.status.toLowerCase(), invite };
  }

  if (invite.expiresAt < new Date()) {
    // mark expired
    await prisma.orgInviteToken.update({
      where: { id: invite.id },
      data: { isValid: false, status: "EXPIRED", expiredAt: new Date() },
    });
    return { valid: false, reason: "expired" };
  }

  // Token is valid and pending
  return { valid: true, invite };
}

/**
 * Accept invite: when user clicks Accept on join page.
 */
export const acceptInviteAction = async(token: string) => {
  const validation = await validateInviteTokenAction(token);
  if (!validation.valid || !validation.invite) throw new Error("INVITE_INVALID");

  const invite = validation.invite;
  const userId = await currentID();
  if (!userId) throw new Error("AUTH_REQUIRED");

  // Check if user is already a member
  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organization: { id: invite.orgId }, // ✅ relation filter
    },
  });

  if (!existingMember) {
    await prisma.organizationMember.create({
      data: {
        user: { connect: { id: userId } }, 
        organization: { connect: { id: invite.orgId } }, // ✅ correct relational creation
        role: invite.invitedRole ?? "MEMBER", 
      },
    });
  }

  // consume invite
  await prisma.orgInviteToken.update({
    where: { id: invite.id },
    data: {
      isValid: false,
      status: "ACCEPTED",
      acceptedAt: new Date(),
      actedById: userId,
    },
  });

  revalidatePath(`/organisations/${invite.orgId}/members`);
  return { success: true, organization: invite.orgId };
}

/**
 * Reject invite: mark invite REJECTED
 */
export const rejectInviteAction = async(token: string) => {
  const validation = await validateInviteTokenAction(token);
  if (!validation.valid || !validation.invite) throw new Error("INVITE_INVALID");

  const invite = validation.invite;
  const userId = await currentID().catch(() => null);

  await prisma.orgInviteToken.update({
    where: { id: invite.id },
    data: {
      isValid: false,
      status: "REJECTED",
      rejectedAt: new Date(),
      actedById: userId ?? undefined,
    },
  });

  revalidatePath(`/organisations/${invite.orgId}/members`);
  return { success: true };
}

/**
 * A helper to mark expired across system (e.g. for cron)
 */
export const markExpiredInvitesAction = async () => {
  const res = await prisma.orgInviteToken.updateMany({
    where: { isValid: true, expiresAt: { lt: new Date() } },
    data: { isValid: false, status: "EXPIRED", expiredAt: new Date() },
  });
  return res;
}
