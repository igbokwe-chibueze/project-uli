// src/features/auth/components/login-form.tsx
"use client"

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { LoginSchema } from "@/features/auth/schemas";
import { loginAction } from "@/features/auth/actions/login-action";
import { CardWrapper } from "@/features/auth/components/card-wrapper";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { CountdownTimer } from "./countdown-timer";

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
    ? "Email already in use with different provider"
    : ""
  
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      loginAction(values, callbackUrl)
        .then((res) => {
          if (res?.error) {
            if (res.error === "Code has expired!") {
              // Code expired: reset view to email/password inputs
              setShowTwoFactor(false);
              form.reset(); // Reset all fields for a fresh start
            } else if (res.error.includes("Invalid code")) {
              // For invalid code errors (mismatch or token missing): clear only the code field
              form.setValue("code", "");
            } else {
              // Handle other errors by resetting the two-factor mode
              setShowTwoFactor(false);
              form.reset();
            }
            setError(res.error);
          }

          if (res?.success) {
            form.reset();
            setSuccess(res.success);
          }

          // If the response indicates that two-factor is required:
          if (res?.twoFactor) {
            // Enable two-factor authentication view.
            setShowTwoFactor(true);
          }
        })
        .catch((err) => {
          // If the error is a redirect, do nothing or handle it as necessary.
          if (err.message === "NEXT_REDIRECT") {
            return;
          }
          setError(err.message);
        })
    });
  }

  // Function to call when the timer expires
  const handleExpire = () => {
    // Mimic what happens when the token code expires
    setShowTwoFactor(false);
    form.reset(); // reset the fields
    setError("Code has expired!");
  };
  return (
    <CardWrapper 
      headerHeading="Login"
      headerLabel="Welcome Back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/registration"
      // Only show socials when not in 2FA mode
      showSocial={!showTwoFactor}
    >
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Form Fields */}
          <div className="space-y-4">
            {showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Two Factor Code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the code sent to your you.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Render the countdown timer with an initial value of 300 seconds (5 minutes) */}
                <CountdownTimer initialTime={300} onExpire={handleExpire} />
              </>
            )}

            {!showTwoFactor && (
              <>
                {/* Email */}
                <FormField 
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Enter your email"
                          type="email"
                          autoComplete="email"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField 
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="******"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            disabled={isPending}
                          />
                        </FormControl>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute inset-y-0 right-0 flex items-center text-muted-foreground"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="px-0 flex justify-start font-normal"
                      >
                        <Link href="/auth/reset-password">
                          Forgot Password?
                        </Link>
                      </Button>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          <FormError message={error || urlError}/>
          <FormSuccess message={success}/>

          <Button
            type="submit"
            className="w-full buttons"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <span className="size-4 border-2 border-t-transparent border-solid rounded-full animate-spin" />
                <span>{showTwoFactor ? "Confirming" : "Logging in"}</span>
              </div>
            ) : (
              showTwoFactor ? "Confirm" : "Login"
            )}
          </Button>
        </form>
      </Form>

    </CardWrapper>
  )
}
