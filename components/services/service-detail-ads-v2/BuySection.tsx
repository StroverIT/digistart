"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { useAdsServiceUpsells } from "@/components/services/use-ads-service-upsells";
import {
  getAdsBaseChannelChoiceId,
  getAdsBuySectionFeatures,
  getAdsChannelPickerValue,
  getDefaultAdsChannelUpsells,
  normalizeAdsChannelUpsells,
} from "@/lib/data/ads-channels";
import { getServiceById, getServicePlanPrice } from "@/lib/data/services";
import { ADS_LANDING } from "@/config/service-landing/ads";
import type { CartBillingCycle, CartItemUpsell, ServiceSlotAvailability } from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { addOrUpdateServiceInCart } from "@/lib/store/cart";
import { landingContainerClass } from "@/components/services/service-detail-ready-store-v2/shared";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const ADS_SERVICE_ID = "ads";
const ADS_OPTION_ID = "default";

interface BuySectionProps {
  availability?: ServiceSlotAvailability | null;
}

function AdsBuySectionContent({
  service,
  availability,
}: {
  service: NonNullable<ReturnType<typeof getServiceById>>;
  availability: ServiceSlotAvailability | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>(() => getDefaultAdsChannelUpsells());
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.1 });

  const handleUpsellsChange = useCallback((nextUpsells: CartItemUpsell[]) => {
    const resolved = getAdsBaseChannelChoiceId(nextUpsells)
      ? nextUpsells
      : getDefaultAdsChannelUpsells();
    setUpsells(normalizeAdsChannelUpsells(resolved));
  }, []);

  const adsUpsells = useAdsServiceUpsells({
    service,
    upsells,
    onUpsellsChange: handleUpsellsChange,
  });

  const planPrice = getServicePlanPrice(service, ADS_OPTION_ID);
  const selectedChannel = getAdsChannelPickerValue(upsells);
  const features = useMemo(
    () => getAdsBuySectionFeatures(service.features, selectedChannel),
    [service.features, selectedChannel],
  );

  const handleCheckout = (options?: { billingCycle?: CartBillingCycle }) => {
    setIsAdding(true);
    const result = addOrUpdateServiceInCart(ADS_SERVICE_ID, ADS_OPTION_ID, upsells, {
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
      (item) => item.serviceId === ADS_SERVICE_ID && item.selectedOptionId === ADS_OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], {
        page_path: ADS_LANDING.pagePath,
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
      <div className={landingContainerClass}>
        <ServiceBuySection
          service={service}
          header="Готов ли си за продажби?"
          price={planPrice}
          monthlyLabel="/месец"
          upsells={upsells}
          onUpsellsChange={adsUpsells.handleUpsellsChange}
          onAddToCart={handleCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={ADS_OPTION_ID}
          ctaId={`${ADS_LANDING.ctaIdPrefix}_buy_section_add_to_cart`}
          ctaPage={ADS_LANDING.pagePath}
          availability={availability}
          hiddenUpsellIds={adsUpsells.hiddenUpsellIds}
          validateBeforeAdd={adsUpsells.validateBeforeAdd}
          basePackageExtra={adsUpsells.basePackageExtra}
          features={features}
          hideAdditionalServices
        />
      </div>
    </section>
  );
}

const BuySection = ({ availability: initialAvailability }: BuySectionProps) => {
  const [availability, setAvailability] = useState<ServiceSlotAvailability | null>(
    initialAvailability ?? null,
  );

  useEffect(() => {
    if (initialAvailability) return;

    const controller = new AbortController();
    fetch(`/api/service-slots?serviceId=${encodeURIComponent(ADS_SERVICE_ID)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("slots"))))
      .then((data: { availability?: ServiceSlotAvailability }) => {
        setAvailability(data.availability ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailability(null);
      });

    return () => controller.abort();
  }, [initialAvailability]);

  const service = getServiceById(ADS_SERVICE_ID);
  if (!service) return null;

  return <AdsBuySectionContent service={service} availability={availability} />;
};

export default BuySection;
