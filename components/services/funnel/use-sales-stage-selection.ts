"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSalesStageAnswer,
  SALES_STAGE_UPDATED_EVENT,
  type SalesStageAnswer,
} from "@/lib/funnel/sales-stage";

export { SALES_STAGE_UPDATED_EVENT };

export function useSalesStageSelection(funnelId?: string) {
  const [answer, setAnswer] = useState<SalesStageAnswer | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    if (!funnelId) {
      setAnswer(null);
      return;
    }
    setAnswer(getSalesStageAnswer(funnelId));
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

    window.addEventListener(SALES_STAGE_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(SALES_STAGE_UPDATED_EVENT, onUpdate);
  }, [funnelId, refresh]);

  return {
    answer: hydrated ? answer : null,
    hydrated,
    hasAnswer: hydrated && answer !== null,
  };
}
