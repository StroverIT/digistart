import { SITE_METADATA_BASE } from "@/lib/seo/open-graph";
import { OPENING_HOURS_DAYS, siteContact } from "@/lib/site-contact";

export function buildLocalBusinessJsonLd() {
  const siteUrl = SITE_METADATA_BASE.origin;

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#localbusiness`,
    name: siteContact.businessNameFull,
    alternateName: siteContact.businessName,
    description:
      "Рекламна агенция в София: Google Ads, Meta Ads, SEO, Google Business оптимизация, онлайн магазини и дигитален маркетинг.",
    url: siteUrl,
    telephone: "+359877187271",
    email: siteContact.email,
    image: `${siteUrl}/sending-covers/og-brand.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteContact.streetAddress,
      addressLocality: siteContact.addressLocality,
      postalCode: siteContact.postalCode,
      addressCountry: siteContact.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteContact.geo.latitude,
      longitude: siteContact.geo.longitude,
    },
    areaServed: {
      "@type": "City",
      name: siteContact.areaServed,
    },
    sameAs: [
      siteContact.googleMapsUrl,
      siteContact.facebook,
      siteContact.instagram,
      siteContact.linkedin,
    ],
    hasMap: siteContact.googleMapsUrl,
    priceRange: "$$",
    openingHours: siteContact.openingHours.schemaRange,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: OPENING_HOURS_DAYS.map((day) => day.dayOfWeek),
        opens: siteContact.openingHours.opens,
        closes: siteContact.openingHours.closes,
      },
    ],
  } as const;
}
