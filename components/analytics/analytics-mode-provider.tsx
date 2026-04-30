"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type {
  AnalyticsAdminResponse,
  CtaAnalyticsStats,
  PageAnalyticsStats,
} from "@/lib/analytics/types";

type AnalyticsModeContextValue = {
  isAdmin: boolean;
  isAnalyticsMode: boolean;
  showAllCtaStats: boolean;
  pageStats: PageAnalyticsStats[];
  ctaStats: CtaAnalyticsStats[];
  totalClicks: number;
  isLoading: boolean;
  toggleAnalyticsMode: () => void;
  toggleShowAllCtaStats: () => void;
  refreshAnalytics: () => Promise<void>;
  notifyCtaClicked: (page: string, ctaId: string) => void;
};

const AnalyticsModeContext = createContext<AnalyticsModeContextValue>({
  isAdmin: false,
  isAnalyticsMode: false,
  showAllCtaStats: false,
  pageStats: [],
  ctaStats: [],
  totalClicks: 0,
  isLoading: false,
  toggleAnalyticsMode: () => {},
  toggleShowAllCtaStats: () => {},
  refreshAnalytics: async () => {},
  notifyCtaClicked: () => {},
});

export function useAnalyticsMode() {
  return useContext(AnalyticsModeContext);
}

export function AnalyticsModeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [isAnalyticsMode, setIsAnalyticsMode] = useState(false);
  const [showAllCtaStats, setShowAllCtaStats] = useState(false);
  const [pageStats, setPageStats] = useState<PageAnalyticsStats[]>([]);
  const [ctaStats, setCtaStats] = useState<CtaAnalyticsStats[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = (await response.json()) as AnalyticsAdminResponse;
      setPageStats(data.pageStats);
      setCtaStats(data.ctaStats);
      setTotalClicks(data.totalClicks);
    } catch {
      setPageStats([]);
      setCtaStats([]);
      setTotalClicks(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const toggleAnalyticsMode = useCallback(() => {
    if (!isAdmin) return;
    setIsAnalyticsMode((prev) => {
      const next = !prev;
      if (next) void fetchAnalytics();
      return next;
    });
  }, [isAdmin, fetchAnalytics]);

  const toggleShowAllCtaStats = useCallback(() => {
    if (!isAdmin) return;
    setShowAllCtaStats((prev) => !prev);
  }, [isAdmin]);

  const notifyCtaClicked = useCallback((page: string, ctaId: string) => {
    setCtaStats((prev) => {
      const existing = prev.find((item) => item.page === page && item.ctaId === ctaId);
      const updated = existing
        ? prev.map((item) =>
            item.page === page && item.ctaId === ctaId
              ? { ...item, clicks: item.clicks + 1 }
              : item,
          )
        : [...prev, { page, ctaId, clicks: 1, percentageOfTotal: 0 }];

      const total = updated.reduce((sum, item) => sum + item.clicks, 0);
      return updated.map((item) => ({
        ...item,
        percentageOfTotal: total > 0 ? Math.round((item.clicks / total) * 10_000) / 100 : 0,
      }));
    });
    setTotalClicks((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({
      isAdmin,
      isAnalyticsMode,
      showAllCtaStats,
      pageStats,
      ctaStats,
      totalClicks,
      isLoading,
      toggleAnalyticsMode,
      toggleShowAllCtaStats,
      refreshAnalytics,
      notifyCtaClicked,
    }),
    [
      isAdmin,
      isAnalyticsMode,
      showAllCtaStats,
      pageStats,
      ctaStats,
      totalClicks,
      isLoading,
      toggleAnalyticsMode,
      toggleShowAllCtaStats,
      refreshAnalytics,
      notifyCtaClicked,
    ],
  );

  return (
    <AnalyticsModeContext.Provider value={value}>
      {children}
    </AnalyticsModeContext.Provider>
  );
}
