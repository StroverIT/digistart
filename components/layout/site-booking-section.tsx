"use client";

import { usePathname } from "next/navigation";
import { BookingForm } from "@/components/home/booking-form";
import {
  getBookingSectionConfig,
  shouldRenderSiteBookingSection,
} from "@/lib/booking-section-config";

export function SiteBookingSection() {
  const pathname = usePathname();

  if (!shouldRenderSiteBookingSection(pathname)) {
    return null;
  }

  const config = getBookingSectionConfig(pathname);

  return (
    <BookingForm
      sourcePage={config.sourcePage}
      analyticsPath={config.analyticsPath}
      analyticsCtaId={config.analyticsCtaId}
    />
  );
}
