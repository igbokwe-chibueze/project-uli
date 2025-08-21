// src/components/dev-verification-modal.tsx

"use client";

import Link from "next/link";
import { useState } from "react";

import { CheckIcon, CopyIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CardWrapper } from "@/features/auth/components/card-wrapper";

// ✅ Reusable Dev Verification Modal Component
// -----------------------------------------------------------------------------
/**
 * DevVerificationModal
 * -----------------------------------------------------------------------------
 * A reusable modal for showing a developer-only verification link
 * during registration or email confirmation flows.
 *
 * Props:
 * - link: string | null
 *      → The verification URL to display. If null, modal stays closed.
 * - onClose: () => void
 *      → Callback when modal is dismissed (sets link to null).
 *
 * Features:
 * - Displays a non-editable input field with the verification URL.
 * - Includes a copy-to-clipboard button with visual feedback.
 * - Offers "Close" and "Continue" actions.
 * - "Continue" opens the link in a new tab.
 *
 * -----------------------------------------------------------------------------
 * Example Usage:
 *
 * const [devLink, setDevLink] = useState<string | null>(null);
 *
 * <DevVerificationModal
 *   link={devLink}
 *   onClose={() => setDevLink(null)}
 * />
 */

interface DevVerificationModalProps {
    link: string | null;
    email?: string | null;
    onClose: () => void;
}

export const DevVerificationModal = ({link, email, onClose}: DevVerificationModalProps) => {

    const [copied, setCopied] = useState(false);
    const [isPending, setIsPending] = useState(false);

    // ✅ Handle copy-to-clipboard
    const handleCopy = async () => {
        if (!link) return;

        try {
            setIsPending(true);
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // reset feedback after 2s
        } finally {
            setIsPending(false);
        }
    };
  return (
    <ResponsiveModal
      open={!!link}
      onOpenChange={(open) => !open && onClose()}
      title=""
      description=""
    >
      <CardWrapper
        headerHeading="Email Verification"
        className="lg:w-[620px]"
      >
        {email && (
            <p className="text-sm text-muted-foreground">
                Confirm your new email: <span className="font-medium">{email}</span>
            </p>
        )}

        {/* Verification link + copy button */}
        <div className="flex items-center gap-x-2">
          <Input disabled value={link ?? ""} />
          <Button
            onClick={handleCopy}
            variant="secondary"
            className="size-12"
            type="button"
            disabled={isPending}
          >
            {copied ? (
              <CheckIcon className="size-5 text-green-500" />
            ) : (
              <CopyIcon className="size-5" />
            )}
          </Button>
        </div>

        {/* Footer actions */}
        <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          {link && (
            <Button asChild>
              <Link href={link} target="_blank" rel="noopener noreferrer">
                Continue
              </Link>
            </Button>
          )}
        </div>
      </CardWrapper>
    </ResponsiveModal>
  )
}
