import type { Metadata } from "next";
import { GoogleNewsletterThankYou } from "@/components/google/google-newsletter-thank-you";

export const metadata: Metadata = {
  title: "Благодарим ви",
  description: "Успешно се записахте за бюлетина на DigiStart.",
};

export default function GoogleNewsletterThankYouPage() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--site-header-height))] items-center justify-center bg-linear-to-b from-white via-background to-primary/30 md:min-h-[calc(100dvh-var(--site-header-height-md))]">
      <main className="mx-auto flex w-full max-w-[1200px] items-center justify-center px-4 py-16 sm:px-6 md:px-12">
        <GoogleNewsletterThankYou />
      </main>
    </div>
  );
}
