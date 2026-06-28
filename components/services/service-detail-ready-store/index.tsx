"use client";

import { useMemo, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { Price } from "@/components/ui/price";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServiceById, getServicePlanPrice } from "@/lib/data/services";
import type {
  CartBillingCycle,
  CartItemUpsell,
  Service,
  ServiceSlotAvailability,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { addToCart, findCartItemByService, updateCartItemUpsells } from "@/lib/store/cart";
import { PlansSection } from "@/components/plans/plans-section";
import { ServicePasLanding } from "@/components/services/service-pas-landing/service-pas-landing";
import { useServicePasScrollAnimations } from "@/components/services/service-pas-landing/use-service-pas-scroll-animations";
import { TemplatesShowcaseSection } from "@/components/templates/templates-showcase-section";
import {
  ONLINE_STORE_LANDING,
  ONLINE_STORE_OPTION_ID,
  ONLINE_STORE_SERVICE_ID,
} from "@/config/service-landing/online-store";
import { useVisitorPreferences } from "@/components/visitor-preferences/visitor-preferences-provider";
import { personalizePasLanding } from "@/lib/visitor-preferences/personalize";

interface ServiceDetailReadyStoreProps {
  headingFontClass?: string;
  bodyFontClass?: string;
  className?: string;
  serviceData?: Service;
  availability?: ServiceSlotAvailability | null;
}

export function ServiceDetailReadyStore({
  headingFontClass,
  bodyFontClass,
  className,
  serviceData,
  availability,
}: ServiceDetailReadyStoreProps) {
  const service = serviceData ?? getServiceById(ONLINE_STORE_SERVICE_ID);
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  const pageRootRef = useRef<HTMLDivElement>(null);
  const { effectiveChannels, otherChannelLabel } = useVisitorPreferences();

  useServicePasScrollAnimations(pageRootRef);

  const content = useMemo(
    () => personalizePasLanding(ONLINE_STORE_LANDING, effectiveChannels, otherChannelLabel),
    [effectiveChannels, otherChannelLabel],
  );

  if (!service) return null;

  const planPrice = getServicePlanPrice(service, ONLINE_STORE_OPTION_ID);

  const scrollToBuySection = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCheckout = (options?: { billingCycle?: CartBillingCycle }) => {
    setIsAdding(true);
    const existing = findCartItemByService(ONLINE_STORE_SERVICE_ID, ONLINE_STORE_OPTION_ID);
    if (existing) {
      updateCartItemUpsells(existing.id, upsells, options?.billingCycle);
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
    const addedItem = result.cart.items.find(
      (i) =>
        i.serviceId === ONLINE_STORE_SERVICE_ID &&
        i.selectedOptionId === ONLINE_STORE_OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], { page_path: content.pagePath });
    }
    setTimeout(() => {
      setIsAdding(false);
      push("/cart");
    }, 250);
  };

  return (
    <ServicePasLanding
      content={content}
      pageRootRef={pageRootRef}
      headingFontClass={headingFontClass}
      className={cn("pb-12 md:pb-16", bodyFontClass, className)}
      badgeIcon={<ShoppingCart className="h-4 w-4" />}
      onHeroPrimaryClick={() => {
        trackCtaClick(content.pagePath, `${content.ctaIdPrefix}_scroll_to_buy`);
        scrollToBuySection();
      }}
      beforeFaq={
        <TemplatesShowcaseSection headingFontClass={headingFontClass} />
      }
    >
      <ServiceBuySection
        service={service}
        title="Готов ли си да излезеш от чата?"
        price={planPrice}
        upsells={upsells}
        onUpsellsChange={setUpsells}
        onAddToCart={handleCheckout}
        isAdding={isAdding}
        cartSelectedOptionId={ONLINE_STORE_OPTION_ID}
        ctaId={`${content.ctaIdPrefix}_buy_section_add_to_cart`}
        ctaPage={content.pagePath}
        availability={availability}
      />

    </ServicePasLanding>
  );
}
