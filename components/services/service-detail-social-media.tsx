"use client";

import { useMemo, useRef, useState } from "react";
import { Smartphone } from "lucide-react";
import {
  cartItemToMetaLineItem,
  trackMetaAddToCart,
} from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { Price } from "@/components/ui/price";
import { SOCIAL_MEDIA_ADS_COMPANION } from "@/lib/data/service-companions";
import { addOrUpdateServiceInCart } from "@/lib/store/cart";
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
import { SOCIAL_MEDIA_LANDING } from "@/config/service-landing/social-media";
import { useVisitorPreferences } from "@/components/visitor-preferences/visitor-preferences-provider";
import { personalizePasLanding } from "@/lib/visitor-preferences/personalize";

interface ServiceDetailSocialMediaProps {
  service: Service;
  availability?: ServiceSlotAvailability | null;
}

export function ServiceDetailSocialMedia({
  service,
  availability,
}: ServiceDetailSocialMediaProps) {
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  const pageRootRef = useRef<HTMLDivElement>(null);
  const { effectiveChannels, otherChannelLabel } = useVisitorPreferences();

  useServicePasScrollAnimations(pageRootRef);

  const planPrice = getServicePlanPrice(service);
  const content = useMemo(
    () => personalizePasLanding(SOCIAL_MEDIA_LANDING, effectiveChannels, otherChannelLabel),
    [effectiveChannels, otherChannelLabel],
  );
  const optionId = service.options[0]?.id;

  const scrollToBuySection = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMarketingCheckout = (options?: {
    includeCompanion?: boolean;
    billingCycle?: CartBillingCycle;
  }) => {
    setIsAdding(true);
    const result = addOrUpdateServiceInCart(service.id, optionId, upsells, {
      includeCompanion: options?.includeCompanion,
      companionServiceId: SOCIAL_MEDIA_ADS_COMPANION.serviceId,
      companionOptionId: SOCIAL_MEDIA_ADS_COMPANION.optionId,
      billingCycle: options?.billingCycle,
    });
    if (!result.added && result.reason === "duplicate") {
      setIsAdding(false);
      return;
    }
    if (!result.added) {
      setIsAdding(false);
      return;
    }
    const addedItem = result.cart.items.find(
      (i) => i.serviceId === service.id && i.selectedOptionId === optionId,
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
      badgeIcon={<Smartphone className="h-4 w-4" />}
      priceSlot={
        <div className="flex items-baseline gap-2">
          <span className="text-muted-foreground text-lg">от</span>
          <Price value={planPrice} className="text-3xl sm:text-4xl text-primary" />
          <span className="text-muted-foreground">/месец</span>
        </div>
      }
      onHeroPrimaryClick={() => {
        trackCtaClick(content.pagePath, `${content.ctaIdPrefix}_scroll_to_buy`);
        scrollToBuySection();
      }}
    >
      <ServiceBuySection
        service={service}
        title="Готов ли си feed-ът да работи без теб?"
        price={planPrice}
        monthlyLabel="/месец"
        upsells={upsells}
        onUpsellsChange={setUpsells}
        onAddToCart={handleMarketingCheckout}
        isAdding={isAdding}
        cartSelectedOptionId={optionId}
        companion={SOCIAL_MEDIA_ADS_COMPANION}
        ctaId={`${content.ctaIdPrefix}_buy_section_add_to_cart`}
        ctaPage={content.pagePath}
        availability={availability}
      />
      <PlansSection compact className="py-12 md:py-16" />
    </ServicePasLanding>
  );
}
