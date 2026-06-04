"use client";

import { useEffect } from "react";
import { extractAllUtmParams } from "@/lib/analytics/source";
import { generateClientUuid } from "@/lib/utils";

const TRACKED_DEDUPE_KEY_STORAGE = "digistart_tracked_utm_dedupe_keys";
const UTM_VISITOR_ID_STORAGE_KEY = "digistart_utm_visitor_id";
const MAX_STORED_KEYS = 300;

function buildDedupeKey(payload: Record<string, string>, visitorId: string) {
  const serialized = Object.entries(payload)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const keySource = `${visitorId}::${serialized}`;

  let hash = 5381;
  for (let index = 0; index < keySource.length; index += 1) {
    hash = (hash * 33) ^ keySource.charCodeAt(index);
  }
  return `utm_${(hash >>> 0).toString(16)}`;
}

function readStoredKeys(): string[] {
  const raw = localStorage.getItem(TRACKED_DEDUPE_KEY_STORAGE);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeStoredKeys(keys: string[]) {
  const normalized = keys.slice(-MAX_STORED_KEYS);
  localStorage.setItem(TRACKED_DEDUPE_KEY_STORAGE, JSON.stringify(normalized));
}

function getOrCreateVisitorId() {
  const existing = localStorage.getItem(UTM_VISITOR_ID_STORAGE_KEY);
  if (existing) return existing;

  const created = generateClientUuid();
  localStorage.setItem(UTM_VISITOR_ID_STORAGE_KEY, created);
  return created;
}

export function UtmTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const utmPayload = extractAllUtmParams(url.searchParams);
    const hasUtm = Object.keys(utmPayload).length > 0;
    if (!hasUtm) return;

    const visitorId = getOrCreateVisitorId();
    const dedupeKey = buildDedupeKey(utmPayload, visitorId);
    const trackedKeys = readStoredKeys();
    const hasTracked = trackedKeys.includes(dedupeKey);

    if (!hasTracked) {
      void fetch("/api/analytics/utm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: url.pathname || "/",
          fullUrl: url.toString(),
          utmPayload,
          dedupeKey,
        }),
        keepalive: true,
      }).catch(() => {});
      writeStoredKeys([...trackedKeys, dedupeKey]);
    }

    window.history.replaceState({}, "", "/");
  }, []);

  return null;
}
