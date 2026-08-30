/** Shared helpers for marketing email unsubscribe links. */

export const NEWSLETTER_STATUS_SUBSCRIBED = "subscribed" as const;
export const NEWSLETTER_STATUS_UNSUBSCRIBED = "unsubscribed" as const;

export type NewsletterEmailStatus =
  | typeof NEWSLETTER_STATUS_SUBSCRIBED
  | typeof NEWSLETTER_STATUS_UNSUBSCRIBED;

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg").replace(/\/$/, "");
}

/** Public page where the recipient confirms their email to unsubscribe. */
export function getUnsubscribePageUrl(email?: string): string {
  const base = `${getSiteUrl()}/unsubscribe`;
  if (!email) return base;
  return `${base}?email=${encodeURIComponent(email.trim().toLowerCase())}`;
}
