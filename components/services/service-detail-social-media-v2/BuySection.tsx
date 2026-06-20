"use client";

import { useEffect, useRef, useState } from "react";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServiceById, getServicePlanPrice } from "@/lib/data/services";
import { SOCIAL_MEDIA_LANDING } from "@/config/service-landing/social-media";
import type { CartBillingCycle, CartItemUpsell, ServiceSlotAvailability } from "@/lib/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { addOrUpdateServiceInCart } from "@/lib/store/cart";
import { landingContainerClass } from "@/components/services/service-detail-ready-store-v2/shared";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const SOCIAL_MEDIA_SERVICE_ID = "social-media";
const SOCIAL_MEDIA_OPTION_ID = "default";

interface BuySectionProps {
  availability?: ServiceSlotAvailability | null;
}

function SocialMediaBuySectionContent({
  service,
  availability,
}: {
  service: NonNullable<ReturnType<typeof getServiceById>>;
  availability: ServiceSlotAvailability | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.1 });

  const planPrice = getServicePlanPrice(service, SOCIAL_MEDIA_OPTION_ID);

  const handleCheckout = (options?: { billingCycle?: CartBillingCycle }) => {
    setIsAdding(true);
    const result = addOrUpdateServiceInCart(
      SOCIAL_MEDIA_SERVICE_ID,
      SOCIAL_MEDIA_OPTION_ID,
      upsells,
      {
        billingCycle: options?.billingCycle,
      },
    );
    if (!result.added && result.reason === "duplicate") {
      setIsAdding(false);
      return;
    }
    if (!result.added) {
      setIsAdding(false);
      return;
    }

    const addedItem = result.cart.items.find(
      (item) =>
        item.serviceId === SOCIAL_MEDIA_SERVICE_ID &&
        item.selectedOptionId === SOCIAL_MEDIA_OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], {
        page_path: SOCIAL_MEDIA_LANDING.pagePath,
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
          header="Готов ли си за повече трафик и продажби?"
          price={planPrice}
          monthlyLabel="/месец"
          upsells={upsells}
          onUpsellsChange={setUpsells}
          onAddToCart={handleCheckout}
          isAdding={isAdding}
          cartSelectedOptionId={SOCIAL_MEDIA_OPTION_ID}
          ctaId={`${SOCIAL_MEDIA_LANDING.ctaIdPrefix}_buy_section_add_to_cart`}
          ctaPage={SOCIAL_MEDIA_LANDING.pagePath}
          availability={availability}
          hiddenUpsellIds={["extra-channels"]}
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
    fetch(`/api/service-slots?serviceId=${encodeURIComponent(SOCIAL_MEDIA_SERVICE_ID)}`, {
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

  const service = getServiceById(SOCIAL_MEDIA_SERVICE_ID);
  if (!service) return null;

  return <SocialMediaBuySectionContent service={service} availability={availability} />;
};

export default BuySection;
