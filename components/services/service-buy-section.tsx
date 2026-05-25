"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCompanionOffer } from "@/components/services/service-companion-offer";
import type { ServiceCompanionOfferConfig } from "@/lib/types";
import { UpsellConfigurator } from "@/components/services/upsell-configurator";
import {
  validateUpsellEntries,
  type UpsellEntryErrors,
} from "@/components/services/upsell-validation";
import type { CartItemUpsell, Service } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";
import { findCartItemByService } from "@/lib/store/cart";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { cn } from "@/lib/utils";
import type { ServiceSlotAvailability } from "@/lib/types";
import { ServiceWaitlistOverlay } from "@/components/services/service-waitlist-overlay";

gsap.registerPlugin(ScrollTrigger);

let activeMobileStickyId: string | null = null;
const mobileStickySubscribers = new Set<() => void>();

function notifyMobileStickySubscribers() {
  for (const subscriber of mobileStickySubscribers) {
    subscriber();
  }
}

function setActiveMobileSticky(id: string | null) {
  activeMobileStickyId = id;
  notifyMobileStickySubscribers();
}

interface ServiceBuySectionProps {
  service: Service;
  title: string;
  price: number;
  monthlyLabel?: string;
  ctaLabel?: string;
  upsells: CartItemUpsell[];
  onUpsellsChange: (nextUpsells: CartItemUpsell[]) => void;
  onAddToCart: (options?: { includeCompanion?: boolean }) => void;
  companion?: ServiceCompanionOfferConfig;
  isAdding: boolean;
  ctaId?: string;
  ctaPage?: string;
  /** When set, cart sync matches this option id (same as `addToCart` / `updateCartItemUpsells`). */
  cartSelectedOptionId?: string;
  /** Anchor id of `PlansSection` on the same page (default matches `PlansSection`). */
  plansSectionId?: string;
  /** Slot availability for this service; when sold out, buy UI is blurred and waitlist is shown. */
  availability?: ServiceSlotAvailability | null;
}

