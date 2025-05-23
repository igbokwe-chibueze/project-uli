// src/app/(auth)/email-verification/page.tsx

import { EmailVerificationForm } from "@/features/auth/components/email-verification-form"

const EmailVerificationPage = () => {
  return (
    <div className=" flex justify-center items-center ">
      <EmailVerificationForm/>
    </div>
  )
}

export default EmailVerificationPage