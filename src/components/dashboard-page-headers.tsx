// src/components/dashboard-page-headers.tsx

import { ReactNode } from "react";

interface DashboardPageHeadersProps {
    title: string;
    description?: ReactNode; // can be text OR dynamic JSX
}

export const DashboardPageHeaders = ({
    title,
    description,
}: DashboardPageHeadersProps) => {
    return (
        <header className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
            <h1 className="text-3xl font-bold">{title}</h1>

            {description && (
                <p className="text-muted-foreground">{description}</p>
            )}
        </header>
    );
};