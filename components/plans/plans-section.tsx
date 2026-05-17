"use client";

import { useState } from "react";
import { toast } from "sonner";
import { subscriptionPlans, type PlanId } from "@/lib/data/plans";
import { addPlanToCart } from "@/lib/store/cart";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { PlanCard } from "@/components/plans/plan-card";
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
    <section id={id} className={cn("py-16 md:py-20", className)}>
      <div className="container mx-auto px-4">
        <div className={cn("mx-auto text-center", compact ? "max-w-2xl mb-8" : "max-w-3xl mb-12")}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
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
