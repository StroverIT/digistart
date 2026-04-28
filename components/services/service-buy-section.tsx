"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { UpsellConfigurator } from "@/components/services/upsell-configurator";
import {
  validateUpsellEntries,
  type UpsellEntryErrors,
} from "@/components/services/upsell-validation";
import type { CartItemUpsell, Service } from "@/lib/types";

interface ServiceBuySectionProps {
  service: Service;
  title: string;
  description: string;
  price: number;
  monthlyLabel?: string;
  ctaLabel?: string;
  upsells: CartItemUpsell[];
  onUpsellsChange: (nextUpsells: CartItemUpsell[]) => void;
  onAddToCart: () => void;
  isAdding: boolean;
}

export function ServiceBuySection({
  service,
  title,
  description,
  price,
  monthlyLabel,
  ctaLabel,
  upsells,
  onUpsellsChange,
  onAddToCart,
  isAdding,
}: ServiceBuySectionProps) {
  const [errors, setErrors] = useState<UpsellEntryErrors>({});

  const hasUpsells = useMemo(() => service.upsells.length > 0, [service.upsells.length]);
  const ctaText = ctaLabel ?? "Промени в кошницата";

  const totalPrice = useMemo(() => {
    let total = price;

    for (const item of upsells) {
      if (item.quantity <= 0) continue;
      const upsell = service.upsells.find((u) => u.id === item.upsellId);
      if (!upsell) continue;

      if (upsell.kind === "choice" && upsell.choices?.length) {
        const selectedChoice = upsell.choices.find((choice) => choice.id === item.choiceId);
        total += (selectedChoice?.pricePerUnit ?? 0) * item.quantity;
        continue;
      }

      const includedUnits = upsell.includedUnits ?? 0;
      const billableUnits = Math.max(0, item.quantity - includedUnits);
      if (upsell.tierStep && upsell.tierPrice) {
        total += Math.ceil(billableUnits / upsell.tierStep) * upsell.tierPrice;
        continue;
      }
      total += (upsell.pricePerUnit ?? 0) * billableUnits;
    }

    return total;
  }, [price, upsells, service.upsells]);

  const handleChange = (nextUpsells: CartItemUpsell[]) => {
    onUpsellsChange(nextUpsells);
    const validation = validateUpsellEntries(service.upsells, nextUpsells);
    setErrors(validation.errors);
  };

  const handleAddClick = () => {
    const validation = validateUpsellEntries(service.upsells, upsells);
    setErrors(validation.errors);
    if (!validation.isValid) {
      toast.error("Моля попълни всички задължителни полета за избраните допълнителни услуги.");
      return;
    }
    onAddToCart();
  };

  return (
    <section id="buy-now" className="py-12 pb-28 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground mb-5">{description}</p>
            <div className="mb-5 flex items-center gap-2">
              <Price value={price} className="text-3xl text-primary" />
              {monthlyLabel ? <span className="text-muted-foreground">{monthlyLabel}</span> : null}
            </div>
            {isAdding ? (
              <div className="mb-6 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : null}
            {hasUpsells && !isAdding ? (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Допълнителни услуги</h3>
                <UpsellConfigurator
                  service={service}
                  value={upsells}
                  onChange={handleChange}
                  errors={errors}
                />
              </div>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground mb-2">Общо</p>
              <div className="mb-1 flex items-end gap-2">
                <Price value={totalPrice} className="text-3xl text-primary" />
                {monthlyLabel ? <span className="pb-1 text-muted-foreground">{monthlyLabel}</span> : null}
              </div>
              <p className="mb-5 text-xs text-muted-foreground">Включва избраните допълнителни услуги</p>
              <Button
                onClick={handleAddClick}
                size="lg"
                disabled={isAdding}
                className="h-12 w-full px-6 text-base bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAdding ? "Обработка..." : ctaText}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Общо</p>
            <div className="flex items-end gap-2">
              <Price value={totalPrice} className="text-2xl text-primary leading-none" />
              {monthlyLabel ? <span className="text-xs text-muted-foreground">{monthlyLabel}</span> : null}
            </div>
          </div>
          <Button
            onClick={handleAddClick}
            size="lg"
            disabled={isAdding}
            className="h-11 shrink-0 px-5 text-sm bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isAdding ? "Обработка..." : ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
}
