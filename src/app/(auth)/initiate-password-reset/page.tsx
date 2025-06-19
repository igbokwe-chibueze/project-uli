// src/app/(auth)/initiate-password-reset/page.tsx

import Link from "next/link";
import { ShieldBanIcon } from "lucide-react";

import ClientToast from "@/components/client-toast";
import { InitiatePasswordResetForm } from "@/features/auth/components/initiate-password-reset-form"

type InitiatePasswordResetPageProps = {
  searchParams: Promise<{
    message?: string | string[];
  }>;
};

const InitiatePasswordResetPage = async ({ searchParams }: InitiatePasswordResetPageProps) => {
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams.message;
  return (
    <div className=" flex flex-col justify-center items-center gap-4 ">
      {message && <ClientToast message={message} />}
      <Link href="/" className="flex items-center gap-2 self-center font-medium">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldBanIcon className="size-6" />
        </div>
        Project-Uli.
      </Link>

      <InitiatePasswordResetForm />

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By continuing, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

export default InitiatePasswordResetPage
