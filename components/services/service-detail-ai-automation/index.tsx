"use client";

import { useMemo, useRef } from "react";
import { Bot } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { getServiceById } from "@/lib/data/services";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ServicePasLanding } from "@/components/services/service-pas-landing/service-pas-landing";
import { useServicePasScrollAnimations } from "@/components/services/service-pas-landing/use-service-pas-scroll-animations";
import { AI_AUTOMATION_LANDING, AI_AUTOMATION_SERVICE_ID } from "@/config/service-landing/ai-automation";
import { useVisitorPreferences } from "@/components/visitor-preferences/visitor-preferences-provider";
import { personalizePasLanding } from "@/lib/visitor-preferences/personalize";

interface ServiceDetailAiAutomationProps {
  headingFontClass?: string;
  bodyFontClass?: string;
  className?: string;
  serviceData?: Service;
}

export function ServiceDetailAiAutomation({
  headingFontClass,
  bodyFontClass,
  className,
  serviceData,
}: ServiceDetailAiAutomationProps) {
  const service = serviceData ?? getServiceById(AI_AUTOMATION_SERVICE_ID);
  const pageRootRef = useRef<HTMLDivElement>(null);
  const { effectiveChannels, otherChannelLabel } = useVisitorPreferences();

  useServicePasScrollAnimations(pageRootRef);

  const content = useMemo(
    () => personalizePasLanding(AI_AUTOMATION_LANDING, effectiveChannels, otherChannelLabel),
    [effectiveChannels, otherChannelLabel],
  );

  if (!service) return null;

  const scrollToBuySection = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      {/*
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
      */}
    </ServicePasLanding>
  );
}
