"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { AnalyticsModeProvider } from "@/components/analytics/analytics-mode-provider";
import { VisitorPreferencesProvider } from "@/components/visitor-preferences/visitor-preferences-provider";

const CookieConsent = dynamic(
  () =>
    import("@/components/cookies/cookie-consent").then((mod) => ({
      default: mod.CookieConsent,
    })),
  { ssr: false },
);

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
