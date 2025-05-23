// src/app/(auth)/initiate-password-reset/page.tsx

import { InitiatePasswordResetForm } from "@/features/auth/components/initiate-password-reset-form"

const InitiatePasswordResetPage = () => {
  return (
    <div className=" flex flex-col justify-center items-center gap-4 ">
        <InitiatePasswordResetForm />
    </div>
  )
}

export default InitiatePasswordResetPage
