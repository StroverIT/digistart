"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Minus, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
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
import { useAnalyticsMode } from "@/components/analytics/analytics-mode-provider";
import { trackCtaClick } from "@/lib/analytics/tracker";

gsap.registerPlugin(ScrollTrigger);

function pulseUpsellRow(upsellId: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(`upsell-row-${upsellId}`);
  if (!el) return;
  gsap.fromTo(
    el,
    { scale: 1 },
    { scale: 1.02, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" },
  );
}

interface UpsellConfiguratorProps {
  service: Service;
  value: CartItemUpsell[];
  onChange: (nextValue: CartItemUpsell[]) => void;
  errors?: UpsellEntryErrors;
  analyticsPage?: string;
}

function isMonthlyUnit(unit?: string): boolean {
  if (!unit) return false;
  const normalized = unit.trim().toLowerCase();
  return normalized === "месец" || normalized === "месеца" || normalized === "мес";
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

export function UpsellConfigurator({
  service,
  value,
  onChange,
  errors,
  analyticsPage,
}: UpsellConfiguratorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isAdmin, isAnalyticsMode, showAllCtaStats, ctaStats, pageStats } =
    useAnalyticsMode();
  const pageKey = analyticsPage ?? pathname ?? `/services/${service.slug}`;
  const byId = new Map(value.map((item) => [item.upsellId, item]));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const rows = root.querySelectorAll<HTMLElement>("[data-upsell-animate-row]");
      if (!rows.length) return;

      gsap.set(rows, { opacity: 0, y: 36, scale: 0.98 });
      gsap.to(rows, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        stagger: 0.1,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: root,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    }, root);

    return () => ctx.revert();
  }, [service.id, service.upsells.length]);

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
    trackCtaClick(pageKey, `upsell_${service.slug}_${upsellId}`);
    pulseUpsellRow(upsellId);
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
    trackCtaClick(pageKey, `upsell_${service.slug}_${upsellId}`);
    pulseUpsellRow(upsellId);
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
    <div ref={rootRef} className="space-y-4">
      {service.upsells.map((upsell) => {
        const item = byId.get(upsell.id);
        const quantity = item?.quantity ?? 0;
        const amount = item ? getUpsellAmount(service, item) : 0;
        const min = upsell.min ?? 0;
        const max = upsell.max ?? 9999;
        const upsellCtaId = `upsell_${service.slug}_${upsell.id}`;
        const clicks =
          ctaStats.find((entry) => entry.page === pageKey && entry.ctaId === upsellCtaId)
            ?.clicks ?? 0;
        const views = pageStats.find((entry) => entry.page === pageKey)?.views ?? 0;
        const showBadge = isAdmin && isAnalyticsMode && views > 0;

        return (
          <div
            id={`upsell-row-${upsell.id}`}
            key={upsell.id}
            data-upsell-animate-row
            className={cn(
              "group rounded-lg border p-4 transition-colors will-change-transform opacity-0 translate-y-10",
              quantity > 0 ? "border-primary/50 bg-primary/5" : "border-border",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Label className="font-semibold">{upsell.name}</Label>
                  {showBadge ? (
                    <span
                      className={cn(
                        "rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold transition-opacity",
                        showAllCtaStats ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      {views} views / {clicks} clicks
                    </span>
                  ) : null}
                </div>
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
                  {upsell.isMonthly && !isMonthlyUnit(upsell.unit) ? (
                    <span className="text-muted-foreground"> /мес</span>
                  ) : null}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
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
