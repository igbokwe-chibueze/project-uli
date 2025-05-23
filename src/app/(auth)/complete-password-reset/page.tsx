// src/app/(auth)/complete-password-reset/page.tsx

import { CompletePasswordResetForm } from "@/features/auth/components/complete-password-reset-form"


const CompletePasswordResetPage = () => {
  return (
    <div className=" flex flex-col justify-center items-center gap-4 ">
        <CompletePasswordResetForm />
    </div>
  )
}

export default CompletePasswordResetPage