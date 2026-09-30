/** Shared helpers for marketing email unsubscribe links. */

export const NEWSLETTER_STATUS_SUBSCRIBED = "subscribed" as const;
export const NEWSLETTER_STATUS_UNSUBSCRIBED = "unsubscribed" as const;

export type NewsletterEmailStatus =
  | typeof NEWSLETTER_STATUS_SUBSCRIBED
  | typeof NEWSLETTER_STATUS_UNSUBSCRIBED;

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg").replace(/\/$/, "");
}

/** Public page where the recipient confirms unsubscribe (identified by subscriber uid). */
export function getUnsubscribePageUrl(uid?: string): string {
  const base = `${getSiteUrl()}/unsubscribe`;
  if (!uid) return base;
  return `${base}?uid=${encodeURIComponent(uid.trim())}`;
}

/** Append a lead/subscriber uid query param to a destination URL. */
export function appendTrackingUid(url: string, uid: string): string {
  const trimmedUid = uid.trim();
  if (!trimmedUid) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("uid", trimmedUid);
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}uid=${encodeURIComponent(trimmedUid)}`;
  }
}
