"use client";

import { useCallback, useEffect, useState } from "react";
import {
  COMPETITOR_PLATFORM_UPDATED_EVENT,
  getCompetitorPlatformAnswer,
  type CompetitorPlatformAnswer,
} from "@/lib/funnel/competitor-platform";
import { getCompetitorPlatformDisplayLabel } from "@/lib/funnel/competitor-platform-personalization";

export { COMPETITOR_PLATFORM_UPDATED_EVENT };

export function useCompetitorPlatformSelection(funnelId?: string) {
  const [answer, setAnswer] = useState<CompetitorPlatformAnswer | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    if (!funnelId) {
      setAnswer(null);
      return;
    }
    setAnswer(getCompetitorPlatformAnswer(funnelId));
  }, [funnelId]);

  useEffect(() => {
    refresh();
    setHydrated(true);

    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ funnelId?: string }>).detail;
      if (!funnelId || detail?.funnelId === funnelId) {
        refresh();
      }
    };

    window.addEventListener(COMPETITOR_PLATFORM_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(COMPETITOR_PLATFORM_UPDATED_EVENT, onUpdate);
  }, [funnelId, refresh]);

  const displayLabel =
    hydrated && answer ? getCompetitorPlatformDisplayLabel(answer) : null;

  return {
    answer: hydrated ? answer : null,
    displayLabel,
    hydrated,
  };
}
