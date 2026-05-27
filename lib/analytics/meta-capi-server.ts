import { createHash } from "node:crypto";

/**
 * Server-side Meta Conversions API forwarder via Stape CAPIG.
 *
 * Posts Meta CAPI-shaped events to https://capig.digistart.bg with the API key.
 * Browser-side `fbq('track', ..., { eventID })` and these server events share an
 * `event_id`, so Meta dedupes them.
 *
 * Env (production only):
 * - STAPE_CAPIG_URL - e.g. https://capig.digistart.bg
 * - STAPE_CAPIG_API_KEY - base64 token from Stape
 * - NEXT_PUBLIC_META_PIXEL_ID - required (target Pixel)
 */

export type MetaCapiEventName = "PageView" | "AddToCart" | "Purchase" | "Lead";

export type MetaCapiUserInput = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  externalId?: string | null;
};

export type MetaCapiContext = {
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  eventSourceUrl?: string | null;
};

export type MetaCapiCustomData = {
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_type?: "product";
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  content_name?: string;
  num_items?: number;
  order_id?: string;
};

export type MetaCapiSendInput = {
  eventName: MetaCapiEventName;
  eventId: string;
  eventTimeMs?: number;
  user?: MetaCapiUserInput;
  context?: MetaCapiContext;
  customData?: MetaCapiCustomData;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashIfPresent(value: string | null | undefined, normalize: (v: string) => string): string | undefined {
  if (!value) return undefined;
  const normalized = normalize(value);
  if (!normalized) return undefined;
  return sha256(normalized);
}

function buildUserData(user: MetaCapiUserInput | undefined, context: MetaCapiContext | undefined) {
  const userData: Record<string, unknown> = {};

  const em = hashIfPresent(user?.email, normalizeText);
  if (em) userData.em = [em];

  const ph = hashIfPresent(user?.phone, normalizePhone);
  if (ph) userData.ph = [ph];

  const fn = hashIfPresent(user?.firstName, normalizeText);
  if (fn) userData.fn = [fn];

  const ln = hashIfPresent(user?.lastName, normalizeText);
  if (ln) userData.ln = [ln];

  const externalId = hashIfPresent(user?.externalId, normalizeText);
  if (externalId) userData.external_id = [externalId];

  if (context?.clientIpAddress) userData.client_ip_address = context.clientIpAddress;
  if (context?.clientUserAgent) userData.client_user_agent = context.clientUserAgent;
  if (context?.fbp) userData.fbp = context.fbp;
  if (context?.fbc) userData.fbc = context.fbc;

  return userData;
}

function getCapigConfig(): { url: string; apiKey: string; pixelId: string } | null {
  const url = process.env.STAPE_CAPIG_URL;
  const apiKey = process.env.STAPE_CAPIG_API_KEY;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!url || !apiKey || !pixelId) return null;
  return { url: url.replace(/\/$/, ""), apiKey, pixelId };
}

/**
 * Sends a Meta CAPI event through Stape CAPIG. No-ops (returns false) if the
 * gateway is not configured (e.g. local dev). Best-effort - never throws.
 */
export async function sendMetaCapiEvent(input: MetaCapiSendInput): Promise<boolean> {
  const config = getCapigConfig();
  if (!config) return false;

  const eventTime = Math.floor((input.eventTimeMs ?? Date.now()) / 1000);

  const event: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: eventTime,
    event_id: input.eventId,
    action_source: "website",
    user_data: buildUserData(input.user, input.context),
  };

  if (input.context?.eventSourceUrl) {
    event.event_source_url = input.context.eventSourceUrl;
  }
  if (input.customData && Object.keys(input.customData).length > 0) {
    event.custom_data = input.customData;
  }

  const body = JSON.stringify({ data: [event] });
  const endpoint = `${config.url}/${config.pixelId}/events?access_token=${encodeURIComponent(
    config.apiKey,
  )}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[meta-capi] CAPIG returned non-OK", res.status, text.slice(0, 500));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[meta-capi] CAPIG request failed", error);
    return false;
  }
}

export function isMetaCapiConfigured(): boolean {
  return getCapigConfig() !== null;
}
