"use client";

import { ServiceInnerNavigation } from "@/components/services/service-inner-navigation";
import { ADS_SECTION_NAV } from "./section-nav";

const InnerNavigation = () => (
  <ServiceInnerNavigation items={ADS_SECTION_NAV} ariaLabel="Навигация по секции" />
);

export default InnerNavigation;
