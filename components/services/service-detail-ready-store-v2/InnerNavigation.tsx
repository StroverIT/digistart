"use client";

import { ServiceInnerNavigation } from "@/components/services/service-inner-navigation";
import {
  READY_STORE_FUNNEL_SECTION_NAV,
  READY_STORE_SECTION_NAV,
} from "./section-nav";

type InnerNavigationProps = {
  funnelLayout?: boolean;
};

const InnerNavigation = ({ funnelLayout = false }: InnerNavigationProps) => (
  <ServiceInnerNavigation
    items={funnelLayout ? READY_STORE_FUNNEL_SECTION_NAV : READY_STORE_SECTION_NAV}
    ariaLabel="Навигация по секции"
    capitalizeLinks
    ctaHref="#consultation"
    ctaLabel="Безплатна консултация"
    stickyOffset={funnelLayout ? "funnel-banner" : "site-header"}
  />
);

export default InnerNavigation;
