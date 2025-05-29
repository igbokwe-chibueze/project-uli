// src/app/loading.tsx

"use client";

import { Loader } from "lucide-react";

export default function LoadingPage() {
    return (
        <div className="h-screen flex items-center justify-center">
            <Loader className="size-6 animate-spin text-muted-foreground"/>
        </div>
    );
}