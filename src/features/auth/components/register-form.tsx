// src/features/auth/components/register-form.tsx
"use client"

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, LoaderCircleIcon, MailIcon, UserIcon } from "lucide-react";

import { RegisterSchema } from "@/features/auth/schemas";
import { register } from "@/features/auth/actions/register";
import { CardWrapper } from "@/features/auth/components/card-wrapper";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { ResponsiveModal } from "@/components/responsive-modal";
import Link from "next/link";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  //Using this to display tokens in dev mode.
  const [devLink, setDevLink] = useState<string | null>(null);
  // Track copy feedback
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      register(values)
        .then((res) => {
          //I used this before i was doing the dev or prod environment check
          // setError(res.error);
          // setSuccess(res.success);

          if ("confirmLink" in res) {
            setDevLink(res.confirmLink!);
            return;
          }
          if (res.error) setError(res.error);
          else setSuccess(res.success);
        })
        .catch((err) => {
          setError(err.message);
        });
    });
  };

  // Handle copy action
  const handleCopy = () => {
    if (!devLink) return;
    navigator.clipboard.writeText(devLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>

      {/* Dev-only modal using ResponsiveModal */}
      <ResponsiveModal
        open={!!devLink}
        onOpenChange={(open) => !open && setDevLink(null)}
        title="Dev Verification Link"
        description="URL to verify your email"
      >
        <CardWrapper
          headerHeading="Registration Verification"
          className="lg:w-[620px]"
        >
          <div className="flex items-center gap-x-2">
            <Input disabled value={devLink!}/>
            <Button
              onClick={handleCopy}
              variant={"secondary"}
              className="size-12"
              type="button"
              disabled={isPending}
            >
              {copied ? <CheckIcon className="size-5 text-green-500" /> : <CopyIcon className="size-5" />}
            </Button>
          </div>

          <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
            <Button variant="outline" onClick={() => setDevLink(null)}>
              Close
            </Button>

            <Button asChild>
              <Link href={devLink!} target="_blank" rel="noopener noreferrer">
                Continue
              </Link>
            </Button>
          </div>
        </CardWrapper>
      </ResponsiveModal>

      <CardWrapper
        headerHeading="Create an account"
        headerLabel="Enter your details below to create your account"
        backButtonLabel="Already have an account?"
        backButtonHref="/access"
        showSocial
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="Enter your name"
                          type="text"
                          autoComplete="name"
                          className="pl-10"
                          disabled={isPending}
                        />
                        {/* show check icon when valid */}
                        {!fieldState.invalid && field.value && (
                          <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-left"/>
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="Enter your email"
                          type="email"
                          autoComplete="email"
                          className="pl-10"
                          disabled={isPending}
                        />
                        {/* show check icon when valid */}
                        {!fieldState.invalid && field.value && (
                          <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-left"/>
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          disabled={isPending}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOffIcon />
                        ) : (
                          <EyeIcon />
                        )}
                      </Button>
                    </div>
                    <FormDescription
                      className={`text-left ${!fieldState.invalid && field.value ? "text-green-500" : ""}`}
                    >
                      At least 6 characters
                    </FormDescription>
                    <FormMessage className="text-left"/>
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Confirm your password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          disabled={isPending}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOffIcon />
                        ) : (
                          <EyeIcon />
                        )}
                      </Button>
                    </div>
                    <FormMessage className="text-left"/>
                  </FormItem>
                )}
              />
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />

            <Button type="submit" className="w-full buttons" disabled={isPending}>
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  <span>Registering</span>
                </div>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </>
  )
}