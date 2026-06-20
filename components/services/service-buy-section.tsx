"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCompanionOffer } from "@/components/services/service-companion-offer";
import type { ServiceCompanionOfferConfig } from "@/lib/types";
import { ServiceUpsellsSection } from "@/components/services/service-upsells-section";
import {
  validateUpsellEntries,
  type UpsellEntryErrors,
} from "@/components/services/upsell-validation";
import type { CartBillingCycle, CartItemUpsell, Service } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";
import {
  ANNUAL_PREPAY_DISCOUNT_RATE,
  calculateItemTotal,
} from "@/lib/pricing/calculate-item-total";
import {
  adminPreviewTotalPrice,
  isAdminCheckoutRole,
} from "@/lib/pricing/admin-checkout-pricing";
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

function formatSavedMonths(months: number) {
  if (!Number.isFinite(months) || months <= 0) {
    return "Спестяваш от цялата годишна сума.";
  }

  if (months > 2 && months < 3) {
    return "Спестяваш почти 3 месеца.";
  }

  const roundedMonths = Math.round(months);
  const monthLabel = roundedMonths === 1 ? "месец" : "месеца";
  return `Спестяваш ${roundedMonths} ${monthLabel}.`;
}

interface ServiceBuySectionProps {
  service: Service;
  title?: string;
  price: number;
  monthlyLabel?: string;
  header?: string;
  ctaLabel?: string;
  upsells: CartItemUpsell[];
  onUpsellsChange: (nextUpsells: CartItemUpsell[]) => void;
  onAddToCart: (options?: {
    includeCompanion?: boolean;
    billingCycle?: CartBillingCycle;
  }) => void;
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
  /** Extra controls rendered inside the base package card (e.g. required channel pickers). */
  basePackageExtra?: ReactNode;
  /** Upsell ids hidden from the additional services configurator. */
  hiddenUpsellIds?: string[];
  /** Return an error message to block add-to-cart, or null when valid. */
  validateBeforeAdd?: () => string | null;
  /** Custom upsell UI rendered in the additional services section. */
  customUpsellsContent?: ReactNode;
  /** Hides upsells and companion blocks (e.g. minimal buy UI). */
  hideAdditionalServices?: boolean;
}

export { ServiceUpsellsSection } from "@/components/services/service-upsells-section";
export type { ServiceUpsellsSectionProps } from "@/components/services/service-upsells-section";

