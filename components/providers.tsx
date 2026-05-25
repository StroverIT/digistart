"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { CookieConsent } from "@/components/cookies/cookie-consent";
import { AnalyticsModeProvider } from "@/components/analytics/analytics-mode-provider";
import { VisitorPreferencesProvider } from "@/components/visitor-preferences/visitor-preferences-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <VisitorPreferencesProvider>
      <AnalyticsModeProvider>
        {children}
        <CookieConsent />
        <Toaster richColors position="top-center" />
      </AnalyticsModeProvider>
      </VisitorPreferencesProvider>
    </SessionProvider>
  );
}
