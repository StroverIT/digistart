/** Site-wide contact and social links (public URLs). Keep NAP identical to Google Business Profile. */
export const siteContact = {
  /** Public business name (must match GBP) */
  businessName: "DigiStart",
  /** GBP display name including category keyword */
  businessNameFull: "Digistart - рекламна агенция",
  email: "digistartbg@gmail.com",
  /** `tel:` href without spaces */
  phoneHref: "tel:+359877187271",
  /** Display for BG mobile */
  phoneLabel: "+359 877 187 271",
  /** Single-line address for schema / citations */
  addressSingleLine: "ж.к. Дружба 2, бл. 321, 1582 София",
  /** Business address lines for footer / local SEO */
  addressLines: ["ж.к. Дружба 2, бл. 321", "1582 София"] as const,
  streetAddress: "ж.к. Дружба 2, бл. 321",
  addressLocality: "София",
  postalCode: "1582",
  addressCountry: "BG",
  /** Coordinates from Google Business Profile pin */
  geo: {
    latitude: 42.6463351,
    longitude: 23.4088513,
  },
  /** Public Google Maps place URL (GBP) */
  googleMapsUrl:
    "https://www.google.com/maps/place/Digistart+-+%D1%80%D0%B5%D0%BA%D0%BB%D0%B0%D0%BC%D0%BD%D0%B0+%D0%B0%D0%B3%D0%B5%D0%BD%D1%86%D0%B8%D1%8F/@42.6463351,23.4088513,17z",
  /** Embeddable map (no API key) */
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=42.6463351,23.4088513&z=16&hl=bg&output=embed",
  facebook: "https://www.facebook.com/profile.php?id=61564485825627",
  instagram: "https://www.instagram.com/digistartbg/",
  /** Public company page; use this on the site, not the LinkedIn admin URL. */
  linkedin: "https://www.linkedin.com/company/115850325/",
  /** Primary service area for local SEO */
  areaServed: "София",
} as const;
