"use client";

import type {
  AnalyticsEventPayload,
  AnalyticsEventType,
  QueuedAnalyticsEvent,
} from "@/lib/analytics/types";

const FLUSH_INTERVAL_MS = 10_000;
const MAX_BATCH_SIZE = 50;
const ANALYTICS_SESSION_STORAGE_KEY = "digistart_analytics_session_id";

let eventQueue: QueuedAnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;
let drainChain: Promise<void> = Promise.resolve();
let asyncDrainActive = false;

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, id);
  }
  return id;
}

function scheduleFlush(): void {
  if (flushTimer) return;

  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushAnalyticsEvents();
  }, FLUSH_INTERVAL_MS);
}

export function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  page: string,
  metadata?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (!page || page.startsWith("/admin")) return;

  eventQueue.push({
    eventType,
    page,
    metadata,
    sessionId: getAnalyticsSessionId(),
    createdAt: new Date().toISOString(),
  });

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    flushAnalyticsEvents();
    return;
  }

  scheduleFlush();
}

export function trackCtaClick(
  page: string,
  ctaId: string,
  metadata?: Record<string, unknown>,
): void {
  trackAnalyticsEvent("cta_click", page, { cta_id: ctaId, ...metadata });
}

function serializeBatch(events: QueuedAnalyticsEvent[]): string {
  const payload: { events: AnalyticsEventPayload[] } = {
    events: events.map((event) => ({
      eventType: event.eventType,
      page: event.page,
      metadata: event.metadata,
      sessionId: event.sessionId,
      createdAt: event.createdAt,
    })),
  };

  return JSON.stringify(payload);
}

export function flushAnalyticsEvents(): void {
  if (isFlushing || asyncDrainActive || eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, MAX_BATCH_SIZE);
  isFlushing = true;
  const payload = serializeBatch(batch);

  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(
      "/api/analytics",
      new Blob([payload], { type: "application/json" }),
    );
    if (!sent) eventQueue.unshift(...batch);
  } else {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      eventQueue.unshift(...batch);
    });
  }

  isFlushing = false;
  if (eventQueue.length > 0) scheduleFlush();
}

export function flushAnalyticsEventsAsync(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  drainChain = drainChain.then(async () => {
    asyncDrainActive = true;
    try {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }

      while (eventQueue.length > 0) {
        const batch = eventQueue.splice(0, MAX_BATCH_SIZE);
        try {
          const response = await fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: serializeBatch(batch),
          });
          if (!response.ok) {
            eventQueue.unshift(...batch);
            break;
          }
        } catch {
          eventQueue.unshift(...batch);
          break;
        }
      }
    } finally {
      asyncDrainActive = false;
    }
  });

  return drainChain;
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAnalyticsEvents();
  });

  window.addEventListener("pagehide", () => {
    flushAnalyticsEvents();
  });
}