export function ServiceBuySection({
  service,
  title,
  price,
  monthlyLabel,
  ctaLabel,
  upsells,
  onUpsellsChange,
  onAddToCart,
  isAdding,
  ctaId,
  ctaPage,
  cartSelectedOptionId,
  plansSectionId = "plans",
  companion,
  availability,
}: ServiceBuySectionProps) {
  const { push } = useTransitionRouter();
  const [includeCompanion, setIncludeCompanion] = useState(false);
  const [errors, setErrors] = useState<UpsellEntryErrors>({});
  const [serviceInCart, setServiceInCart] = useState(false);
  const hadCartLineRef = useRef(false);
  const [mobileStickyId] = useState(() => `service-buy-mobile-${Math.random().toString(36).slice(2)}`);
  const [isActiveMobileSticky, setIsActiveMobileSticky] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  const hasUpsells = useMemo(() => service.upsells.length > 0, [service.upsells.length]);
  const selectedOption = useMemo(
    () => service.options.find((option) => option.id === cartSelectedOptionId) ?? service.options[0],
    [cartSelectedOptionId, service.options],
  );
  const basePackageFrequency =
    monthlyLabel ?? (selectedOption?.isMonthly || service.isMonthly ? "/месец" : "еднократно");
  const ctaText =
    ctaLabel ?? (serviceInCart ? "Промени в кошницата" : "Добави в кошницата");
  const isSoldOut = availability?.isSoldOut ?? false;
  const remainingSlots = availability?.remaining;

  useEffect(() => {
    const cloneUpsells = (list: CartItemUpsell[]) =>
      list.map((u) => ({
        ...u,
        entries: u.entries ? [...u.entries] : undefined,
      }));

    const syncFromCart = () => {
      const item = findCartItemByService(service.id, cartSelectedOptionId);
      setServiceInCart(Boolean(item));
      if (item) {
        onUpsellsChange(cloneUpsells(item.upsells));
        hadCartLineRef.current = true;
      } else if (hadCartLineRef.current) {
        onUpsellsChange([]);
        hadCartLineRef.current = false;
      }
    };
    syncFromCart();
    window.addEventListener("cart-updated", syncFromCart);
    return () => window.removeEventListener("cart-updated", syncFromCart);
  }, [service.id, cartSelectedOptionId, onUpsellsChange]);

  const companionPrice = useMemo(() => {
    if (!companion || !includeCompanion) return 0;
    const companionService = getServiceById(companion.serviceId);
    const option = companionService?.options.find((o) => o.id === companion.optionId);
    return option?.price ?? 0;
  }, [companion, includeCompanion]);

  const totalPrice = useMemo(() => {
    let total = price + companionPrice;

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
  }, [price, companionPrice, upsells, service.upsells]);

  const handleChange = (nextUpsells: CartItemUpsell[]) => {
    onUpsellsChange(nextUpsells);
    const validation = validateUpsellEntries(service.upsells, nextUpsells);
    setErrors(validation.errors);
  };

  const handleAddClick = () => {
    if (isSoldOut) return;
    const validation = validateUpsellEntries(service.upsells, upsells);
    setErrors(validation.errors);
    if (!validation.isValid) {
      toast.error("Моля попълни всички задължителни полета за избраните допълнителни услуги.");
      return;
    }
    if (ctaId) {
      trackCtaClick(ctaPage ?? `/services/${service.slug}`, ctaId);
    }
    const wasInCart = serviceInCart;
    onAddToCart(
      companion && includeCompanion ? { includeCompanion: true } : undefined,
    );
    if (wasInCart) {
      push("/cart");
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const main = mainPanelRef.current;
    const aside = asideRef.current;
    if (!section || !main) return;

    const ctx = gsap.context(() => {
      gsap.set(main, { opacity: 0, y: 40 });
      gsap.to(main, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      if (aside) {
        gsap.set(aside, { opacity: 0, y: 40 });
        gsap.to(aside, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const targets = sectionRef.current?.querySelectorAll<HTMLElement>("[data-total-pulse]");
    if (!targets?.length) return;
    gsap.fromTo(
      targets,
      { scale: 1.05 },
      { scale: 1, duration: 0.25, ease: "power2.out" },
    );
  }, [totalPrice]);

  // Ensure only one mobile sticky footer is visible at a time, even during route transition overlaps.
  useEffect(() => {
    const sync = () => setIsActiveMobileSticky(activeMobileStickyId === mobileStickyId);
    mobileStickySubscribers.add(sync);
    setActiveMobileSticky(mobileStickyId);
    sync();

    return () => {
      mobileStickySubscribers.delete(sync);
      if (activeMobileStickyId === mobileStickyId) {
        setActiveMobileSticky(null);
      }
    };
  }, [mobileStickyId]);

  return (
    <section ref={sectionRef} id="buy-now" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {availability && remainingSlots !== undefined && !isSoldOut ? (
          <p className="mb-4 text-center text-sm font-medium text-foreground">
            Свободни места:{" "}
            <span className="font-bold text-primary tabular-nums">{remainingSlots}</span>
          </p>
        ) : null}
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          {isSoldOut && availability ? (
            <ServiceWaitlistOverlay availability={availability} />
          ) : null}
          <div
            className={cn(
              "contents",
              isSoldOut && "pointer-events-none select-none blur-sm opacity-60",
            )}
          >
          <div
            ref={mainPanelRef}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 opacity-0 translate-y-10"
          >
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="mb-5 text-sm text-pretty text-muted-foreground">
              Избери сам <span className="font-semibold text-foreground">ИЛИ</span>{" "}
              <Link
                href={`#${plansSectionId}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                избери нашите готови планове с до 15% отстъпка
              </Link>
            </p>
            <div className="mb-6 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Базов пакет
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {selectedOption?.name ?? service.name}
                  </h3>
                  {selectedOption?.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedOption.description}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 rounded-xl bg-background/80 px-3 py-2 text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Включено от</p>
                  <div className="flex items-end gap-1 sm:justify-end">
                    <Price value={price} layout="vertical" className="text-xl text-primary" />
                    <span className="pb-0.5 text-xs text-muted-foreground">
                      {basePackageFrequency}
                    </span>
                  </div>
                </div>
              </div>
              {service.features.length ? (
                <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {isAdding ? (
              <div className="mb-6 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : null}
            {(hasUpsells || companion) && !isAdding ? (
              <div className="mb-6 space-y-6">
                {hasUpsells ? (
                  <div>
                    <h3 className="font-semibold mb-3">Допълнителни услуги</h3>
                    <UpsellConfigurator
                      service={service}
                      value={upsells}
                      onChange={handleChange}
                      errors={errors}
                      analyticsPage={ctaPage ?? `/services/${service.slug}`}
                    />
                  </div>
                ) : null}
                {companion ? (
                  <div>
                    <h3 className="font-semibold mb-3">Комбинирай с</h3>
                    <ServiceCompanionOffer
                      config={companion}
                      included={includeCompanion}
                      onIncludedChange={setIncludeCompanion}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside
            ref={asideRef}
            className="hidden self-start lg:sticky lg:top-24 lg:block opacity-0 translate-y-10"
          >
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground mb-2">Общо</p>
              <div data-total-pulse className="mb-1 flex items-end gap-2">
                <Price value={totalPrice} layout="vertical" className="text-3xl text-primary" />
                {monthlyLabel ? <span className="pb-1 text-muted-foreground">{monthlyLabel}</span> : null}
              </div>
              <p className="mb-5 text-xs text-muted-foreground">Включва избраните допълнителни услуги</p>
              <Button
                onClick={handleAddClick}
                size="lg"
                disabled={isAdding || isSoldOut}
                analyticsCtaId={ctaId}
                analyticsPage={ctaPage ?? `/services/${service.slug}`}
                className="h-12 w-full px-6 text-base bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAdding ? "Обработка..." : ctaText}
              </Button>
            </div>
          </aside>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden",
          (!isActiveMobileSticky || isSoldOut) && "hidden"
        )}
      >
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Общо</p>
            <div data-total-pulse className="flex items-end gap-2">
              <Price
                value={totalPrice}
                layout="vertical"
                className="text-base sm:text-lg text-primary leading-none"
              />
              {monthlyLabel ? <span className="text-xs text-muted-foreground">{monthlyLabel}</span> : null}
            </div>
          </div>
          <Button
            onClick={handleAddClick}
            size="lg"
            disabled={isAdding || isSoldOut}
            analyticsCtaId={ctaId}
            analyticsPage={ctaPage ?? `/services/${service.slug}`}
            className="h-11 shrink-0 px-4 text-xs sm:text-sm bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isAdding ? "Обработка..." : ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
}
