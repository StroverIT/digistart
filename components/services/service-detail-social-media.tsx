"use client";

import { useRef, useState } from "react";
import { Smartphone } from "lucide-react";
import {
  cartItemToMetaLineItem,
  trackMetaAddToCart,
} from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { Price } from "@/components/ui/price";
import { SOCIAL_MEDIA_ADS_COMPANION } from "@/lib/data/service-companions";
import { addOrUpdateServiceInCart } from "@/lib/store/cart";
import type { CartItemUpsell, Service } from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServicePlanPrice } from "@/lib/data/services";
import { PlansSection } from "@/components/plans/plans-section";
import { ServicePasLanding } from "@/components/services/service-pas-landing/service-pas-landing";
import { useServicePasScrollAnimations } from "@/components/services/service-pas-landing/use-service-pas-scroll-animations";
import { SOCIAL_MEDIA_LANDING } from "@/config/service-landing/social-media";

interface ServiceDetailSocialMediaProps {
  service: Service;
}

export function ServiceDetailSocialMedia({ service }: ServiceDetailSocialMediaProps) {
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  const pageRootRef = useRef<HTMLDivElement>(null);

  useServicePasScrollAnimations(pageRootRef);

  const planPrice = getServicePlanPrice(service);
  const content = SOCIAL_MEDIA_LANDING;
  const optionId = service.options[0]?.id;

  const scrollToBuySection = () => {
    document.getElementById("buy-now")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMarketingCheckout = (options?: { includeCompanion?: boolean }) => {
    setIsAdding(true);
    const result = addOrUpdateServiceInCart(service.id, optionId, upsells, {
      includeCompanion: options?.includeCompanion,
      companionServiceId: SOCIAL_MEDIA_ADS_COMPANION.serviceId,
      companionOptionId: SOCIAL_MEDIA_ADS_COMPANION.optionId,
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
      backCtaId={`${content.ctaIdPrefix}_back_to_services`}
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
      />
      <PlansSection compact className="py-12 md:py-16" />
    </ServicePasLanding>
  );
}
