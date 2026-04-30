"use client";

import { BarChart3, Eye } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAnalyticsMode } from "@/components/analytics/analytics-mode-provider";

export function AnalyticsToolbar() {
  const pathname = usePathname();
  const {
    isAdmin,
    isAnalyticsMode,
    showAllCtaStats,
    pageStats,
    isLoading,
    toggleAnalyticsMode,
    toggleShowAllCtaStats,
  } = useAnalyticsMode();

  if (!isAdmin) return null;

  const currentPageViews =
    pageStats.find((stat) => stat.page === pathname)?.views ??
    pageStats.find((stat) => stat.page === "/")?.views ??
    0;

  return (
    <div className="flex items-center gap-2">
      {isAnalyticsMode ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
          <Eye className="h-3.5 w-3.5" />
          {isLoading ? "Зареждане..." : `${currentPageViews} views`}
        </span>
      ) : null}
      <Button
        type="button"
        variant={isAnalyticsMode ? "default" : "outline"}
        size="sm"
        onClick={toggleAnalyticsMode}
      >
        <BarChart3 className="h-4 w-4 mr-1" />
        Аналитики
      </Button>
      {isAnalyticsMode ? (
        <Button type="button" variant={showAllCtaStats ? "default" : "outline"} size="sm" onClick={toggleShowAllCtaStats}>
          Показвай всички
        </Button>
      ) : null}
    </div>
  );
}
