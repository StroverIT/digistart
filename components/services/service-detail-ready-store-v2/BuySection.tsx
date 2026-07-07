"use client";

import { useEffect, useRef, useState } from "react";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
import {
  ServiceBuyConsultationPrompt,
  type ServiceBuyConsultationConfig,
} from "@/components/services/service-buy-consultation-section";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServiceById, getServicePlanPrice } from "@/lib/data/services";
import {
  ONLINE_STORE_CONSULTATION,
  ONLINE_STORE_LANDING,
  ONLINE_STORE_OPTION_ID,
  ONLINE_STORE_SERVICE_ID,
} from "@/config/service-landing/online-store";
import type {
  CartBillingCycle,
  CartItemUpsell,
  FunnelSlotAvailability,
  ServiceSlotAvailability,
} from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import {
  addToCart,
  findCartItemByService,
  getCart,
  saveCart,
  updateCartItemUpsells,
} from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { landingContainerClass } from "./shared";
import { useLandingScrollAnimations } from "./use-landing-scroll-animations";

interface BuySectionProps {
  availability?: ServiceSlotAvailability | null;
  funnelId?: string;
  pagePath?: string;
  ctaId?: string;
  consultation?: ServiceBuyConsultationConfig;
}

function mapFunnelAvailability(row: FunnelSlotAvailability): ServiceSlotAvailability {
  return {
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    slug: row.pagePath.split("/")[2] ?? "",
    capacity: row.capacity,
    paidCount: row.paidCount,
    remaining: row.remaining,
    isSoldOut: row.isSoldOut,
  };
}

const BuySection = ({
  availability: initialAvailability,
  funnelId,
  pagePath = ONLINE_STORE_LANDING.pagePath,
  ctaId = `${ONLINE_STORE_LANDING.ctaIdPrefix}_buy_section_add_to_cart`,
  consultation = ONLINE_STORE_CONSULTATION,
}: BuySectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [availability, setAvailability] = useState<ServiceSlotAvailability | null>(
    initialAvailability ?? null,
  );
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.1 });

  useEffect(() => {
    if (initialAvailability) return;

    const controller = new AbortController();
    const slotsUrl = funnelId
      ? `/api/funnel-slots?funnelId=${encodeURIComponent(funnelId)}`
      : `/api/service-slots?serviceId=${encodeURIComponent(ONLINE_STORE_SERVICE_ID)}`;

    fetch(slotsUrl, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("slots"))))
      .then(
        (data: {
          availability?: ServiceSlotAvailability | FunnelSlotAvailability;
        }) => {
          const row = data.availability;
          if (!row) {
            setAvailability(null);
            return;
          }

          if ("funnelId" in row) {
            setAvailability(mapFunnelAvailability(row));
            return;
          }

          setAvailability(row);
        },
      )
      .catch(() => {
        if (!controller.signal.aborted) setAvailability(null);
      });

    return () => controller.abort();
  }, [funnelId, initialAvailability]);

  const service = getServiceById(ONLINE_STORE_SERVICE_ID);
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);

  if (!service) return null;

  const planPrice = getServicePlanPrice(service, ONLINE_STORE_OPTION_ID);

  const handleCheckout = (options?: { billingCycle?: CartBillingCycle }) => {
    setIsAdding(true);
    const existing = findCartItemByService(ONLINE_STORE_SERVICE_ID, ONLINE_STORE_OPTION_ID);
    if (existing) {
      updateCartItemUpsells(existing.id, upsells, options?.billingCycle);
      if (funnelId) {
        const cart = getCart();
        cart.funnelId = funnelId;
        saveCart(cart);
      }
      setIsAdding(false);
      return;
    }

    const result = addToCart(
      ONLINE_STORE_SERVICE_ID,
      ONLINE_STORE_OPTION_ID,
      upsells,
      options?.billingCycle,
    );
    if (!result.added) {
      setIsAdding(false);
      return;
    }

    if (funnelId) {
      const cart = getCart();
      cart.funnelId = funnelId;
      saveCart(cart);
    }

    const addedItem = result.cart.items.find(
      (item) =>
        item.serviceId === ONLINE_STORE_SERVICE_ID &&
        item.selectedOptionId === ONLINE_STORE_OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], {
        page_path: pagePath,
      });
    }

    setTimeout(() => {
      setIsAdding(false);
      push("/cart");
    }, 250);
  };

  return (
    <section
      ref={sectionRef}
      id="buy-section"
      className="scroll-mt-28 border-b border-border/60 bg-muted/20"
    >
      <div className={cn(landingContainerClass, "pb-10 md:pb-16")}>
        <ServiceBuySection
          service={service}
          header="Готов ли си за продажби?"
          price={planPrice}
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={ONLINE_STORE_OPTION_ID}
          ctaId={ctaId}
          ctaPage={pagePath}
          ctaLabel="Купи сега"
          availability={availability}
        />
        <ServiceBuyConsultationPrompt consultation={consultation} />
      </div>
    </section>
  );
};

export default BuySection;
