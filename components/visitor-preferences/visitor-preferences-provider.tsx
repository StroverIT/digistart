"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_SALES_CHANNELS } from "@/lib/visitor-preferences/constants";
import {
  getEffectiveOtherChannelLabel,
  getEffectiveSalesChannels,
  getPreferences,
} from "@/lib/visitor-preferences/storage";
import type { SalesChannel, VisitorPreferencesV1 } from "@/lib/visitor-preferences/types";

type VisitorPreferencesContextValue = {
  preferences: VisitorPreferencesV1 | null;
  effectiveChannels: SalesChannel[];
  otherChannelLabel: string | undefined;
  refresh: () => void;
};

const VisitorPreferencesContext = createContext<VisitorPreferencesContextValue | null>(null);

export function VisitorPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<VisitorPreferencesV1 | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setPreferences(getPreferences());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);

    const onUpdate = () => refresh();
    window.addEventListener("visitor-preferences-updated", onUpdate);
    return () => window.removeEventListener("visitor-preferences-updated", onUpdate);
  }, [refresh]);

  const effectiveChannels = useMemo(() => {
    if (!hydrated) return [...DEFAULT_SALES_CHANNELS];
    return getEffectiveSalesChannels();
  }, [hydrated, preferences]);

  const otherChannelLabel = useMemo(() => {
    if (!hydrated) return undefined;
    return getEffectiveOtherChannelLabel();
  }, [hydrated, preferences]);

  const value = useMemo(
    () => ({
      preferences,
      effectiveChannels,
      otherChannelLabel,
      refresh,
    }),
    [preferences, effectiveChannels, otherChannelLabel, refresh],
  );

  return (
    <VisitorPreferencesContext.Provider value={value}>
      {children}
    </VisitorPreferencesContext.Provider>
  );
}

export function useVisitorPreferences(): VisitorPreferencesContextValue {
  const ctx = useContext(VisitorPreferencesContext);
  if (!ctx) {
    throw new Error("useVisitorPreferences must be used within VisitorPreferencesProvider");
  }
  return ctx;
}
