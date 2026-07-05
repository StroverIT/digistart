"use client";

import { useEffect, useState } from "react";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
import {
  funnelWaveFills,
  SectionWave,
} from "@/components/services/service-funnel/section-wave";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { landingContainerClass } from "@/components/services/service-detail-ready-store-v2/shared";
import type { ServiceFunnelConfig } from "@/config/service-funnels/types";
import { getServiceById } from "@/lib/data/services";
import type { FunnelSlotAvailability, ServiceSlotAvailability } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { setCartForDirectCheckoutItems } from "@/lib/store/cart";

type FunnelCheckoutSectionProps = {
  config: ServiceFunnelConfig;
};

export function FunnelCheckoutSection({ config }: FunnelCheckoutSectionProps) {
  const { checkout, consultation, pagePath, analyticsCtaId, id: funnelId } = config;
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [availability, setAvailability] = useState<ServiceSlotAvailability | null>(null);

  const primaryItem = checkout?.items[0];
  const service = primaryItem ? getServiceById(primaryItem.serviceId) : undefined;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/funnel-slots?funnelId=${encodeURIComponent(funnelId)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("slots"))))
      .then((data: { availability?: FunnelSlotAvailability }) => {
        const row = data.availability;
        if (!row) {
          setAvailability(null);
          return;
        }
        setAvailability({
          serviceId: row.serviceId,
          serviceName: row.serviceName,
          slug: row.pagePath.split("/")[2] ?? "",
          capacity: row.capacity,
          paidCount: row.paidCount,
          remaining: row.remaining,
          isSoldOut: row.isSoldOut,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailability(null);
      });

    return () => controller.abort();
  }, [funnelId]);

  if (!checkout || !service || !primaryItem) {
    return null;
  }

  const lockedUpsells = primaryItem.upsells ?? [];

  const handleCheckout = () => {
    setIsAdding(true);
    const result = setCartForDirectCheckoutItems(checkout.items, { funnelId });

    if (!result.added) {
      setIsAdding(false);
      return;
    }

    const addedItems = result.cart.items.filter((item) =>
      checkout.items.some(
        (checkoutItem) =>
          item.serviceId === checkoutItem.serviceId &&
          item.selectedOptionId === checkoutItem.optionId,
      ),
    );

    if (addedItems.length > 0) {
      trackMetaAddToCart(addedItems.map(cartItemToMetaLineItem), {
        page_path: pagePath,
      });
    }

    setTimeout(() => {
      setIsAdding(false);
      push("/checkout");
    }, 250);
  };

  return (
    <section id="checkout" className="scroll-mt-28 bg-white">
      <div className={cn(landingContainerClass, "pt-10 pb-16 md:pt-12 md:pb-20")}>
        {checkout.header ? (
          <h2 className="mb-6 text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {checkout.header}
          </h2>
        ) : null}
        <ServiceBuySection
          service={service}
          price={checkout.pricing.total}
          upsells={lockedUpsells}
          priceSummary={{
            total: checkout.pricing.total,
            frequencyLabel: checkout.pricing.frequencyLabel ?? null,
            footnote: checkout.pricing.breakdownNote,
          }}
          onUpsellsChange={() => {}}
          onAddToCart={handleCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={primaryItem.optionId}
          ctaId={analyticsCtaId}
          ctaPage={pagePath}
          ctaLabel={checkout.ctaLabel ?? "Започни сега"}
          basePackageLabel={checkout.basePackageLabel}
          availability={availability}
          hideAdditionalServices
          features={checkout.planFeatures}
        />
        {consultation ? (
          <div className="mx-auto mt-10 max-w-3xl text-center md:mt-12">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {consultation.promptTitle}
            </h2>
            <a
              href="#consultation"
              className="mt-4 inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-8 text-base font-semibold text-foreground shadow-sm transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
            >
              {consultation.promptCtaLabel}
            </a>
          </div>
        ) : null}
      </div>
      <SectionWave fillClassName={funnelWaveFills.faq} />
    </section>
  );
}
