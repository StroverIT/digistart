"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CartItemUpsell, Service } from "@/lib/types";
import type { UpsellEntryErrors } from "@/components/services/upsell-validation";

interface UpsellConfiguratorProps {
  service: Service;
  value: CartItemUpsell[];
  onChange: (nextValue: CartItemUpsell[]) => void;
  errors?: UpsellEntryErrors;
}

function getUpsellAmount(service: Service, item: CartItemUpsell): number {
  const upsell = service.upsells.find((u) => u.id === item.upsellId);
  if (!upsell || item.quantity <= 0) return 0;

  if (upsell.kind === "choice" && upsell.choices?.length) {
    const selectedChoice = upsell.choices.find((choice) => choice.id === item.choiceId);
    return (selectedChoice?.pricePerUnit ?? 0) * item.quantity;
  }

  const includedUnits = upsell.includedUnits ?? 0;
  const billableUnits = Math.max(0, item.quantity - includedUnits);
  if (upsell.tierStep && upsell.tierPrice) {
    return Math.ceil(billableUnits / upsell.tierStep) * upsell.tierPrice;
  }
  return (upsell.pricePerUnit ?? 0) * billableUnits;
}

export function UpsellConfigurator({ service, value, onChange, errors }: UpsellConfiguratorProps) {
  const byId = new Map(value.map((item) => [item.upsellId, item]));

  const setUpsell = (upsellId: string, next: CartItemUpsell | null) => {
    const nextValue = value.filter((item) => item.upsellId !== upsellId);
    if (next && next.quantity > 0) {
      nextValue.push(next);
    }
    onChange(nextValue);
  };

  const updateQuantity = (upsellId: string, quantity: number) => {
    const upsell = service.upsells.find((u) => u.id === upsellId);
    if (!upsell) return;
    const current = byId.get(upsellId);
    const min = upsell.min ?? 0;
    const max = upsell.max ?? 9999;
    const safeQuantity = Math.max(min, Math.min(max, quantity));
    if (safeQuantity <= 0) {
      setUpsell(upsellId, null);
      return;
    }
    setUpsell(upsellId, {
      upsellId,
      quantity: safeQuantity,
      choiceId: current?.choiceId,
      entries: current?.entries ?? [],
      note: current?.note,
    });
  };

  const updateChoice = (upsellId: string, choiceId: string) => {
    const current = byId.get(upsellId);
    const quantity = current?.quantity || 1;
    setUpsell(upsellId, {
      upsellId,
      quantity,
      choiceId,
      entries: current?.entries ?? [],
      note: current?.note,
    });
  };

  const updateEntries = (upsellId: string, entries: string[]) => {
    const current = byId.get(upsellId);
    if (!current) return;
    setUpsell(upsellId, { ...current, entries });
  };

  return (
    <div className="space-y-4">
      {service.upsells.map((upsell) => {
        const item = byId.get(upsell.id);
        const quantity = item?.quantity ?? 0;
        const amount = item ? getUpsellAmount(service, item) : 0;
        const min = upsell.min ?? 0;
        const max = upsell.max ?? 9999;

        return (
          <div
            key={upsell.id}
            className={cn(
              "rounded-lg border p-4 transition-colors",
              quantity > 0 ? "border-primary/50 bg-primary/5" : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="font-semibold block mb-1">{upsell.name}</Label>
                <p className="text-sm text-muted-foreground">{upsell.description}</p>
                {upsell.helperText ? (
                  <p className="text-xs text-muted-foreground mt-1">{upsell.helperText}</p>
                ) : null}
                <p className="text-sm mt-2">
                  {upsell.kind === "choice" ? (
                    <span className="text-muted-foreground">Избери пакет</span>
                  ) : (
                    <>
                      <Price value={upsell.pricePerUnit ?? 0} className="text-primary font-medium" />
                      <span className="text-muted-foreground"> / {upsell.unit}</span>
                    </>
                  )}
                  {upsell.isMonthly ? <span className="text-muted-foreground"> /мес</span> : null}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(upsell.id, quantity - 1)}
                  disabled={quantity <= min}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(upsell.id, quantity + 1)}
                  disabled={quantity >= max}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {upsell.kind === "choice" && quantity > 0 && upsell.choices?.length ? (
              <div className="mt-3">
                <Select
                  value={item?.choiceId ?? upsell.choices[0].id}
                  onValueChange={(choiceId) => updateChoice(upsell.id, choiceId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Избери опция" />
                  </SelectTrigger>
                  <SelectContent>
                    {upsell.choices.map((choice) => (
                      <SelectItem key={choice.id} value={choice.id}>
                        {choice.name} (+{choice.pricePerUnit} €{choice.isMonthly ? "/мес" : ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {upsell.allowEntries && quantity > 0 ? (
              <div className="mt-3 space-y-2">
                {Array.from({ length: quantity }).map((_, index) => (
                  <div key={`${upsell.id}-entry-${index}`}>
                    <Input
                      value={item?.entries?.[index] ?? ""}
                      placeholder={`${upsell.entryPlaceholder ?? "Въведи стойност"} #${index + 1}`}
                      className={errors?.[upsell.id]?.[index] ? "border-destructive focus-visible:ring-destructive/40" : undefined}
                      onChange={(event) => {
                        const entries = [...(item?.entries ?? [])];
                        entries[index] = event.target.value;
                        updateEntries(upsell.id, entries);
                      }}
                    />
                    {errors?.[upsell.id]?.[index] ? (
                      <p className="mt-1 text-xs text-destructive">{errors[upsell.id][index]}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {quantity > 0 ? (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {quantity} x{" "}
                  {upsell.kind === "choice"
                    ? item?.choiceId
                      ? upsell.choices?.find((choice) => choice.id === item.choiceId)?.name
                      : upsell.choices?.[0]?.name
                    : <Price value={upsell.pricePerUnit ?? 0} />}
                </span>
                <span className="font-medium text-primary">
                  +<Price value={amount} className="text-primary font-medium" />
                  {upsell.isMonthly ? "/мес" : ""}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
