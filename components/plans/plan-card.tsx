"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/data/plans";

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (planId: SubscriptionPlan["id"]) => void;
  isAdding?: boolean;
}

export function PlanCard({ plan, onSelect, isAdding }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col h-full border-border bg-card/80 backdrop-blur-sm transition-shadow",
        plan.highlighted && "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/30",
      )}
    >
      {plan.discountPercent > 0 && (
        <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          -{plan.discountPercent}%
        </span>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{plan.tagline}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div>
          {plan.discountPercent > 0 && (
            <p className="text-sm text-muted-foreground line-through mb-0.5">
              <Price value={plan.listMonthly} />/мес
            </p>
          )}
          <p className="text-3xl font-bold">
            <Price value={plan.monthlyTotal} />
            <span className="text-base font-normal text-muted-foreground">/мес</span>
          </p>
          {plan.oneTimeTotal > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              + <Price value={plan.oneTimeTotal} /> еднократно при старт
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        <ul className="flex-1 space-y-2 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          variant={plan.highlighted ? "default" : "outline"}
          disabled={isAdding}
          onClick={() => onSelect(plan.id)}
        >
          {isAdding ? "Добавяне..." : "Избери план"}
        </Button>
      </CardContent>
    </Card>
  );
}
