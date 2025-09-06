// src/features/auth/components/register-form.tsx
"use client"

import { useForm } from "react-hook-form";
import { useEffect, useState, useTransition } from "react";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSignIcon, CheckCircleIcon, EyeIcon, EyeOffIcon, LoaderCircleIcon, MailIcon, UserIcon, VenusAndMarsIcon } from "lucide-react";

import { Gender } from "@prisma/client";

import { useDebounce } from "@/hooks/use-debounce";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { RegisterSchema } from "@/features/auth/schemas";
import { CardWrapper } from "@/features/auth/components/card-wrapper";
import { checkUsername } from "@/features/auth/actions/check-username";
import { registerAction } from "@/features/auth/actions/register-action";


import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { SelectPopover } from "@/components/select-popover";
import { DevVerificationModal } from "@/components/dev-verification-modal";
import { PasswordInput } from "@/components/password-input";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Create the options array from the Gender enum
  const genderOptions = [
    { value: Gender.MALE, label: "Male" },
    { value: Gender.FEMALE, label: "Female" },
    { value: Gender.PREFER_NOT_TO_SAY, label: "Prefer not to say" },
  ];

  //Using this to display tokens in dev mode.
  const [devLink, setDevLink] = useState<string | null>(null);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      registerAction(values)
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

  const usernameValue = form.watch("username");
  const debouncedUsername = useDebounce(usernameValue, 500);

  useEffect(() => {
    const check = async () => {
      if (!debouncedUsername) {
        setUsernameStatus(null);
        return;
      }
      setChecking(true);
      const res = await checkUsername(debouncedUsername);
      setChecking(false);

      if (!res.available) {
        form.setError("username", { message: res.message });
        setUsernameStatus("taken");
      } else {
        form.clearErrors("username");
        setUsernameStatus("available");
      }
    };

    check();
  }, [debouncedUsername, form]);

  return (
    <>
      {/* Dev-only modal using ResponsiveModal */}
      <DevVerificationModal
        link={devLink}
        onClose={() => {
          setDevLink(null);
        }}
      />

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
              {/* ── First Name ──────────────────────────────────────────────── */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">FirstName</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="Enter your first name here"
                          type="text"
                          autoComplete="firstName"
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

              {/* ── Last Name ──────────────────────────────────────────────── */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">Surname</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="Enter your surname here"
                          type="text"
                          autoComplete="lastName"
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

              {/* ── Email ───────────────────────────────────────────────────── */}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">Email</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ── Username ──────────────────────────────────────────────── */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Enter your username here"
                            type="text"
                            autoComplete="username"
                            className="pl-10"
                            disabled={isPending}
                          />
                          {checking && (
                            <LoaderCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                          )}
                          {/* show check icon when valid */}
                          {!fieldState.invalid && field.value && (
                            <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-500" />
                          )}
                          {!checking && usernameStatus === "available" && !fieldState.invalid && field.value && (
                            <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-500" />
                          )}
                        </div>
                      </FormControl>

                      {/* ⚠️ Fixed Height for error message */}
                      <div className="h-5 overflow-auto">
                        <FormMessage className="text-left" />
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* ── Gender ───────────────────────────────────────────────────── */}
                <SelectPopover
                  control={form.control}
                  name="gender"
                  label="Gender"
                  required
                  placeholder="Select a gender"
                  options={genderOptions}
                  icon={<VenusAndMarsIcon/>}
                />
              </div>


              {/* ── Password ───────────────────────────────────────────────────── */}
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  </FormItem>
                )}
              />

              {/* ── Confirm Password ───────────────────────────────────────────────────── */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">Confirm Password</FormLabel>
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