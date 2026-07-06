"use client";

import { ServiceInnerNavigation } from "@/components/services/service-inner-navigation";
import { READY_STORE_SECTION_NAV } from "./section-nav";

const InnerNavigation = () => (
  <ServiceInnerNavigation
    items={READY_STORE_SECTION_NAV}
    ariaLabel="Навигация по секции"
    capitalizeLinks
    ctaHref="#buy-section"
    ctaLabel="Купи сега"
  />
);

export default InnerNavigation;
