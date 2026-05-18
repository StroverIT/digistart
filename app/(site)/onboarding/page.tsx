import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Настройка на проекта",
  description: "Попълни данните и интеграциите за твоя онлайн магазин или маркетинг услуги.",
};

type OnboardingPageProps = {
  searchParams: Promise<{ orderItemId?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { orderItemId } = await searchParams;

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Настройка на проекта</h1>
          <p className="text-muted-foreground">
            Следвай стъпките, за да конфигурираме услугата ти възможно най-бързо.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        >
          <OnboardingWizard orderItemId={orderItemId ?? null} />
        </Suspense>
      </div>
    </main>
  );
}
