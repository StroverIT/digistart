"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/data/plans";
import { BUNDLE_PAGE_PATH } from "@/lib/data/plans";

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (planId: SubscriptionPlan["id"]) => void;
  isAdding?: boolean;
}

export function PlanCard({ plan, onSelect, isAdding }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        plan.highlighted &&
          "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10",
      )}
    >
      <CardHeader className="space-y-2 pb-0 pt-6 px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">{plan.name}</CardTitle>
            <p className="text-sm leading-snug text-muted-foreground">{plan.tagline}</p>
          </div>
          {plan.discountPercent > 0 ? (
            <span
              className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
              aria-label={`Отстъпка ${plan.discountPercent} процента`}
            >
              −{plan.discountPercent}%
            </span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 px-6 pb-6 pt-5">
        {/* Pricing: fixed structure so cards align; /мес stays on same row as amounts */}
        <div
          className={cn(
            "rounded-xl border px-4 py-3.5",
            plan.highlighted ? "border-primary/25 bg-primary/6" : "border-border/80 bg-muted/25",
          )}
        >
          <div className="flex min-h-11 flex-col justify-center">
            {plan.discountPercent > 0 ? (
              <p className="text-xs leading-tight text-muted-foreground line-through decoration-muted-foreground/70">
                Каталог:{" "}
                <span className="tabular-nums">
                  <Price value={plan.listMonthly} layout="horizontal" className="inline-flex gap-1.5" />
                </span>
                <span className="text-muted-foreground/80">/мес</span>
              </p>
            ) : null}
          </div>

          <div className="mt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Месечно
            </p>
            <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-0">
              <Price
                value={plan.monthlyTotal}
                layout="vertical"
                className="flex-col items-start gap-0.5 text-2xl font-bold tabular-nums leading-none sm:text-3xl [&>span:first-child]:font-bold [&>span:last-child]:text-sm [&>span:last-child]:font-normal [&>span:last-child]:text-muted-foreground sm:[&>span:last-child]:text-base"
              />
              <span className="shrink-0 pb-0.5 text-sm font-medium text-muted-foreground">/мес</span>
            </div>
          </div>

          <div
            className={cn(
              "mt-3 border-t pt-3",
              plan.highlighted ? "border-primary/15" : "border-border/70",
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Еднократно при старт
            </p>
            {plan.oneTimeTotal > 0 ? (
              <div className="mt-1">
                <Price
                  value={plan.oneTimeTotal}
                  layout="vertical"
                  className="flex-col items-start gap-0.5 text-lg font-semibold tabular-nums leading-tight [&>span:last-child]:text-sm [&>span:last-child]:font-normal [&>span:last-child]:text-muted-foreground"
                />
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">Без еднократна такса</p>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

        <ul className="flex flex-1 flex-col gap-2.5 text-sm leading-snug">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2.5">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-2 border-t border-border/60 pt-4">
          <Button
            className="w-full h-11 font-semibold"
            variant={plan.highlighted ? "default" : "outline"}
            size="default"
            disabled={isAdding}
            onClick={() => onSelect(plan.id)}
          >
            {isAdding ? "Добавяне..." : "Избери план"}
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground" asChild>
            <Link href={`${BUNDLE_PAGE_PATH}#plan-${plan.id}`}>Виж детайли</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
