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
    value: string | null;                // the string to display (URL or code)
    email?: string | null;
    onClose: () => void;
    headerHeading?: string;
}

export const DevVerificationModal = ({
  value,
  email, 
  onClose,
  headerHeading = "Email Verification", // default value
}: DevVerificationModalProps) => {

  const [copied, setCopied] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Detect if value looks like a URL
  const isLink = value?.startsWith("http");

  // ✅ Handle copy-to-clipboard
  const handleCopy = async () => {
    if (!value) return;

    try {
      setIsPending(true);
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset feedback after 2s
    } finally {
      setIsPending(false);
    }
  };
  return (
    <ResponsiveModal
      open={!!value}
      onOpenChange={(open) => !open && onClose()}
      title=""
      description=""
    >
      <CardWrapper
        headerHeading={headerHeading}
        className="lg:w-[620px]"
      >
        {email && (
            <p className="text-sm text-muted-foreground">
                Confirm your email: <span className="font-medium">{email}</span>
            </p>
        )}

        {/* Verification value + copy button */}
        <div className="flex items-center gap-x-2">
          <Input disabled value={value ?? ""} />
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

          {/* Only show Continue if this is a URL */}
          {isLink && (
            <Button asChild>
              <Link href={value!} target="_blank" rel="noopener noreferrer">
                Continue
              </Link>
            </Button>
          )}
        </div>
      </CardWrapper>
    </ResponsiveModal>
  )
}
