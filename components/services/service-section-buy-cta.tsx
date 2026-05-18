"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICE_DETAIL_HERO_PRIMARY_BUTTON_CLASSNAME } from "@/components/services/service-detail-primary-cta-styles";
import { trackCtaClick } from "@/lib/analytics/tracker";
import { cn } from "@/lib/utils";

export type ServiceSectionBuyCtaConfig = {
  pagePath: string;
  ctaId: string;
  /** Same copy as the page hero primary CTA */
  label: string;
};

export function scrollServiceBuySectionIntoView() {
  document
    .getElementById("buy-now")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type ServiceSectionBuyCtaProps = ServiceSectionBuyCtaConfig & {
  className?: string;
};

export function ServiceSectionBuyCta({
  pagePath,
  ctaId,
  label,
  className,
}: ServiceSectionBuyCtaProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <Button
        type="button"
        size="lg"
        className={SERVICE_DETAIL_HERO_PRIMARY_BUTTON_CLASSNAME}
        onClick={() => {
          trackCtaClick(pagePath, ctaId);
          scrollServiceBuySectionIntoView();
        }}
      >
        {label}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
