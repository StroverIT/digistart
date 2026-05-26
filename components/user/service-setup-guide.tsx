"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ServiceSetupItem } from "@/lib/onboarding/service-setup-status";
import { useServiceSetupGuidePrefs } from "@/hooks/use-service-setup-guide-prefs";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, HelpCircle, Minimize2, X } from "lucide-react";

type ServiceSetupGuideProps = {
  orderItemId: string;
  serviceName: string;
  items: ServiceSetupItem[];
};

export function ServiceSetupGuide({ orderItemId, serviceName, items }: ServiceSetupGuideProps) {
  const { prefs, setPrefs, hydrated } = useServiceSetupGuidePrefs(orderItemId);

  const doneCount = items.filter((t) => t.ok).length;
  const total = items.length;
  const progressPct = total > 0 ? (doneCount / total) * 100 : 100;
  const incomplete = doneCount < total;
  const remainingCount = total - doneCount;

  const defaultAccordion = useMemo(() => {
    const first = items.find((t) => !t.ok);
    return first?.id ?? items[0]?.id ?? "";
  }, [items]);

  if (!incomplete || !hydrated || total === 0) {
    return null;
  }

  if (prefs.mode === "banner") {
    return (
      <button
        type="button"
        onClick={() => setPrefs({ mode: "open" })}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-left shadow-sm transition hover:border-amber-500/60"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">Ръководство за настройка</span>
          <span className="block text-xs text-muted-foreground">
            {doneCount}/{total}. Натисни за повече информация.
          </span>
        </span>
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
          {remainingCount > 9 ? "9+" : remainingCount}
        </span>
      </button>
    );
  }

  if (prefs.mode === "minimized") {
    return (
      <button
        type="button"
        onClick={() => setPrefs({ mode: "open" })}
        className={cn(
          "fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/50 bg-amber-500 p-0 text-white shadow-lg transition hover:scale-105",
        )}
        aria-label={`Отвори ръководството за настройка. Остават ${remainingCount} стъпки.`}
      >
        <HelpCircle className="h-7 w-7" aria-hidden />
        <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-red-500 px-1 text-xs font-bold text-white">
          {remainingCount > 9 ? "9+" : remainingCount}
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 overflow-hidden border border-amber-500/40 bg-card shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both",
        "bottom-4 right-4 w-[min(100vw-2rem,22rem)] rounded-2xl",
        "max-md:inset-0 max-md:flex max-md:w-auto max-md:flex-col max-md:rounded-none max-md:border-0",
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-border/80 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground leading-tight">Ръководство за настройка</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Завършете стъпките по-долу · {serviceName}</p>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground"
            aria-label="Минимизиране"
            onClick={() => setPrefs({ mode: "minimized" })}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground"
            aria-label="Затвори към банер"
            onClick={() => setPrefs({ mode: "banner" })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pt-3">
        <Progress value={progressPct} className="h-1.5" />
        <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
          {doneCount} от {total} готови
        </p>
      </div>

      <div className="max-h-[min(70vh,28rem)] overflow-y-auto px-2 pb-3 max-md:min-h-0 max-md:flex-1 max-md:max-h-none">
        <Accordion
          key={`${items.map((t) => (t.ok ? "1" : "0")).join("")}`}
          type="single"
          collapsible
          defaultValue={defaultAccordion}
          className="px-2"
        >
          {items.map((task) => (
            <AccordionItem key={task.id} value={task.id} className="border-border/70">
              <AccordionTrigger className="-mx-2 rounded-lg px-2 py-3 text-sm hover:no-underline data-[state=open]:bg-muted/40">
                <span className="flex items-center gap-2.5 text-left">
                  {task.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      task.ok && "text-muted-foreground line-through decoration-muted-foreground/80",
                    )}
                  >
                    {task.title}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2 pl-7 text-xs leading-relaxed text-muted-foreground">
                  {task.description}
                </p>
                {!task.ok && task.href ? (
                  <div className="pl-7">
                    {task.href.startsWith("mailto:") ? (
                      <a
                        href={task.href}
                        className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {task.cta}
                      </a>
                    ) : task.href.startsWith("#") ? (
                      <a
                        href={task.href}
                        className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {task.cta}
                      </a>
                    ) : (
                      <Link
                        href={task.href}
                        className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {task.cta}
                      </Link>
                    )}
                  </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
