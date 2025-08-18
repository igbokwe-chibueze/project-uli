// src/components/status-message-card.tsx

"use client";

import { ReactNode } from "react";
import { ShieldOffIcon, AlertTriangleIcon, BanIcon } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

/* -------------------------------------------------------------------------------------------------
   📌 StatusMessageCard Component

   A reusable message card for showing the status of an organization (e.g., deactivated, suspended, etc.).
   Each status is styled with:
   - Icon
   - Title
   - Description
   - Content message
   - Optional footer action (button/link)

   🔑 Features:
   - Provides default configs for common statuses ("deactivated", "suspended", "pendingApproval").
   - Allows consumers to **extend or override configs externally** (new statuses can be registered without 
     editing this file).
   - Strongly typed with `StatusType` for safety, but still flexible via `customConfig`.

   ------------------------------------------------------------------------------------------------- */
//
// ✅ Define the allowed built-in status types
//
export type StatusType = "deactivated" | "suspended" | "pendingApproval";

//
// ✅ Config shape for each status
//
export interface StatusConfig {
    icon: ReactNode;
    title: string;
    description: string;
    content: string;
    styles: {
        border: string;
        bg: string;
        text: string;
        icon: string;
        description: string;
        content: string;
    };
}

//
// ✅ Props for the component
//
interface StatusMessageCardProps {
    status: StatusType | (string & {}); // Can be built-in OR custom-registered
    title?: string;                     // Optional custom title
    description?: string;               // Optional custom description
    content?: ReactNode;                // Optional custom content
    action?: ReactNode;                 // Optional action button/link
    customConfig?: Record<string, StatusConfig>; // External config extension/overrides
}

//
// ✅ Built-in defaults
//
const baseStatusConfig: Record<StatusType, StatusConfig> = {
    deactivated: {
        icon: <ShieldOffIcon className="size-6 text-amber-600" />,
        title: "Account Deactivated",
        description:
        "This account is currently deactivated. Most of its information is hidden from public view and cannot be edited until it is reactivated. Only the owner can reactivate it.",
        content:
        "To make changes or restore public visibility, please reactivate the account using the button below.",
        styles: {
            border: "border-amber-500",
            bg: "bg-amber-50",
            text: "text-amber-900",
            icon: "text-amber-600",
            description: "text-amber-800",
            content: "text-amber-700",
        },
    },
    suspended: {
        icon: <BanIcon className="size-6 text-red-600" />,
        title: "Account Suspended",
        description:
        "This account has been suspended due to policy violations. Access is restricted until further review.",
        content: "Please contact support to resolve this issue.",
        styles: {
            border: "border-red-500",
            bg: "bg-red-50",
            text: "text-red-900",
            icon: "text-red-600",
            description: "text-red-800",
            content: "text-red-700",
        },
    },
    pendingApproval: {
        icon: <AlertTriangleIcon className="size-6 text-blue-600" />,
        title: "Pending Approval",
        description:
        "This account is awaiting approval from the admin team. Until then, some actions may be restricted.",
        content: "You will be notified once the review is complete.",
        styles: {
            border: "border-blue-500",
            bg: "bg-blue-50",
            text: "text-blue-900",
            icon: "text-blue-600",
            description: "text-blue-800",
            content: "text-blue-700",
        },
    },
};

//
// ✅ Component
//
export const StatusMessageCard = ({
    status,
    title,
    description,
    content,
    action,
    customConfig = {},
}: StatusMessageCardProps) => {

    // Merge built-in config + external overrides
    const mergedConfig: Record<string, StatusConfig> = {
        ...baseStatusConfig,
        ...customConfig,
    };

    const config = mergedConfig[status];

    if (!config) {
        console.warn(
            `[StatusMessageCard] Unknown status: "${status}". Please register it via customConfig.`
        );
        return null;
    }

  return (
    <Card className={`${config.styles.border} ${config.styles.bg} ${config.styles.text}`}>

        {/* HEADER */}
        <CardHeader>
            <div className="flex items-center gap-2">
                {config.icon}
                <CardTitle>{title ?? config.title}</CardTitle>
            </div>
            <CardDescription className={config.styles.description}>
                {description ?? config.description}
            </CardDescription>
        </CardHeader>

        {/* CONTENT */}
        <CardContent>
            <p className={`text-sm ${config.styles.content}`}>
                {content ?? config.content}
            </p>
        </CardContent>

        {/* OPTIONAL ACTION */}
        {action && <CardFooter>{action}</CardFooter>}
    </Card>
  );
};

/* -------------------------------------------------------------------------------------------------
   📌 Usage Examples

   // 1️⃣ Using a built-in status
   <StatusMessageCard status="deactivated" />

   // 2️⃣ Overriding default text
   <StatusMessageCard
     status="suspended"
     title="Account Locked"
     description="Your account has been locked due to multiple failed login attempts."
   />

   // 3️⃣ Adding a custom action
   <StatusMessageCard
     status="pendingApproval"
     action={<button className="btn">Contact Support</button>}
   />

   // 4️⃣ Extending with a NEW custom status
   const customStatusConfig = {
     underReview: {
       icon: <AlertTriangleIcon className="size-6 text-purple-600" />,
       title: "Under Review",
       description: "Your organization is currently being reviewed by admins.",
       content: "You will be updated once the process is complete.",
       styles: {
         border: "border-purple-500",
         bg: "bg-purple-50",
         text: "text-purple-900",
         icon: "text-purple-600",
         description: "text-purple-800",
         content: "text-purple-700",
       },
     },
   };

   <StatusMessageCard status="underReview" customConfig={customStatusConfig} />
   ------------------------------------------------------------------------------------------------- */
