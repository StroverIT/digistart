"use client";

import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import {
  cartItemToMetaLineItem,
  trackMetaAddToCart,
} from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { addToCart, findCartItemByService, updateCartItemUpsells } from "@/lib/store/cart";
import type {
  CartBillingCycle,
  CartItemUpsell,
  Service,
  ServiceSlotAvailability,
} from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServicePlanPrice } from "@/lib/data/services";
import { PlansSection } from "@/components/plans/plans-section";
import { ServicePasLanding } from "@/components/services/service-pas-landing/service-pas-landing";
import { useServicePasScrollAnimations } from "@/components/services/service-pas-landing/use-service-pas-scroll-animations";
import {
  GOOGLE_BUSINESS_LANDING,
  GOOGLE_BUSINESS_PROFILE_OPTION_ID,
} from "@/config/service-landing/google-business";
import { useVisitorPreferences } from "@/components/visitor-preferences/visitor-preferences-provider";
import { personalizePasLanding } from "@/lib/visitor-preferences/personalize";

interface ServiceDetailGoogleBusinessProps {
  service: Service;
  availability?: ServiceSlotAvailability | null;
}

export function ServiceDetailGoogleBusiness({
  service,
  availability,
}: ServiceDetailGoogleBusinessProps) {
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  const pageRootRef = useRef<HTMLDivElement>(null);
  const { effectiveChannels, otherChannelLabel } = useVisitorPreferences();

  useServicePasScrollAnimations(pageRootRef);

  const planPrice = getServicePlanPrice(service, GOOGLE_BUSINESS_PROFILE_OPTION_ID);
  const content = useMemo(
    () => personalizePasLanding(GOOGLE_BUSINESS_LANDING, effectiveChannels, otherChannelLabel),
    [effectiveChannels, otherChannelLabel],
  );

  const scrollToBuySection = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGoogleCheckout = (options?: { billingCycle?: CartBillingCycle }) => {
    setIsAdding(true);
    const existing = findCartItemByService(service.id, GOOGLE_BUSINESS_PROFILE_OPTION_ID);
    if (existing) {
      updateCartItemUpsells(existing.id, upsells, options?.billingCycle);
      setIsAdding(false);
      return;
    }
    const result = addToCart(
      service.id,
      GOOGLE_BUSINESS_PROFILE_OPTION_ID,
      upsells,
      options?.billingCycle,
    );
    if (!result.added) {
      setIsAdding(false);
      return;
    }
    const addedItem = result.cart.items.find(
      (i) =>
        i.serviceId === service.id &&
        i.selectedOptionId === GOOGLE_BUSINESS_PROFILE_OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], {
        page_path: content.pagePath,
      });
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
      withPageBackground
      badgeIcon={<Search className="h-4 w-4" />}
      onHeroPrimaryClick={() => {
        trackCtaClick(content.pagePath, `${content.ctaIdPrefix}_scroll_to_buy`);
        scrollToBuySection();
      }}
    >
      <ServiceBuySection
        service={service}
        title="Готов ли си да спреш да губиш купувачи в търсенето?"
        price={planPrice}
        upsells={upsells}
        onUpsellsChange={setUpsells}
        onAddToCart={handleGoogleCheckout}
        isAdding={isAdding}
        cartSelectedOptionId={GOOGLE_BUSINESS_PROFILE_OPTION_ID}
        ctaId={`${content.ctaIdPrefix}_buy_section_add_to_cart`}
        ctaPage={content.pagePath}
        availability={availability}
      />
      <PlansSection compact className="py-12 md:py-16" />
    </ServicePasLanding>
  );
}
