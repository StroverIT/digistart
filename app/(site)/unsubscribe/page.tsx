import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribeForm } from "@/components/newsletter/unsubscribe-form";

export const metadata: Metadata = {
  title: "Отписване от имейли",
  description: "Отпишете се от имейлите на DigiStart.",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-background to-primary/30">
      <main className="mx-auto flex w-full max-w-lg flex-col justify-center px-4 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-28">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm sm:p-8">
              <p className="text-sm text-muted-foreground">Зареждане...</p>
            </div>
          }
        >
          <UnsubscribeForm />
        </Suspense>
      </main>
    </div>
  );
}
