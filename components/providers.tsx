"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { CookieConsent } from "@/components/cookies/cookie-consent";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <CookieConsent />
      <Toaster richColors position="top-center" />
    </SessionProvider>
  );
}
