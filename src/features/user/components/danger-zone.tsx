// src/features/user/components/danger-zone.tsx
"use client"

import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useConfirm } from "@/hooks/use-confirm";

import { toast } from "sonner";
import { LoaderCircleIcon, PowerIcon, PowerOffIcon, Trash2Icon } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { updateUserAction } from "@/features/user/actions/updateUserAction";
import { deleteUserAction } from "@/features/user/actions/deleteUserAction";
import { signOut } from "next-auth/react";


interface DangerZoneProps {
    initialData: User
}

const DangerZone = ({initialData}: DangerZoneProps) => {
    const router = useRouter();
    const { id: userId, isActive: initialIsActive } = initialData;

    const [isPending, startTransition] = useTransition();
    // Specific for activate/deactivate
    const [isActivatingDeactivating, setIsActivatingDeactivating] = useState(false);
    // Specific for delete
    const [isDeleting, setIsDeleting] = useState(false);

{/* ───────────────── Deactivation/Reactivation ──────────────────────────────────────── */}
    // For activation success/error message
    const [activationError, setActivationError] = useState<string | undefined>("");
    const [activationSuccess, setActivationSuccess] = useState<string | undefined>("");
    
    const [ActivationDialog, confirmActivation] = useConfirm(
        "Reactivate Account",
        "Reactivating this account would make it become visible and usable again."
    )

    const [DeactivationDialog, confirmDeactivation] = useConfirm(
        "Deactivate Account",
        "Are you absolutely sure you want to deactivate this account? This will prevent users from seeing or interacting with you."
    )

    // Handler for deactivation/reactivation action
    const handleAccountActivationStatusChange = async () => {
        setActivationError(""); // Clear previous errors
        setActivationSuccess(""); // Clear previous success

        // Trigger the dialog
        if (initialIsActive) {
            const ok = await confirmDeactivation();
            // User cancelled
            if (!ok) return;
        } else {
            const ok = await confirmActivation();
            // User cancelled
            if (!ok) return;
        }

        setIsActivatingDeactivating(true); // Start activate/deactivate loading state

        startTransition(async () => {
            try {
                const newIsActiveStatus = !initialIsActive; // Toggle the status
                const res = await updateUserAction(userId, { isActive: newIsActiveStatus });

                if (res.error) {
                    setActivationError(res.error);
                    toast.error(`Failed to ${newIsActiveStatus ? 'reactivate' : 'deactivate'} account`, { description: res.error });
                } else {
                    setActivationSuccess(`Account ${newIsActiveStatus ? 'reactivated' : 'deactivated'} successfully!`);
                    toast.success(`Account ${newIsActiveStatus ? 'Reactivated' : 'Deactivated'}`, {
                        description: `"${initialData.firstName}" is now ${newIsActiveStatus ? 'active' : 'inactive'}.`,
                    });
                    router.refresh(); // Revalidate data to show updated status
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Something went wrong";
                setActivationError(msg);
                toast.error("Error", { description: msg });
            } finally {
                setIsActivatingDeactivating(false); // End activate/deactivate loading state
            }
        });
    };

{/* ───────────────── Deleting ──────────────────────────────────────── */}
    // For delete success/error message
    const [deleteError, setDeleteError] = useState<string | undefined>("");
    const [deleteSuccess, setDeleteSuccess] = useState<string | undefined>("");

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Organisation",
        "Are you absolutely sure you want to delete this organisation? This action cannot be undone.",
        "destructive"
    )

    const handleDelete = async () => {
        const ok = await confirmDelete(); // Trigger the dialog
        if (!ok) return; // User cancelled

        setIsDeleting(true); // Start deleting loading state

        startTransition(async () => {
            setDeleteError("");
            setDeleteSuccess(""); // Clear previous messages

            const result = await deleteUserAction(userId);
            if (result?.error) {
                setDeleteError(result.error);
                toast.error("Delete Failed", { description: result.error });
            } else {
                setDeleteSuccess("Account deleted successfully. Redirecting...");
                toast.success("Account deleted successfully.", {
                    description: `"${initialData.firstName}" has been deleted.`,
                });
                // Force clear NextAuth session and redirect to home
                await signOut({ callbackUrl: "/" });
            }
            setIsDeleting(false); // End deleting loading state
        });
    };

  return (
    <div className="space-y-4">
        <FormError message={deleteError || activationError} />
        <div className={isPending || isDeleting || isActivatingDeactivating ? "opacity-50" : "opacity-100 transition-opacity"}>
            <FormSuccess message={deleteSuccess || activationSuccess} />
        </div>

        <DeleteDialog/>
        <DeactivationDialog/>
        <ActivationDialog/>

        {/* ─────────────────────────────────────────────────────────────────── */}
            {/* ── Deactivate/Reactivate Button Account Zone ─────────────────────────────────────── */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div 
            className=" flex flex-row items-center justify-between
            disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-input/30 border-destructive h-20 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs outline-none"
        >
            <div className="space-y-0.5">
                <Label className="text-destructive">Deactivate Account</Label>
                <p className="text-muted-foreground text-sm">Temporarily disable your account</p>
            </div>

            <Button 
                type="button"
                onClick={handleAccountActivationStatusChange}
                disabled={isPending || isActivatingDeactivating || isDeleting}
                variant={initialIsActive ? "destructive" : "default"} // Change variant based on status
                className="flex items-center gap-2"
            >
                {isActivatingDeactivating ? (
                    <>
                        <LoaderCircleIcon className="size-4 mr-2 animate-spin" />
                        <span>{initialIsActive ? "Deactivating..." : "Reactivating..."}</span>
                    </>
                ) : (
                    <>
                        {initialIsActive ?(
                            <>
                                <PowerOffIcon className="size-4 mr-2" />
                                <span>Deactivate Account</span>
                            </>
                        ) : (
                            <>
                                <PowerIcon className="size-4 mr-2" />
                                <span>Reactivate Account</span>
                            </>
                        )}
                    </>
                )}
            </Button>
        </div>


        {/* ─────────────────────────────────────────────────────────────────── */}
            {/* ── Delete Account Zone ─────────────────────────────────────── */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div 
            className=" flex flex-row items-center justify-between
            disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-input/30 border-destructive h-20 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs outline-none"
        >
            <div className="space-y-0.5">
                <Label className="text-destructive">Delete Account</Label>
                <p className="text-muted-foreground text-sm">Permanently delete your account and all data</p>
            </div>

            <Button
                variant="destructive"
                type="button"
                onClick={handleDelete}
                disabled={isPending || isActivatingDeactivating || isDeleting}
            >
                {isDeleting ? (
                    <>
                        <LoaderCircleIcon className="size-4 mr-2 animate-spin" />
                        <span>Deleting...</span>
                    </>
                ) : (
                    <>
                        <Trash2Icon className="size-4 mr-2" />
                        <span>Delete Account</span>
                    </>
                )}
            </Button>
        </div>
    </div>
  )
}

export default DangerZone