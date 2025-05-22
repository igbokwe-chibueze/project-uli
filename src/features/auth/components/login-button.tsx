// src/features/auth/components/login-button.tsx
"use client"
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LoginForm } from "@/features/auth/components/login-form";

// Define the props for the LoginButton component.
// - children: The content to render inside the button.
// - mode: Determines how the login UI is displayed, either as a modal or by redirecting.
// - asChild (optional): When true, passes down the button styles to the child element.
interface LoginButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect",
    asChild?: boolean;
};

// LoginButton component renders a login trigger that either shows a modal with a login form or redirects to the login page.
const LoginButton = ({ children, mode = "redirect" }: LoginButtonProps) => {
    // Use Next.js router to handle client-side navigation.
    const router = useRouter();

    const onClick = () => {
        router.push("/login");
    }

    // Conditional rendering based on the mode prop.
    if (mode === "modal") {
        return (
            // Render a Dialog component to show the login form in a modal.
            <Dialog>
                <DialogTrigger asChild={true}>
                    {children}
                </DialogTrigger>
                <DialogContent className="p-0 w-auto border-none">
                    {/* Visually hidden title for accessibility */}
                    <DialogTitle className="sr-only">Login Form</DialogTitle>
                    {/* Render the actual login form */}
                    <LoginForm/>
                </DialogContent>
            </Dialog>
        )
    }
    
    // Default mode: redirect
    // Wrap the children in a <span> that handles the onClick to redirect the user.
  return (
    <span onClick={onClick}>
        {children}
    </span>
  )
}

export default LoginButton