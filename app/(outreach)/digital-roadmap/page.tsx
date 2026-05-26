import { Suspense } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { DigitalRoadmapForm } from "@/components/outreach/digital-roadmap-form";

const highlights = [
  "Как да изберете правилната платформа за продажби",
  "3 стъпки за първите онлайн поръчки",
  "Къде губите клиенти преди да стигнат до плащане",
] as const;

export default function DigitalRoadmapPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Безплатно PDF ръководство
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Научете как да продавате продуктите си{" "}
            <span className="gradient-text">онлайн</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Въведете име и имейл, за да получите нашата дигитална пътна карта - практично
            ръководство за старт в онлайн продажбите, без технически жаргон.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-start">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            <h2 className="text-lg font-semibold">Какво ще намерите вътре</h2>
            <ul className="space-y-4">
              {highlights.map((text) => (
                <li key={text} className="flex gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <Suspense fallback={<div className="h-64 rounded-xl border border-border bg-card" />}>
              <DigitalRoadmapForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