export function ServiceBuySection({
  service,
  title,
  price,
  monthlyLabel,
  header,
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
  basePackageExtra,
  hiddenUpsellIds = [],
  validateBeforeAdd,
  customUpsellsContent,
  hideAdditionalServices = false,
}: ServiceBuySectionProps) {
  const { data: session } = useSession();
  const isAdminCheckout = isAdminCheckoutRole(session?.user?.role);
  const { push } = useTransitionRouter();
  const [includeCompanion, setIncludeCompanion] = useState(false);
  const [billingCycle, setBillingCycle] = useState<CartBillingCycle>("monthly");
  const [errors, setErrors] = useState<UpsellEntryErrors>({});
  const [serviceInCart, setServiceInCart] = useState(false);
  const hadCartLineRef = useRef(false);
  const [mobileStickyId] = useState(() => `service-buy-mobile-${Math.random().toString(36).slice(2)}`);
  const [isActiveMobileSticky, setIsActiveMobileSticky] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const basicPackageRef = useRef<HTMLDivElement>(null);
  const mobileStickyRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const mainPanelRevealedRef = useRef(false);
  const basicPackageInViewRef = useRef(false);
  const [isMobileStickyRevealReady, setIsMobileStickyRevealReady] = useState(false);

  const visibleUpsells = useMemo(
    () => service.upsells.filter((upsell) => !hiddenUpsellIds.includes(upsell.id)),
    [hiddenUpsellIds, service.upsells],
  );
  const hasUpsells =
    !hideAdditionalServices &&
    (visibleUpsells.length > 0 || Boolean(customUpsellsContent));
  const selectedOption = useMemo(
    () => service.options.find((option) => option.id === cartSelectedOptionId) ?? service.options[0],
    [cartSelectedOptionId, service.options],
  );

  const ctaText =
    ctaLabel ?? (serviceInCart ? "Промени в кошницата" : "Добави в кошницата");
  const isSoldOut = availability?.isSoldOut ?? false;

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
        setBillingCycle(item.billingCycle ?? "monthly");
        hadCartLineRef.current = true;
      } else if (hadCartLineRef.current) {
        onUpsellsChange([]);
        setBillingCycle("monthly");
        hadCartLineRef.current = false;
      }
    };
    syncFromCart();
    window.addEventListener("cart-updated", syncFromCart);
    return () => window.removeEventListener("cart-updated", syncFromCart);
  }, [service.id, cartSelectedOptionId, onUpsellsChange]);

  const serviceMonthlyTotals = useMemo(
    () =>
      selectedOption
        ? calculateItemTotal(service.id, selectedOption.id, upsells, "monthly")
        : { total: price, oneTimeTotal: 0, monthlyTotal: price },
    [price, selectedOption, service.id, upsells],
  );

  const companionMonthlyTotals = useMemo(() => {
    if (!companion || !includeCompanion) {
      return { total: 0, oneTimeTotal: 0, monthlyTotal: 0 };
    }
    const companionService = getServiceById(companion.serviceId);
    const option = companionService?.options.find((o) => o.id === companion.optionId);
    if (!option) return { total: 0, oneTimeTotal: 0, monthlyTotal: 0 };
    return {
      total: option.price,
      oneTimeTotal: option.isMonthly ? 0 : option.price,
      monthlyTotal: option.isMonthly ? option.price : 0,
    };
  }, [companion, includeCompanion]);

  const canPrepayAnnually =
    serviceMonthlyTotals.monthlyTotal + companionMonthlyTotals.monthlyTotal > 0;
  const effectiveBillingCycle: CartBillingCycle =
    canPrepayAnnually ? billingCycle : "monthly";

  const totalPrice = useMemo(() => {
    if (isAdminCheckout) {
      return adminPreviewTotalPrice();
    }
    const subtotal =
      serviceMonthlyTotals.oneTimeTotal +
      companionMonthlyTotals.oneTimeTotal +
      serviceMonthlyTotals.monthlyTotal * 12 +
      companionMonthlyTotals.monthlyTotal * 12;
    if (effectiveBillingCycle === "annual-prepaid") {
      return Math.round(subtotal * (1 - ANNUAL_PREPAY_DISCOUNT_RATE) * 100) / 100;
    }
    return serviceMonthlyTotals.total + companionMonthlyTotals.total;
  }, [
    companionMonthlyTotals,
    effectiveBillingCycle,
    isAdminCheckout,
    serviceMonthlyTotals,
  ]);

  const annualPrepaySubtotal =
    serviceMonthlyTotals.oneTimeTotal +
    companionMonthlyTotals.oneTimeTotal +
    serviceMonthlyTotals.monthlyTotal * 12 +
    companionMonthlyTotals.monthlyTotal * 12;
  const annualDiscountAmount =
    Math.round(annualPrepaySubtotal * ANNUAL_PREPAY_DISCOUNT_RATE * 100) / 100;
  const annualDiscountPercent = Math.round(ANNUAL_PREPAY_DISCOUNT_RATE * 100);
  const annualSavingsMonths =
    annualDiscountAmount /
    (serviceMonthlyTotals.monthlyTotal + companionMonthlyTotals.monthlyTotal);
  const annualSavingsDescription = formatSavedMonths(annualSavingsMonths);
  const totalFrequencyLabel =
    effectiveBillingCycle === "annual-prepaid"
      ? "за 1 година"
      : monthlyLabel ?? (serviceMonthlyTotals.monthlyTotal > 0 ? "/месец" : null);

  useEffect(() => {
    if (!canPrepayAnnually && billingCycle === "annual-prepaid") {
      setBillingCycle("monthly");
    }
  }, [billingCycle, canPrepayAnnually]);

  const handleChange = (nextUpsells: CartItemUpsell[]) => {
    onUpsellsChange(nextUpsells);
    const validation = validateUpsellEntries(service.upsells, nextUpsells);
    setErrors(validation.errors);
  };

  const handleAddClick = () => {
    if (isSoldOut) return;
    const customValidationError = validateBeforeAdd?.();
    if (customValidationError) {
      toast.error(customValidationError);
      return;
    }
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
      companion && includeCompanion
        ? { includeCompanion: true, billingCycle: effectiveBillingCycle }
        : { billingCycle: effectiveBillingCycle },
    );
    if (wasInCart) {
      push("/cart");
    }
  };

  const syncMobileStickyRevealReady = () => {
    setIsMobileStickyRevealReady(
      mainPanelRevealedRef.current && basicPackageInViewRef.current,
    );
  };

  useEffect(() => {
    const section = sectionRef.current;
    const main = mainPanelRef.current;
    const aside = asideRef.current;
    const basicPackage = basicPackageRef.current;
    const mobileSticky = mobileStickyRef.current;
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
        onComplete: () => {
          mainPanelRevealedRef.current = true;
          syncMobileStickyRevealReady();
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

      if (mobileSticky) {
        gsap.set(mobileSticky, { autoAlpha: 0, y: 20, pointerEvents: "none" });
      }

      if (basicPackage) {
        ScrollTrigger.matchMedia({
          "(max-width: 1023px)": () => {
            ScrollTrigger.create({
              trigger: basicPackage,
              start: "bottom 85%",
              endTrigger: section,
              end: "bottom top",
              onToggle: (self) => {
                basicPackageInViewRef.current = self.isActive;
                syncMobileStickyRevealReady();
              },
            });
          },
        });
      }
    }, section);

    return () => {
      mainPanelRevealedRef.current = false;
      basicPackageInViewRef.current = false;
      setIsMobileStickyRevealReady(false);
      ctx.revert();
    };
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

  useEffect(() => {
    const el = mobileStickyRef.current;
    if (!el) return;

    const shouldShow = isActiveMobileSticky && !isSoldOut && isMobileStickyRevealReady;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      gsap.set(el, {
        autoAlpha: shouldShow ? 1 : 0,
        y: 0,
        pointerEvents: shouldShow ? "auto" : "none",
      });
      return;
    }

    const ctx = gsap.context(() => {
      if (shouldShow) {
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
          onStart: () => {
            gsap.set(el, { pointerEvents: "auto" });
          },
        });
      } else {
        gsap.to(el, {
          autoAlpha: 0,
          y: 20,
          duration: 0.25,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => {
            gsap.set(el, { pointerEvents: "none" });
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [isActiveMobileSticky, isSoldOut, isMobileStickyRevealReady]);

  return (
    <section ref={sectionRef} id="buy-now" data-animate-section className="py-12 md:pt-16 md:pb-12">
      <h2
        data-animate-reveal
        className="mb-6 text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl opacity-0 translate-y-10"
      >
        {header}
      </h2>
      <div className="container mx-auto px-4">
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          {isSoldOut && availability ? (
            <ServiceWaitlistOverlay availability={availability} />
          ) : null}
          <div
            ref={mainPanelRef}
            className={cn(
              "rounded-[2rem] bg-card p-6 sm:p-8 opacity-0 translate-y-10 shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.04]",
              isSoldOut && "pointer-events-none select-none blur-[2px] opacity-80",
            )}
          >
            {canPrepayAnnually ? (
              <div
                className={cn(
                  "mb-8 rounded-2xl bg-muted/40 p-1.5",
                  isSoldOut && "pointer-events-none select-none blur-[2px] opacity-80",
                )}
              >
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={cn(
                      "rounded-xl px-4 py-3 text-left transition-all",
                      effectiveBillingCycle === "monthly"
                        ? "bg-card shadow-sm"
                        : "hover:bg-card/50",
                    )}
                  >
                    <span className="block text-sm font-semibold text-foreground">Месечно</span>
                    <span className="mt-1 block text-xs text-foreground/65">
                      Може по всяко време да се откажеш
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual-prepaid")}
                    className={cn(
                      "relative rounded-xl px-4 py-3 pr-14 text-left transition-all",
                      effectiveBillingCycle === "annual-prepaid"
                        ? "bg-card shadow-sm"
                        : "hover:bg-card/50",
                    )}
                  >
                    <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground shadow-sm">
                      -{annualDiscountPercent}%
                    </span>
                    <span className="block text-sm font-semibold text-foreground">За година</span>
                    <span className="mt-1 block text-xs text-foreground/65">
                      {annualSavingsDescription}
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            {service.slug !== "online-store" && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
            {service.slug !== "online-store" && (
              <p className="mb-6 text-sm text-pretty text-muted-foreground">
                Избери сам <span className="font-semibold text-foreground">ИЛИ</span>{" "}
                <Link
                  href={`#${plansSectionId}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  избери нашите готови планове с до 15% отстъпка
                </Link>
              </p>
            )}
            <div ref={basicPackageRef}>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                Базов пакет
              </p>
              <h3 className="mt-2 font-heading text-xl font-bold text-foreground sm:text-2xl">
                {selectedOption?.name ?? service.name}
              </h3>
              {service.features.length ? (
                <ul className="mt-5 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-foreground/80">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-accent"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {basePackageExtra}
            </div>
            {isAdding ? (
              <div className="mt-8 space-y-3 border-t border-border/40 pt-8">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : null}
            {(hasUpsells || (!hideAdditionalServices && companion)) && !isAdding ? (
              <div className="mt-8 space-y-6 border-t border-border/40 pt-8">
                {hasUpsells ? (
                  <ServiceUpsellsSection
                    service={service}
                    upsells={upsells}
                    onUpsellsChange={handleChange}
                    hiddenUpsellIds={hiddenUpsellIds}
                    customUpsellsContent={customUpsellsContent}
                    errors={errors}
                    analyticsPage={ctaPage ?? `/services/${service.slug}`}
                  />
                ) : null}
                {!hideAdditionalServices && companion ? (
                  <div>
                    <h3 className="mb-3 font-semibold">Комбинирай с</h3>
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
            className={cn(
              "hidden self-start lg:sticky lg:top-30 lg:block opacity-0 translate-y-10",
              isSoldOut && "pointer-events-none select-none blur-[2px] opacity-80",
            )}
          >
            <div className="rounded-[2rem] bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.04]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Общо</p>
              <div data-total-pulse className="mb-1 flex items-end gap-2">
                <Price value={totalPrice} layout="vertical" className="text-3xl text-accent" />
                {totalFrequencyLabel ? (
                  <span className="pb-1 text-muted-foreground">{totalFrequencyLabel}</span>
                ) : null}
              </div>
              <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
                {effectiveBillingCycle === "annual-prepaid"
                  ? `Включва 12 месеца, еднократните суми и ${annualDiscountPercent}% отстъпка`
                  : "Включва избраните допълнителни услуги"}
              </p>
              <Button
                onClick={handleAddClick}
                size="lg"
                disabled={isAdding || isSoldOut}
                analyticsCtaId={ctaId}
                analyticsPage={ctaPage ?? `/services/${service.slug}`}
                className="h-12 w-full rounded-full px-6 text-base font-semibold shadow-[var(--shadow-glow)]"
              >
                {isAdding ? "Обработка..." : ctaText}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <div
        ref={mobileStickyRef}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 invisible opacity-0 pointer-events-none lg:hidden"
        aria-hidden={!isActiveMobileSticky || isSoldOut || !isMobileStickyRevealReady}
      >
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Общо</p>
            <div data-total-pulse className="flex items-end gap-2">
              <Price
                value={totalPrice}
                layout="vertical"
                className="text-base sm:text-lg text-accent leading-none"
              />
              {totalFrequencyLabel ? (
                <span className="text-xs text-muted-foreground">{totalFrequencyLabel}</span>
              ) : null}
            </div>
          </div>
          <Button
            onClick={handleAddClick}
            size="lg"
            disabled={isAdding || isSoldOut}
            analyticsCtaId={ctaId}
            analyticsPage={ctaPage ?? `/services/${service.slug}`}
            className="h-11 shrink-0 rounded-full px-4 text-xs font-semibold sm:text-sm shadow-[var(--shadow-glow)]"
          >
            {isAdding ? "Обработка..." : ctaText}
          </Button>
        </div>
      </div>
    </section >
  );
}
