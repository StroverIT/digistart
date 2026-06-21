"use client";

import { ServiceInnerNavigation } from "@/components/services/service-inner-navigation";
import { SOCIAL_MEDIA_SECTION_NAV } from "./section-nav";

const InnerNavigation = () => (
  <ServiceInnerNavigation items={SOCIAL_MEDIA_SECTION_NAV} ariaLabel="Навигация по секции" />
);

export default InnerNavigation;
