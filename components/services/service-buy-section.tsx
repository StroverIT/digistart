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
  upsells,
  onUpsellsChange,
  onAddToCart,
  isAdding,
}: ServiceBuySectionProps) {
  const [errors, setErrors] = useState<UpsellEntryErrors>({});

  const hasUpsells = useMemo(() => service.upsells.length > 0, [service.upsells.length]);

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
    <section id="buy-now" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl rounded-2xl border border-border bg-card p-5 sm:p-6">
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
          <div className="sticky bottom-4 z-20 pt-3">
            <Button
              onClick={handleAddClick}
              size="lg"
              disabled={isAdding}
              className="h-12 px-6 text-base bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isAdding ? "Обработка..." : "Добави в кошницата"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
