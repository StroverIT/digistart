"use client";

import { useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { cartItemToMetaLineItem, trackMetaAddToCart } from "@/lib/analytics/meta-pixel";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { Price } from "@/components/ui/price";
import { ServiceBuySection } from "@/components/services/service-buy-section";
import { getServiceById, getServicePlanPrice } from "@/lib/data/services";
import type { CartItemUpsell, Service } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { addToCart, findCartItemByService, updateCartItemUpsells } from "@/lib/store/cart";
import { PlansSection } from "@/components/plans/plans-section";
import { ServiceDetailHero } from "@/components/services/service-detail-hero";
import { TemplatesShowcaseSection } from "@/components/templates/templates-showcase-section";
import {
  HERO_DESCRIPTION_INTRO,
  OPTION_ID,
  SERVICE_ID,
} from "./constants";
import { ReadyStorePainPointsSection } from "./pain-points-section";
import { ReadyStoreSolutionSection } from "./solution-section";
import { ReadyStoreStepsSection } from "./steps-section";
import { ReadyStoreCaseStudySection } from "./case-study-section";
import { ReadyStoreValuePropSection } from "./value-prop-section";
import { ReadyStoreFaqSection } from "./faq-section";
import { useReadyStoreScrollAnimations } from "./use-ready-store-scroll-animations";

interface ServiceDetailReadyStoreProps {
  headingFontClass?: string;
  bodyFontClass?: string;
  className?: string;
  serviceData?: Service;
}

export function ServiceDetailReadyStore({
  headingFontClass,
  bodyFontClass,
  className,
  serviceData,
}: ServiceDetailReadyStoreProps) {
  const service = serviceData ?? getServiceById(SERVICE_ID);
  const { push } = useTransitionRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [upsells, setUpsells] = useState<CartItemUpsell[]>([]);
  const pageRootRef = useRef<HTMLDivElement>(null);

  useReadyStoreScrollAnimations(pageRootRef);

  if (!service) return null;

  const planPrice = getServicePlanPrice(service, OPTION_ID);

  const scrollToBuySection = () => {
    document.getElementById("buy-now")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCheckout = () => {
    setIsAdding(true);
    const existing = findCartItemByService(SERVICE_ID, OPTION_ID);
    if (existing) {
      updateCartItemUpsells(existing.id, upsells);
      setIsAdding(false);
      return;
    }
    const result = addToCart(SERVICE_ID, OPTION_ID, upsells);
    if (!result.added) {
      setIsAdding(false);
      return;
    }
    const addedItem = result.cart.items.find(
      (i) => i.serviceId === SERVICE_ID && i.selectedOptionId === OPTION_ID,
    );
    if (addedItem) {
      trackMetaAddToCart([cartItemToMetaLineItem(addedItem)], { page_path: "/services/online-store" });
    }
    setTimeout(() => {
      setIsAdding(false);
      push("/cart");
    }, 250);
  };

  return (
    <div
      ref={pageRootRef}
      className={cn(
        "pt-16 pb-12 md:pt-20 md:pb-16",
        bodyFontClass,
        className
      )}
    >
      <ServiceDetailHero
        badgeIcon={<ShoppingCart className="h-4 w-4" />}
        badgeText="Без хиляди левове първоначална инвестиция. Без ИТ екип. Само чисти продажби."
        title={
          <>
            Превърни идеята или проекта си в автоматизиран онлайн магазин -{" "}
            <div className="gradient-text">бързо, лесно и без финансов риск.</div>
          </>
        }
        description={HERO_DESCRIPTION_INTRO}
        priceSlot={
          <div className="flex items-baseline gap-1">
            <Price
              value={planPrice}
              className={cn(
                headingFontClass,
                "text-3xl sm:text-4xl text-primary"
              )}
            />
            <span className="text-muted-foreground text-lg">/мес</span>
          </div>
        }
        primaryLabel="Стартирай своя онлайн магазин без риск"
        onPrimaryClick={() => {
          trackCtaClick("/services/online-store", "service_ready_store_scroll_to_buy");
          scrollToBuySection();
        }}
        backCtaId="service_ready_store_back_to_services"
        headingFontClass={headingFontClass}
      />

      <ReadyStorePainPointsSection headingFontClass={headingFontClass} />
      <ReadyStoreSolutionSection headingFontClass={headingFontClass} />
      <ReadyStoreStepsSection headingFontClass={headingFontClass} />
      <ReadyStoreValuePropSection />
      <ReadyStoreCaseStudySection headingFontClass={headingFontClass} />

      <TemplatesShowcaseSection headingFontClass={headingFontClass} />

      <ReadyStoreFaqSection headingFontClass={headingFontClass} />

      <ServiceBuySection
        service={service}
        title="Купи сега"
        price={planPrice}
        upsells={upsells}
        onUpsellsChange={setUpsells}
        onAddToCart={handleCheckout}
        isAdding={isAdding}
        cartSelectedOptionId={OPTION_ID}
        ctaId="service_ready_store_buy_section_add_to_cart"
        ctaPage="/services/online-store"
      />

      <PlansSection
        compact
        title="Готови абонаментни пакети"
        subtitle="Или конфигурирай само магазина и добавките, които са ти нужни сега."
        className="py-12 md:py-16 bg-card/30"
      />
    </div>
  );
}
