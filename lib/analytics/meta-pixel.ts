/**
 * Meta Pixel + dataLayer helpers for browser events with deduplication-friendly `event_id`.
 * Use the same `event_id` server-side (Stape / sGTM) for matching events.
 *
 * Env:
 * - NEXT_PUBLIC_META_PIXEL_ID — Facebook Pixel ID (optional; fbq skipped if unset)
 * - NEXT_PUBLIC_META_CURRENCY — ISO 4217, default EUR
 * - NEXT_PUBLIC_STAPE_EVENT_ENDPOINT — optional POST URL to mirror payloads for server-side forwarding
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    dataLayer?: Record<string, unknown>[];
  }
}

export type MetaPixelLineItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const META_CURRENCY = process.env.NEXT_PUBLIC_META_CURRENCY ?? "EUR";
const STAPE_ENDPOINT = process.env.NEXT_PUBLIC_STAPE_EVENT_ENDPOINT ?? "";

let metaPixelInitStarted = false;

/** Unique per event: prefix + ms timestamp + random segment (Stape/Meta dedupe). */
export function generateMetaEventId(eventName: string): string {
  const safePrefix = eventName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
  let random: string;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    random = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  } else {
    random = `${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`.slice(0, 16);
  }
  return `${safePrefix}_${Date.now()}_${random}`;
}

function ensureDataLayer(): Record<string, unknown>[] {
  if (typeof window === "undefined") return [];
  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: FbqFn;
};

/** Meta's standard fbevents loader (queues calls until script is ready). */
function injectMetaPixelBase(): void {
  if (typeof window === "undefined" || window.fbq) return;
  const f = window;
  const b = document;
  const e = "script";
  const v = "https://connect.facebook.net/en_US/fbevents.js";
  const n = function (this: unknown, ...args: unknown[]) {
    const self = n as FbqFn;
    if (self.callMethod) {
      self.callMethod.apply(self, args);
    } else {
      self.queue.push(args);
    }
  } as FbqFn;
  f.fbq = n;
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  const t = b.createElement(e);
  t.async = true;
  t.src = v;
  const s = b.getElementsByTagName(e)[0];
  s?.parentNode?.insertBefore(t, s);
}

/** Install Meta base snippet once and call fbq('init', pixelId). */
export function ensureMetaPixelInitialized(): void {
  if (typeof window === "undefined" || !META_PIXEL_ID || metaPixelInitStarted) return;
  metaPixelInitStarted = true;

  injectMetaPixelBase();
  window.fbq?.("init", META_PIXEL_ID);
}

export type MetaPixelEventPayload = {
  event_id: string;
  event_name: "PageView" | "AddToCart" | "Purchase";
  currency: string;
  value?: number;
  content_ids: string[];
  content_type: "product";
  contents: Array<{ id: string; quantity: number; item_price?: number }>;
  items: MetaPixelLineItem[];
  page_path?: string;
  order_id?: string;
};

function buildContentsFromItems(items: MetaPixelLineItem[]): MetaPixelEventPayload["contents"] {
  return items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    item_price: item.price,
  }));
}

export function normalizeLineItems(
  items: Array<{ id: string; name: string; price: number; quantity?: number }>,
): MetaPixelLineItem[] {
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    quantity: i.quantity ?? 1,
  }));
}

/** Map a cart row to a Meta line item (content id = serviceId). */
export function cartItemToMetaLineItem(item: {
  serviceId: string;
  serviceName: string;
  totalPrice: number;
}): MetaPixelLineItem {
  return {
    id: item.serviceId,
    name: item.serviceName,
    price: item.totalPrice,
    quantity: 1,
  };
}

/** Sum of line totals (price * quantity). */
export function sumLineItemsValue(items: MetaPixelLineItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function pushDataLayer(payload: MetaPixelEventPayload): void {
  const dl = ensureDataLayer();
  dl.push({
    event: "meta_pixel_event",
    ...payload,
  });
}

function optionalStapeFetch(payload: MetaPixelEventPayload): void {
  if (!STAPE_ENDPOINT || typeof fetch === "undefined") return;
  void fetch(STAPE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

type FbqTrackOptions = { eventID: string };

function fbqTrack(
  eventName: "PageView" | "AddToCart" | "Purchase",
  params: Record<string, unknown>,
  eventId: string,
): void {
  if (!META_PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  const options: FbqTrackOptions = { eventID: eventId };
  window.fbq("track", eventName, params, options);
}

/**
 * PageView with unique event_id (for dedupe if you also send PageView from server).
 */
export function trackMetaPageView(pagePath?: string): string {
  const event_id = generateMetaEventId("PageView");
  const items: MetaPixelLineItem[] = [];
  const payload: MetaPixelEventPayload = {
    event_id,
    event_name: "PageView",
    currency: META_CURRENCY,
    content_ids: [],
    content_type: "product",
    contents: [],
    items,
    page_path: pagePath,
  };

  ensureMetaPixelInitialized();
  pushDataLayer(payload);
  optionalStapeFetch(payload);
  fbqTrack("PageView", {}, event_id);
  return event_id;
}

/**
 * AddToCart — one or more line items (e.g. configured service rows).
 */
export function trackMetaAddToCart(lineItems: MetaPixelLineItem[], extra?: { page_path?: string }): string {
  const items = normalizeLineItems(lineItems);
  const value = sumLineItemsValue(items);
  const event_id = generateMetaEventId("AddToCart");
  const content_ids = [...new Set(items.map((i) => i.id))];

  const payload: MetaPixelEventPayload = {
    event_id,
    event_name: "AddToCart",
    currency: META_CURRENCY,
    value,
    content_ids,
    content_type: "product",
    contents: buildContentsFromItems(items),
    items,
    page_path: extra?.page_path,
  };

  ensureMetaPixelInitialized();
  pushDataLayer(payload);
  optionalStapeFetch(payload);
  fbqTrack(
    "AddToCart",
    {
      content_ids,
      content_type: "product",
      contents: buildContentsFromItems(items),
      currency: META_CURRENCY,
      value,
      num_items: items.reduce((n, i) => n + i.quantity, 0),
    },
    event_id,
  );
  return event_id;
}

/**
 * Purchase after successful checkout — pass full cart line items and total value.
 */
export function trackMetaPurchase(params: {
  lineItems: MetaPixelLineItem[];
  value: number;
  orderId?: string;
  page_path?: string;
}): string {
  const items = normalizeLineItems(params.lineItems);
  const event_id = generateMetaEventId("Purchase");
  const content_ids = [...new Set(items.map((i) => i.id))];

  const payload: MetaPixelEventPayload = {
    event_id,
    event_name: "Purchase",
    currency: META_CURRENCY,
    value: params.value,
    content_ids,
    content_type: "product",
    contents: buildContentsFromItems(items),
    items,
    page_path: params.page_path,
    ...(params.orderId ? { order_id: params.orderId } : {}),
  };

  ensureMetaPixelInitialized();
  pushDataLayer(payload);
  optionalStapeFetch(payload);
  fbqTrack(
    "Purchase",
    {
      content_ids,
      content_type: "product",
      contents: buildContentsFromItems(items),
      currency: META_CURRENCY,
      value: params.value,
      num_items: items.reduce((n, i) => n + i.quantity, 0),
    },
    event_id,
  );
  return event_id;
}

export { META_CURRENCY };
