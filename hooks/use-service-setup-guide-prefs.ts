"use client";

import { useCallback, useEffect, useState } from "react";

export type ServiceSetupGuidePrefs = {
  mode: "open" | "minimized" | "banner";
};

const defaultPrefs: ServiceSetupGuidePrefs = { mode: "open" };

function storageKey(orderItemId: string) {
  return `digistart.serviceSetupGuide.${orderItemId}`;
}

/** Persists setup guide minimized state in localStorage (per order item). */
export function useServiceSetupGuidePrefs(orderItemId: string | undefined) {
  const [prefs, setPrefsState] = useState<ServiceSetupGuidePrefs>(defaultPrefs);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!orderItemId) {
      setPrefsState(defaultPrefs);
      setHydrated(true);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey(orderItemId));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ServiceSetupGuidePrefs> & {
          minimized?: boolean;
        };
        const mode =
          parsed.mode === "open" || parsed.mode === "minimized" || parsed.mode === "banner"
            ? parsed.mode
            : parsed.minimized
              ? "minimized"
              : "open";
        setPrefsState({ mode });
      } else {
        setPrefsState(defaultPrefs);
      }
    } catch {
      setPrefsState(defaultPrefs);
    } finally {
      setHydrated(true);
    }
  }, [orderItemId]);

  const setPrefs = useCallback(
    (next: ServiceSetupGuidePrefs | ((p: ServiceSetupGuidePrefs) => ServiceSetupGuidePrefs)) => {
      setPrefsState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        if (orderItemId && typeof window !== "undefined") {
          try {
            localStorage.setItem(storageKey(orderItemId), JSON.stringify(resolved));
          } catch {
            /* ignore */
          }
        }
        return resolved;
      });
    },
    [orderItemId],
  );

  return { prefs, setPrefs, hydrated };
}
