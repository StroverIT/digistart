/**
 * Hours — keep identical to Google Business Profile.
 * Regular Hours (08:00–20:00) drive “open now”, NAP, and JSON-LD.
 * Online operating hours are a separate GBP “More hours” type and must not
 * replace regular hours in schema or the office open/closed status.
 * @see https://support.google.com/business/answer/9876800
 * @see https://developers.google.com/search/docs/appearance/structured-data/local-business
 */
export const OPENING_HOURS_DAYS = [
  { dayOfWeek: "Monday", label: "Понеделник", shortLabel: "Пн" },
  { dayOfWeek: "Tuesday", label: "Вторник", shortLabel: "Вт" },
  { dayOfWeek: "Wednesday", label: "Сряда", shortLabel: "Ср" },
  { dayOfWeek: "Thursday", label: "Четвъртък", shortLabel: "Чт" },
  { dayOfWeek: "Friday", label: "Петък", shortLabel: "Пт" },
  { dayOfWeek: "Saturday", label: "Събота", shortLabel: "Сб" },
  { dayOfWeek: "Sunday", label: "Неделя", shortLabel: "Нд" },
] as const;

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
  /** Public Google Maps place URL (GBP listing, not a raw pin) */
  googleMapsUrl:
    "https://www.google.com/maps/place/Digistart+-+%D1%80%D0%B5%D0%BA%D0%BB%D0%B0%D0%BC%D0%BD%D0%B0+%D0%B0%D0%B3%D0%B5%D0%BD%D1%86%D0%B8%D1%8F/@42.6463351,23.4088513,17z/data=!4m6!3m5!1s0x6de45c7a12e65d4d:0x34419d40aa2064bc!8m2!3d42.6463351!4d23.4088513!16s%2Fg%2F11j_1z1tcr",
  /** Embeddable map (no API key) */
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=42.6463351,23.4088513&z=16&hl=bg&output=embed",
  facebook: "https://www.facebook.com/profile.php?id=61564485825627",
  instagram: "https://www.instagram.com/digistartbg/",
  /** Public company page; use this on the site, not the LinkedIn admin URL. */
  linkedin: "https://www.linkedin.com/company/115850325/",
  /** Primary service area for local SEO */
  areaServed: "София",
  /** Regular Hours in GBP — office / customer-facing. Also used in JSON-LD. */
  openingHours: {
    opens: "08:00",
    closes: "20:00",
    displayRange: "08:00 – 20:00",
    schemaRange: "Mo-Su 08:00-20:00",
    label: "Офис",
    note: "Всеки ден от 08:00 - 20:00",
    timeZone: "Europe/Sofia",
  },
  /**
   * GBP “Online operating hours” (More hours). Display separately on the site.
   * Do not use this for openingHoursSpecification or the office open/closed pill.
   */
  onlineOperatingHours: {
    allDay: true,
    label: "Онлайн запитвания",
    note: "Отворено 24 часа",
  },
} as const;

function minutesFromHhMm(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getSofiaOpeningStatus(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: siteContact.openingHours.timeZone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const minutesNow =
    Number(read("hour")) * 60 + Number(read("minute"));
  const opens = minutesFromHhMm(siteContact.openingHours.opens);
  const closes = minutesFromHhMm(siteContact.openingHours.closes);

  return {
    weekday: read("weekday"),
    isOpen: minutesNow >= opens && minutesNow < closes,
    nextHint:
      minutesNow >= opens && minutesNow < closes
        ? `Днес до ${siteContact.openingHours.closes}`
        : minutesNow < opens
          ? `Отваряме в ${siteContact.openingHours.opens}`
          : `Отваряме утре в ${siteContact.openingHours.opens}`,
  };
}
