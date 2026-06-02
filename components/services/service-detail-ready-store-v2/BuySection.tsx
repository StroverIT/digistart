"use client";

import { useState } from "react";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServiceById, getServicePlanPrice } from "@/lib/data/services";
import {
  ONLINE_STORE_LANDING,
  ONLINE_STORE_OPTION_ID,
  ONLINE_STORE_SERVICE_ID,
} from "@/config/service-landing/online-store";
import type {
  CartBillingCycle,
  CartItemUpsell,
  ServiceSlotAvailability,
} from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { addToCart, findCartItemByService, updateCartItemUpsells } from "@/lib/store/cart";

interface BuySectionProps {
  availability?: ServiceSlotAvailability | null;
}

const BuySection = ({ availability }: BuySectionProps) => {
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
      (item) =>
        item.serviceId === ONLINE_STORE_SERVICE_ID &&
        item.selectedOptionId === ONLINE_STORE_OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], {
        page_path: ONLINE_STORE_LANDING.pagePath,
      });
    }

    setTimeout(() => {
      setIsAdding(false);
      push("/cart");
    }, 250);
  };

  return (
    <ServiceBuySection
      service={service}
      title="Готов ли си за продажби?"
      price={planPrice}
      upsells={upsells}
      onUpsellsChange={setUpsells}
      onAddToCart={handleCheckout}
      isAdding={isAdding}
      cartSelectedOptionId={ONLINE_STORE_OPTION_ID}
      ctaId={`${ONLINE_STORE_LANDING.ctaIdPrefix}_buy_section_add_to_cart`}
      ctaPage={ONLINE_STORE_LANDING.pagePath}
      availability={availability}
    />
  );
};

export default BuySection;
