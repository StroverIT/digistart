"use client";

import { useMemo, useRef, useState } from "react";
import { Megaphone } from "lucide-react";
import {
  cartItemToMetaLineItem,
  trackMetaAddToCart,
} from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { Price } from "@/components/ui/price";
import { ADS_SOCIAL_MEDIA_COMPANION } from "@/lib/data/service-companions";
import { addOrUpdateServiceInCart } from "@/lib/store/cart";
import type { CartItemUpsell, Service, ServiceSlotAvailability } from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServicePlanPrice } from "@/lib/data/services";
import { PlansSection } from "@/components/plans/plans-section";
import { ServicePasLanding } from "@/components/services/service-pas-landing/service-pas-landing";
import { useServicePasScrollAnimations } from "@/components/services/service-pas-landing/use-service-pas-scroll-animations";
import { ADS_LANDING } from "@/config/service-landing/ads";
import { useVisitorPreferences } from "@/components/visitor-preferences/visitor-preferences-provider";
import { personalizePasLanding } from "@/lib/visitor-preferences/personalize";

interface ServiceDetailAdsProps {
  service: Service;
  availability?: ServiceSlotAvailability | null;
}

export function ServiceDetailAds({ service, availability }: ServiceDetailAdsProps) {
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  const pageRootRef = useRef<HTMLDivElement>(null);
  const { effectiveChannels, otherChannelLabel } = useVisitorPreferences();

  useServicePasScrollAnimations(pageRootRef);

  const planPrice = getServicePlanPrice(service);
  const content = useMemo(
    () => personalizePasLanding(ADS_LANDING, effectiveChannels, otherChannelLabel),
    [effectiveChannels, otherChannelLabel],
  );
  const optionId = service.options[0]?.id;

  const scrollToBuySection = () => {
    document.getElementById("buy-now")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAdsCheckout = (options?: { includeCompanion?: boolean }) => {
    setIsAdding(true);
    const result = addOrUpdateServiceInCart(service.id, optionId, upsells, {
      includeCompanion: options?.includeCompanion,
      companionServiceId: ADS_SOCIAL_MEDIA_COMPANION.serviceId,
      companionOptionId: ADS_SOCIAL_MEDIA_COMPANION.optionId,
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
      badgeIcon={<Megaphone className="h-4 w-4" />}
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
        title="Готов ли си рекламата да носи поръчки, не само покази?"
        price={planPrice}
        monthlyLabel="/месец"
        upsells={upsells}
        onUpsellsChange={setUpsells}
        onAddToCart={handleAdsCheckout}
        isAdding={isAdding}
        cartSelectedOptionId={optionId}
        companion={ADS_SOCIAL_MEDIA_COMPANION}
        ctaId={`${content.ctaIdPrefix}_buy_section_add_to_cart`}
        ctaPage={content.pagePath}
        availability={availability}
      />
      <PlansSection compact className="py-12 md:py-16" />
    </ServicePasLanding>
  );
}
