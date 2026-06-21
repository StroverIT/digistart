"use client";

import { ServiceInnerNavigation } from "@/components/services/service-inner-navigation";
import { GOOGLE_BUSINESS_SECTION_NAV } from "./section-nav";

const InnerNavigation = () => (
  <ServiceInnerNavigation items={GOOGLE_BUSINESS_SECTION_NAV} ariaLabel="Навигация по секции" />
);

export default InnerNavigation;
