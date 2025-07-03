// src/hooks/use-confirm.tsx

// A custom React hook providing a confirmation dialog with a modal
import { ComponentProps, JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import { 
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
 } from "@/components/ui/card";

// Extract the props type for Button component to allow customizing the confirm button
type ButtonProps = ComponentProps<typeof Button>;

/**
 * useConfirm hook
 * @param title - The title displayed in the confirmation dialog header
 * @param message - The description/message displayed in the dialog body
 * @param variant - (Optional) Button variant for the confirm action (defaults to "primary")
 * @returns [ConfirmationDialog, confirm]
 *   - ConfirmationDialog: A React component to render the modal when active
 *   - confirm: A function that returns a Promise<boolean> resolving to true if confirmed, false otherwise
 */
export const useConfirm = (
    title: string,
    message: string,
    variant: ButtonProps["variant"] = "default",
): [() => JSX.Element, () => Promise<unknown>] => {
    // Local state to hold the pending promise resolver when dialog is open
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

    /**
     * confirm() triggers the display of the confirmation dialog and
     * returns a Promise that resolves based on user action.
     */
    const confirm = () => {
        return new Promise<boolean>((resolve) => {
            // Store the resolver for later use in handlers
            setPromise({ resolve });
        });
    };

    /**
     * handleClose() resets the modal state, closing the dialog
     */
    const handleClose = () => {
        setPromise(null);
    };

    /**
     * handleConfirm() resolves the promise with `true` and closes the dialog
     */
    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    };

    /**
     * handleCancel() resolves the promise with `false` and closes the dialog
     */
    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    };

    /**
     * ConfirmationDialog component to render modal UI when open
     */
    const ConfirmationDialog = () => (
        <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="pt-8">
                    <CardHeader className="pt-0">
                        {/* Dialog title */}
                        <CardTitle>{title}</CardTitle>
                        {/* Dialog message/description */}
                        <CardDescription>{message}</CardDescription>
                    </CardHeader>

                    {/* Button group: Cancel and Confirm */}
                    <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="w-full lg:w-auto"
                        >
                            Cancel
                        </Button>

                        <Button
                            variant={variant}
                            onClick={handleConfirm}
                            className="w-full lg:w-auto"
                        >
                            Confirm
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ResponsiveModal>
    );

    // Return the modal component and the confirm trigger function
    return [ConfirmationDialog, confirm];
};