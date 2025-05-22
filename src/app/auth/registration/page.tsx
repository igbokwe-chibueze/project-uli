// src/app/auth/registration/page.tsx

import Link from "next/link"
import { ShieldBanIcon } from "lucide-react"
import { RegisterForm } from "@/features/auth/components/register-form"

const RegistrationPage = () => {
  return (
    <div className=" min-h-screen ">
        <div className="max-w-screen-xl mx-auto flex flex-col justify-center items-center 
            space-y-4 px-4 lg:px-12 py-8 lg:py-16"
        >
            <Link href="/" className="flex items-center gap-2 self-center font-medium">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <ShieldBanIcon className="size-6" />
                </div>
                Project-Uli.
            </Link>

            <RegisterForm/>

            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By clicking register, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    </div>
  )
}

export default RegistrationPage