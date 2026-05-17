"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { subscriptionPlans, type PlanId, BUNDLE_PAGE_PATH } from "@/lib/data/plans";
import { addPlanToCart } from "@/lib/store/cart";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { PlanCard } from "@/components/plans/plan-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlansSectionProps {
  id?: string;
  className?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function PlansSection({
  id = "plans",
  className,
  title = "Абонаментни пакети",
  subtitle = "Избери готов пакет с месечно плащане или конфигурирай услугите поотделно по-долу.",
  compact = false,
}: PlansSectionProps) {
  const { push } = useTransitionRouter();
  const [addingPlanId, setAddingPlanId] = useState<PlanId | null>(null);

  const handleSelect = (planId: PlanId) => {
    setAddingPlanId(planId);
    const result = addPlanToCart(planId);
    setAddingPlanId(null);
    if (!result.added) {
      if (result.reason === "duplicate") {
        toast.info("Този план вече е в количката.");
        push("/cart");
      }
      return;
    }
    toast.success("Планът е добавен в количката.");
    push("/cart");
  };

  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto max-w-6xl px-4">
        <div
          className={cn(
            "mx-auto flex flex-col items-center text-center",
            compact ? "mb-10 max-w-2xl" : "mb-12 max-w-2xl md:mb-14",
          )}
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          <p className="mt-3 text-pretty text-muted-foreground md:text-lg">{subtitle}</p>
          <Button variant="outline" size="sm" className="mt-5 gap-1.5 rounded-full border-primary/30 px-4" asChild>
            <Link href={BUNDLE_PAGE_PATH}>
              Пълно сравнение на пакетите
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {subscriptionPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelect}
              isAdding={addingPlanId === plan.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
