"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFunnelById } from "@/config/service-funnels";
import type { FunnelCompetitorStat } from "@/lib/analytics/types";
import { RankedStatsList, type RankedStatItem } from "@/components/admin/ranked-stats-list";

type UserDecisionsPanelProps = {
  funnelCompetitorStats: FunnelCompetitorStat[];
};

function getFunnelLabel(funnelId: string): string {
  const funnel = getFunnelById(funnelId);
  return funnel?.adminLabel ?? funnelId;
}

function aggregateByPlatform(stats: FunnelCompetitorStat[]): RankedStatItem[] {
  const byPlatform = new Map<string, RankedStatItem>();

  for (const entry of stats) {
    const existing = byPlatform.get(entry.platform);
    if (existing) {
      existing.count += entry.count;
      continue;
    }

    byPlatform.set(entry.platform, {
      id: entry.platform,
      label: entry.label,
      count: entry.count,
    });
  }

  return Array.from(byPlatform.values())
    .sort((a, b) => b.count - a.count)
    .map((item, index) => ({
      ...item,
      badge: index === 0 && item.count > 0 ? "Най-често" : undefined,
    }));
}

function buildPerFunnelItems(stats: FunnelCompetitorStat[]): RankedStatItem[] {
  return [...stats]
    .sort((a, b) => b.count - a.count)
    .map((entry) => ({
      id: `${entry.funnelId}-${entry.platform}-${entry.otherLabel ?? ""}`,
      label: entry.label,
      count: entry.count,
      subtitle: getFunnelLabel(entry.funnelId),
    }));
}

export function UserDecisionsPanel({ funnelCompetitorStats }: UserDecisionsPanelProps) {
  const platformItems = useMemo(
    () => aggregateByPlatform(funnelCompetitorStats),
    [funnelCompetitorStats],
  );
  const perFunnelItems = useMemo(
    () => buildPerFunnelItems(funnelCompetitorStats),
    [funnelCompetitorStats],
  );
  const totalDecisions = useMemo(
    () => funnelCompetitorStats.reduce((sum, entry) => sum + entry.count, 0),
    [funnelCompetitorStats],
  );

  return (
    <Card data-admin-animate className="bg-card border-border">
      <CardHeader>
        <CardTitle>Решения на посетителите</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Отговори на „От коя платформа идваш?“ — общо {totalDecisions} избора
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">По платформа (най-често → най-рядко)</h3>
          <RankedStatsList
            items={platformItems}
            emptyMessage="Все още няма избрани платформи от посетители."
            countLabel="избора"
          />
        </div>

        {perFunnelItems.length > 0 ? (
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">По funnel</h3>
            <RankedStatsList
              items={perFunnelItems}
              emptyMessage=""
              countLabel="избора"
              showRank
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
