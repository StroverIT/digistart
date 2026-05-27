"use client";

import { useMemo, useRef, useState } from "react";
import { Bot } from "lucide-react";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
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
import {
  AI_AUTOMATION_LANDING,
  AI_AUTOMATION_OPTION_ID,
  AI_AUTOMATION_SERVICE_ID,
} from "@/config/service-landing/ai-automation";
import { useVisitorPreferences } from "@/components/visitor-preferences/visitor-preferences-provider";
import { personalizePasLanding } from "@/lib/visitor-preferences/personalize";

interface ServiceDetailAiAutomationProps {
  headingFontClass?: string;
  bodyFontClass?: string;
  className?: string;
  serviceData?: Service;
  availability?: ServiceSlotAvailability | null;
}

export function ServiceDetailAiAutomation({
  headingFontClass,
  bodyFontClass,
  className,
  serviceData,
  availability,
}: ServiceDetailAiAutomationProps) {
  const service = serviceData ?? getServiceById(AI_AUTOMATION_SERVICE_ID);
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  const pageRootRef = useRef<HTMLDivElement>(null);
  const { effectiveChannels, otherChannelLabel } = useVisitorPreferences();

  useServicePasScrollAnimations(pageRootRef);

  const content = useMemo(
    () => personalizePasLanding(AI_AUTOMATION_LANDING, effectiveChannels, otherChannelLabel),
    [effectiveChannels, otherChannelLabel],
  );

  if (!service) return null;

  const planPrice = getServicePlanPrice(service, AI_AUTOMATION_OPTION_ID);

  const scrollToBuySection = () => {
    document.getElementById("buy-now")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCheckout = (options?: { billingCycle?: CartBillingCycle }) => {
    setIsAdding(true);
    const existing = findCartItemByService(AI_AUTOMATION_SERVICE_ID, AI_AUTOMATION_OPTION_ID);
    if (existing) {
      updateCartItemUpsells(existing.id, upsells, options?.billingCycle);
      setIsAdding(false);
      return;
    }
    const result = addToCart(
      AI_AUTOMATION_SERVICE_ID,
      AI_AUTOMATION_OPTION_ID,
      upsells,
      options?.billingCycle,
    );
    if (!result.added) {
      setIsAdding(false);
      return;
    }
    const addedItem = result.cart.items.find(
      (i) =>
        i.serviceId === AI_AUTOMATION_SERVICE_ID &&
        i.selectedOptionId === AI_AUTOMATION_OPTION_ID,
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
      badgeIcon={<Bot className="h-4 w-4" />}
      onHeroPrimaryClick={() => {
        trackCtaClick(content.pagePath, `${content.ctaIdPrefix}_scroll_to_buy`);
        scrollToBuySection();
      }}
    >
      <ServiceBuySection
        service={service}
        title="Готов ли си да оставиш рутинните DM на AI?"
        price={planPrice}
        upsells={upsells}
        onUpsellsChange={setUpsells}
        onAddToCart={handleCheckout}
        isAdding={isAdding}
        cartSelectedOptionId={AI_AUTOMATION_OPTION_ID}
        ctaId={`${content.ctaIdPrefix}_buy_section_add_to_cart`}
        ctaPage={content.pagePath}
        availability={availability}
      />
    </ServicePasLanding>
  );
}
