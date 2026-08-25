import type { MetadataRoute } from "next";
import { SITE_METADATA_BASE } from "@/lib/seo/open-graph";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/cart",
        "/checkout",
        "/onboarding",
        "/services/online-store/stop-being-techie",
        "/sign-in",
        "/sign-up",
        "/user",
      ],
    },
    sitemap: `${SITE_METADATA_BASE.origin}/sitemap.xml`,
  };
}
