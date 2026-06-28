export type BookingSectionConfig = {
  sourcePage?: string;
  analyticsPath: string;
  analyticsCtaId: string;
};

const SERVICE_BOOKING_CONFIG: Record<string, BookingSectionConfig> = {
  "/services/social-media": {
    sourcePage: "Социални мрежи (/services/social-media)",
    analyticsPath: "/services/social-media",
    analyticsCtaId: "social_media_booking_submit",
  },
  "/services/online-store": {
    sourcePage: "Онлайн магазин (/services/online-store)",
    analyticsPath: "/services/online-store",
    analyticsCtaId: "online_store_booking_submit",
  },
  "/services/google-business": {
    sourcePage: "Google Business (/services/google-business)",
    analyticsPath: "/services/google-business",
    analyticsCtaId: "google_business_booking_submit",
  },
  "/services/ads": {
    sourcePage: "Реклами (/services/ads)",
    analyticsPath: "/services/ads",
    analyticsCtaId: "ads_booking_submit",
  },
  "/services/ai-automation": {
    sourcePage: "AI Automation (/services/ai-automation)",
    analyticsPath: "/services/ai-automation",
    analyticsCtaId: "ai_automation_booking_submit",
  },
};

function slugifyPath(pathname: string): string {
  return pathname.replace(/^\//, "").replace(/\//g, "_").replace(/-/g, "_") || "home";
}

export function getBookingSectionConfig(pathname: string): BookingSectionConfig {
  const serviceConfig = SERVICE_BOOKING_CONFIG[pathname];
  if (serviceConfig) return serviceConfig;

  return {
    sourcePage: pathname === "/" ? undefined : `Страница (${pathname})`,
    analyticsPath: pathname || "/",
    analyticsCtaId: `${slugifyPath(pathname)}_booking_submit`,
  };
}

const EXCLUDED_PATH_PREFIXES = [
  "/cart",
  "/checkout",
  "/sign-in",
  "/sign-up",
  "/onboarding",
] as const;

const PAGES_WITH_OWN_BOOKING = [
  /^\/$/,
  /^\/services\//,
  /^\/about$/,
  /^\/consultation$/,
] as const;

export function shouldRenderSiteBookingSection(pathname: string): boolean {
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  return !PAGES_WITH_OWN_BOOKING.some((pattern) => pattern.test(pathname));
}
