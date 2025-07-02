// src/components/callout.tsx

import { CheckCircleIcon, InfoIcon, AlertTriangleIcon, AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CalloutProps {
    /** Content of the callout, including any emphasis elements */
    children: React.ReactNode;
    title: string,
    /** Variant style: default" | "destructive" |"info" | "success" | "warning */
    variant?: "default" | "destructive" |"info" | "success" | "warning" ;
}

const variantIcons = {
    default: InfoIcon,
    destructive: AlertCircleIcon,
    info: InfoIcon,
    success: CheckCircleIcon,
    warning: AlertTriangleIcon,
};


export const Callout = ({ children, title, variant = "info" }: CalloutProps) => {
    const Icon = variantIcons[variant];
  return (
    <Alert className={`mb-4 flex items-start space-x-2 border`} variant={variant}>
        <Icon className="size-5 flex-shrink-0 mt-1" />

        <div>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="text-sm">
                {children}
            </AlertDescription>
        </div>
    </Alert>
  )
}

