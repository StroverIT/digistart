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

const upsellChoiceButtonClass = (isSelected: boolean) =>
  cn(
    "rounded-xl px-3 py-2.5 text-left transition-all",
    isSelected ? "bg-card shadow-sm" : "hover:bg-card/50",
  );

const upsellChoiceGridClass = (choiceCount: number) =>
  cn("grid gap-1.5", choiceCount >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2");

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
    const defaultChoiceId =
      upsell.kind === "choice" && upsell.choices?.length ? upsell.choices[0].id : undefined;
    setUpsell(upsellId, {
      upsellId,
      quantity: safeQuantity,
      choiceId: current?.choiceId ?? defaultChoiceId,
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

  const toggleDirectChoice = (upsellId: string, choiceId: string) => {
    const current = byId.get(upsellId);
    if (current?.quantity && current.choiceId === choiceId) {
      setUpsell(upsellId, null);
      return;
    }
    trackCtaClick(pageKey, `upsell_${service.slug}_${upsellId}`);
    pulseUpsellRow(upsellId);
    setUpsell(upsellId, {
      upsellId,
      quantity: 1,
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
    <div ref={rootRef} className="divide-y divide-border/40">
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
        const isDirectChoice = upsell.kind === "choice" && upsell.directChoice;
        const isSingleToggle = !isDirectChoice && max === 1;
        const choiceCount = upsell.choices?.length ?? 0;
        const minChoicePrice =
          isDirectChoice && upsell.choices?.length
            ? Math.min(...upsell.choices.map((choice) => choice.pricePerUnit))
            : null;

        return (
          <div
            id={`upsell-row-${upsell.id}`}
            key={upsell.id}
            data-upsell-animate-row
            className={cn(
              "group py-6 will-change-transform opacity-0 translate-y-10 first:pt-0 last:pb-0",
              quantity > 0 && !isDirectChoice && "relative",
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Label className="font-heading text-base font-bold text-foreground">
                    {upsell.name}
                  </Label>
                  {quantity > 0 && !isDirectChoice && !isSingleToggle ? (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                      Добавено
                    </span>
                  ) : null}
                  {showBadge ? (
                    <span
                      className={cn(
                        "rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-semibold transition-opacity",
                        showAllCtaStats ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      {views} views / {clicks} clicks
                    </span>
                  ) : null}
                </div>
                {!upsell.hideBuySectionDescription ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">{upsell.description}</p>
                ) : null}
                {upsell.helperText ? (
                  <p className="mt-1 text-xs text-muted-foreground">{upsell.helperText}</p>
                ) : null}
                {!isDirectChoice ? (
                  <p className="mt-2 text-sm">
                    {upsell.kind === "choice" ? (
                      <span className="text-muted-foreground">Избери пакет</span>
                    ) : (
                      <>
                        <Price value={upsell.pricePerUnit ?? 0} className="font-medium text-accent" />
                        <span className="text-muted-foreground"> / {upsell.unit}</span>
                      </>
                    )}
                    {upsell.isMonthly && !isMonthlyUnit(upsell.unit) ? (
                      <span className="text-muted-foreground"> /мес</span>
                    ) : null}
                  </p>
                ) : minChoicePrice != null ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    от{" "}
                    <Price value={minChoicePrice} className="text-sm font-medium text-accent" />
                    {upsell.isMonthly ? "/мес" : ""}
                  </p>
                ) : null}
              </div>

              {!isDirectChoice ? (
                isSingleToggle ? (
                  <Button
                    type="button"
                    variant={quantity > 0 ? "outline" : "default"}
                    size="sm"
                    className={cn(
                      "h-9 shrink-0 self-start rounded-full px-4 font-semibold sm:self-auto",
                      quantity > 0 && "border-border text-foreground hover:bg-muted/50",
                    )}
                    onClick={() => updateQuantity(upsell.id, quantity > 0 ? 0 : 1)}
                  >
                    {quantity > 0 ? "Премахни" : "Добави"}
                  </Button>
                ) : (
                  <div className="inline-flex shrink-0 items-center gap-1 self-start rounded-full bg-muted/40 p-1 sm:self-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-card"
                      onClick={() => updateQuantity(upsell.id, quantity - 1)}
                      disabled={quantity <= min}
                      aria-label={`Намали ${upsell.name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-card"
                      onClick={() => updateQuantity(upsell.id, quantity + 1)}
                      disabled={quantity >= max}
                      aria-label={`Увеличи ${upsell.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )
              ) : null}
            </div>

            {isDirectChoice && upsell.choices?.length ? (
              <div className="mt-4 rounded-2xl bg-muted/40 p-1.5">
                <div className={upsellChoiceGridClass(choiceCount)}>
                  {upsell.choices.map((choice) => {
                    const isSelected = quantity > 0 && item?.choiceId === choice.id;

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => toggleDirectChoice(upsell.id, choice.id)}
                        className={upsellChoiceButtonClass(isSelected)}
                      >
                        <span className="block text-sm font-semibold text-foreground">
                          {choice.name}
                        </span>
                        <span className="mt-1 flex items-baseline gap-1 text-xs text-foreground/65">
                          +
                          <Price
                            value={choice.pricePerUnit}
                            className="text-xs text-foreground/65"
                          />
                          {choice.isMonthly ? "/мес" : ""}
                        </span>
                        {choice.description ? (
                          <span className="mt-1 block text-xs text-foreground/65">
                            {choice.description}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {!isDirectChoice && upsell.kind === "choice" && quantity > 0 && upsell.choices?.length ? (
              <div className="mt-4 rounded-2xl bg-muted/40 p-1.5">
                <div className={upsellChoiceGridClass(upsell.choices.length)}>
                  {upsell.choices.map((choice) => {
                    const selectedChoiceId = item?.choiceId ?? upsell.choices![0].id;
                    const isSelected = selectedChoiceId === choice.id;

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => updateChoice(upsell.id, choice.id)}
                        className={upsellChoiceButtonClass(isSelected)}
                      >
                        <span className="block text-sm font-semibold text-foreground">
                          {choice.name}
                        </span>
                        <span className="mt-1 flex items-baseline gap-1 text-xs text-foreground/65">
                          +
                          <Price
                            value={choice.pricePerUnit}
                            className="text-xs text-foreground/65"
                          />
                          {choice.isMonthly ? "/мес" : ""}
                        </span>
                        {choice.description ? (
                          <span className="mt-1 block text-xs text-foreground/65">
                            {choice.description}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {upsell.allowEntries && quantity > 0 ? (
              <div className="mt-4 space-y-2">
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

            {quantity > 0 && !isDirectChoice ? (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {upsell.kind === "choice" ? (
                    item?.choiceId
                      ? upsell.choices?.find((choice) => choice.id === item.choiceId)?.name
                      : upsell.choices?.[0]?.name
                  ) : (
                    <>
                      {quantity} x <Price value={upsell.pricePerUnit ?? 0} />
                    </>
                  )}
                </span>
                <span className="font-semibold text-accent">
                  +<Price value={amount} className="font-semibold text-accent" />
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
