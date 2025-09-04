// src/components/confirm-password-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveModal } from "@/components/responsive-modal";
import { CardWrapper } from "@/features/auth/components/card-wrapper";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface ConfirmPasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (password: string) => void;
    loading?: boolean;
}

export function ConfirmPasswordModal({
    open,
    onOpenChange,
    onConfirm,
    loading,
}: ConfirmPasswordModalProps) {

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleConfirm = () => {
        onConfirm(password); // pass password up
        setPassword(""); // reset after confirm
        setShowPassword(false); // reset visibility toggle
    };

  return (
    <ResponsiveModal
        open={open}
        onOpenChange={(val) => {
            if (!val) {
            setPassword(""); // reset on close
            setShowPassword(false);
            }
            onOpenChange(val);
        }}
        title=""
        description=""
    >

        <CardWrapper
            headerHeading="Confirm Password"
            headerLabel="Please enter your password to confirm account deletion."
            className="lg:w-[620px]"
        >
            <div className="flex flex-col gap-2">
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={loading}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                        disabled={loading}
                    >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={loading || !password}
                    >
                        {loading ? "Verifying..." : "Confirm"}
                    </Button>
                </div>
            </div>
        </CardWrapper>
    </ResponsiveModal>
  );
}
