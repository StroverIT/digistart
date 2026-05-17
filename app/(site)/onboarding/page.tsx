import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Настройка на магазина",
  description: "Избери категория, шаблон и попълни данните за твоя онлайн магазин.",
};

export default function OnboardingPage() {
  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Настройка на проекта</h1>
          <p className="text-muted-foreground">
            Следвай стъпките, за да конфигурираме магазина ти за 1 работен ден.
          </p>
        </div>
        <OnboardingWizard />
      </div>
    </main>
  );
}
