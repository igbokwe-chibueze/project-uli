// src/app/(standalone)/organisations/layout.tsx

import { Metadata } from "next";

import { StandaloneNavbar } from "@/components/navigation/standalone-navbar";
import { SessionProviderWrapper } from "@/features/auth/components/session-provider-wrapper";
import { DynamicThemeProvider } from "@/components/dynamic-theme-provider";

export const metadata: Metadata = {
  title: "App Marketplace",
  description: "Discover and manage your modules easily",
};
interface StandaloneLayoutProps {
    children: React.ReactNode;
};

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
  return (
    <SessionProviderWrapper>
      <StandaloneNavbar />
      <DynamicThemeProvider>
        <div className="pt-12">
          <main className="min-h-screen">
            <div className="max-w-screen-2xl mx-auto p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </DynamicThemeProvider>
    </SessionProviderWrapper>
  )
}

export default StandaloneLayout;