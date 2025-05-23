// src/app/(auth)/login/page.tsx

import ClientToast from "@/components/client-toast";
import { LoginForm } from "@/features/auth/components/login-form";
import { ShieldBanIcon } from "lucide-react";
import Link from "next/link";

type AccessPageProps = {
  searchParams: Promise<{
    message?: string | string[];
  }>;
};

const AccessPage = async ({ searchParams }: AccessPageProps) => {
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

      <LoginForm />

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking register, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

export default AccessPage