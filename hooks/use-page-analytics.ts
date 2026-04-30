"use client";

import { useEffect, useRef } from "react";
import { flushAnalyticsEvents, trackAnalyticsEvent } from "@/lib/analytics/tracker";

const SCROLL_MILESTONES = [25, 50, 75, 100];

export function usePageAnalytics(page: string) {
  const trackedRef = useRef(false);
  const maxScrollRef = useRef(0);
  const startedAtRef = useRef(0);
  const firedMilestonesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!page || trackedRef.current) return;

    trackedRef.current = true;
    startedAtRef.current = Date.now();
    trackAnalyticsEvent("page_view", page);

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const percentage = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
      maxScrollRef.current = Math.max(maxScrollRef.current, percentage);

      for (const milestone of SCROLL_MILESTONES) {
        if (percentage >= milestone && !firedMilestonesRef.current.has(milestone)) {
          firedMilestonesRef.current.add(milestone);
          trackAnalyticsEvent("scroll_depth", page, { scroll_percentage: milestone });
        }
      }
    };

    const onHide = () => {
      const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      trackAnalyticsEvent("time_on_page", page, {
        duration_seconds: durationSeconds,
        max_scroll_percentage: maxScrollRef.current,
      });
      flushAnalyticsEvents();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") onHide();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onHide);

    return () => {
      onHide();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onHide);
    };
  }, [page]);
}
