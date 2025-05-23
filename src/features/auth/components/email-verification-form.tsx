// src/features/auth/components/email-verification-form.tsx
"use client"

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BeatLoader } from "react-spinners"

import { FormSuccess } from "@/components/form-success"
import { FormError } from "@/components/form-error"
import { CardWrapper } from "@/features/auth/components/card-wrapper"
import { emailVerificationAction } from "@/features/auth/actions/email-verification-action";

export const EmailVerificationForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) return;       

        if (!token) {
            setError("Invalid credentials*4of5!");
            return;
        }
        
        emailVerificationAction(token)
            .then((res) => {
                setSuccess(res.success);
                setError(res.error);
            })
            .catch((err) => {
                setError(err.message);
            });

    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    if (!token) {
        return null;
    }
  return (
    <CardWrapper
        headerHeading="Email Verification"
        headerLabel="Confirming your verification"
        backButtonLabel="Back to login"
        backButtonHref="/access"
    >
        <div className="w-full flex flex-col items-center justify-center">
            { !success && !error && (
                <BeatLoader/>
            )}

            <FormSuccess message={success}/>
            {!success && (
                <FormError message={error}/>
            )}
        </div>
    </CardWrapper>
  )
}
