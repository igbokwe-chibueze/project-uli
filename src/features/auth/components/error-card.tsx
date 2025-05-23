// src/features/auth/components/error-card.tsx

import { TriangleAlertIcon } from "lucide-react";
import { CardWrapper } from "@/features/auth/components/card-wrapper";

const ErrorCard = () => {
    return (
        <CardWrapper 
            headerHeading="Error"
            headerLabel="Something went wrong!"
            backButtonLabel="Back to Login"
            backButtonHref="/access"
        >
            <div className="w-full flex justify-center items-center">
                <TriangleAlertIcon className="text-destructive"/>
            </div>
        </CardWrapper>
    )
}

export default ErrorCard;