"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import {
  cartItemToMetaLineItem,
  trackMetaAddToCart,
} from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { Price } from "@/components/ui/price";
import { addToCart, findCartItemByService, updateCartItemUpsells } from "@/lib/store/cart";
import type { CartItemUpsell, Service } from "@/lib/types";
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

interface ServiceDetailGoogleBusinessProps {
  service: Service;
}

export function ServiceDetailGoogleBusiness({ service }: ServiceDetailGoogleBusinessProps) {
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  const pageRootRef = useRef<HTMLDivElement>(null);

  useServicePasScrollAnimations(pageRootRef);

  const planPrice = getServicePlanPrice(service, GOOGLE_BUSINESS_PROFILE_OPTION_ID);
  const content = GOOGLE_BUSINESS_LANDING;

  const scrollToBuySection = () => {
    document.getElementById("buy-now")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGoogleCheckout = () => {
    setIsAdding(true);
    const existing = findCartItemByService(service.id, GOOGLE_BUSINESS_PROFILE_OPTION_ID);
    if (existing) {
      updateCartItemUpsells(existing.id, upsells);
      setIsAdding(false);
      return;
    }
    const result = addToCart(service.id, GOOGLE_BUSINESS_PROFILE_OPTION_ID, upsells);
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
      priceSlot={
        <div className="flex items-baseline gap-2">
          <Price value={planPrice} className="text-3xl sm:text-4xl text-primary" />
          <span className="text-muted-foreground">еднократно</span>
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
        title="Купи сега"
        price={planPrice}
        upsells={upsells}
        onUpsellsChange={setUpsells}
        onAddToCart={handleGoogleCheckout}
        isAdding={isAdding}
        cartSelectedOptionId={GOOGLE_BUSINESS_PROFILE_OPTION_ID}
        ctaId={`${content.ctaIdPrefix}_buy_section_add_to_cart`}
        ctaPage={content.pagePath}
      />
      <PlansSection compact className="py-12 md:py-16" />
    </ServicePasLanding>
  );
}
