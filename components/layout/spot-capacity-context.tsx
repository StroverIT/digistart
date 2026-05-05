"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SpotCapacity } from "@/lib/server/spot-capacity";

const SpotCapacityContext = createContext<SpotCapacity | null>(null);

const REFRESH_INTERVAL_MS = 60_000;

async function fetchSpotCapacity(): Promise<SpotCapacity> {
  const res = await fetch("/api/public/spot-capacity", { cache: "no-store" });
  if (!res.ok) throw new Error("spot-capacity fetch failed");
  return res.json() as Promise<SpotCapacity>;
}

export function SpotCapacityProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: SpotCapacity;
}) {
  const [capacity, setCapacity] = useState<SpotCapacity>(initialData);

  const refresh = useCallback(() => {
    void fetchSpotCapacity()
      .then(setCapacity)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  const value = useMemo(() => capacity, [capacity]);

  return (
    <SpotCapacityContext.Provider value={value}>{children}</SpotCapacityContext.Provider>
  );
}

/** Returns capacity when wrapped by SpotCapacityProvider; null on routes without the provider (e.g. /user). */
export function useSpotCapacityOptional(): SpotCapacity | null {
  return useContext(SpotCapacityContext);
}

export function useSpotCapacity(): SpotCapacity {
  const ctx = useContext(SpotCapacityContext);
  if (!ctx) {
    throw new Error("useSpotCapacity must be used within SpotCapacityProvider");
  }
  return ctx;
}
