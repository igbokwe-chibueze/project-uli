// src/features/organisations/actions/orgInviteEmailActions.ts

"use server";

import { Resend } from "resend";
import { formatInviteExpiry } from "@/lib/invite-utils";
import { InviteExpiryOption, OrgRole } from "@prisma/client";
import { createEmailTemplate } from "@/features/auth/lib/email-templates";

interface SendOrgInviteEmailInput {
  email: string;
  orgName: string;
  orgId: string;
  token: string;
  invitedRole?: OrgRole | null, 
  message?: string | null
  expiryOption: InviteExpiryOption
}

// Create a new instance of Resend using the API key stored in environment variables.
// This key should be securely set (e.g., in .env.local) and prefixed with NEXT_PUBLIC_ if needed.
const resend = new Resend(process.env.RESEND_API_KEY);

// Retrieve the application domain from environment variables.
// This should be set to your production URL (or localhost during development).
const domain = process.env.NEXT_PUBLIC_APP_URL;

// Just using this to skip sending email when i am testing.
const isDev = true;

export const sendOrgInviteEmailAction = async (input: SendOrgInviteEmailInput) => {
    const { email, orgName, orgId, token, invitedRole, message, expiryOption } = input;

    const inviteUrl = `${domain}/organisations/${orgId}/join/${token}`;

    const expiryText = formatInviteExpiry(expiryOption);
    const roleText = invitedRole ? `Role: ${invitedRole}` : `Role: MEMBER (default)`;

    // In dev: skip Resend and return the payload outright
    if (isDev) {
        console.log(`Invite sent to ${email}`)
        console.log(`Invitation to join ${orgName} as ${roleText}, This invite expires in ${expiryText}`)
        if (message) {
            console.log(`Invitation: ${message}`)
        }
        return { status: "sent" }
    }

    // In production: actually send
    // Generate email HTML using the reusable template function.
    const htmlContent = createEmailTemplate({
        title: `Invitation to join ${orgName} as ${roleText}`,
        message: `<p>Message from inviter: ${message}`,
        buttonText: "Click here to access the invite",
        buttonLink: inviteUrl,
        footer: `If you did not expect this email, you can safely ignore it. This invite expires in ${expiryOption}`,
    });

    // Send the verification email using Resend's email sending service.
    await resend.emails.send({
        from: "onboarding@resend.dev", // The sender email address.
        to: email,                     // The recipient email.
        subject: "You've been invited to join an organization", // Email subject.
        // HTML body with a link that the user can click.
        html: htmlContent,
    });
}
