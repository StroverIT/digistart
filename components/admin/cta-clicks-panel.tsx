"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CtaAnalyticsStats } from "@/lib/analytics/types";
import { RankedStatsList, type RankedStatItem } from "@/components/admin/ranked-stats-list";

type CtaClicksPanelProps = {
  ctaStats: CtaAnalyticsStats[];
  totalClicks: number;
};

function formatCtaLabel(ctaId: string): string {
  return ctaId.replace(/_/g, " ");
}

export function CtaClicksPanel({ ctaStats, totalClicks }: CtaClicksPanelProps) {
  const items = useMemo<RankedStatItem[]>(
    () =>
      [...ctaStats]
        .sort((a, b) => b.clicks - a.clicks)
        .map((cta, index) => ({
          id: `${cta.page}-${cta.ctaId}`,
          label: formatCtaLabel(cta.ctaId),
          count: cta.clicks,
          subtitle: `${cta.page} · ${cta.percentageOfTotal}% от всички кликове`,
          badge: index === 0 && cta.clicks > 0 ? "Най-кликнат" : undefined,
        })),
    [ctaStats],
  );

  return (
    <Card data-admin-animate className="bg-card border-border">
      <CardHeader>
        <CardTitle>Най-кликани CTA</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Подредени от най-много към най-малко кликове - общо {totalClicks} клика
        </p>
      </CardHeader>
      <CardContent>
        <RankedStatsList
          items={items}
          emptyMessage="Все още няма записани CTA кликове."
          countLabel="клика"
        />
      </CardContent>
    </Card>
  );
}
