"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFunnelById } from "@/config/service-funnels";
import type { FunnelSalesStageAggregate } from "@/lib/analytics/types";
import { SALES_STAGE_PATH_LABELS } from "@/lib/funnel/sales-stage";
import { RankedStatsList, type RankedStatItem } from "@/components/admin/ranked-stats-list";

type FunnelSalesStagePanelProps = {
  stats: FunnelSalesStageAggregate;
};

function getFunnelLabel(funnelId: string): string {
  const funnel = getFunnelById(funnelId);
  return funnel?.adminLabel ?? funnelId;
}

function buildPerFunnelItems(stats: FunnelSalesStageAggregate): RankedStatItem[] {
  return stats.byFunnel.map((entry) => ({
    id: `${entry.funnelId}-${entry.pathId}`,
    label: entry.label,
    count: entry.count,
    subtitle: getFunnelLabel(entry.funnelId),
  }));
}

function buildPathItems(stats: FunnelSalesStageAggregate): RankedStatItem[] {
  return stats.byPath.map((entry, index) => ({
    id: entry.pathId,
    label: entry.label,
    count: entry.count,
    badge: index === 0 && entry.count > 0 ? "Най-често" : undefined,
  }));
}

export function FunnelSalesStagePanel({ stats }: FunnelSalesStagePanelProps) {
  const pathItems = useMemo(() => buildPathItems(stats), [stats]);
  const perFunnelItems = useMemo(() => buildPerFunnelItems(stats), [stats]);

  return (
    <Card data-admin-animate className="bg-card border-border">
      <CardHeader>
        <CardTitle>Етап на продажби</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Отговори на „Какво правиш в момента?“ — общо {stats.allTimeTotal} избора
          {stats.lastDaysTotal > 0 ? ` (${stats.lastDaysTotal} за 30 дни)` : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">По отговор</h3>
          <RankedStatsList
            items={pathItems}
            emptyMessage="Все още няма избрани отговори от посетители."
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

        {stats.dailyTotals.length > 0 ? (
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Избори по дни (30 дни)</h3>
            <FunnelSalesStageDailyChart stats={stats} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FunnelSalesStageDailyChart({ stats }: { stats: FunnelSalesStageAggregate }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();

    for (const row of stats.dailyTotals) {
      byDate.set(row.date, {
        date: row.date,
        total: row.totalSelections,
        starting: 0,
        selling: 0,
      });
    }

    for (const row of stats.dailyByPath) {
      const existing = byDate.get(row.date) ?? {
        date: row.date,
        total: 0,
        starting: 0,
        selling: 0,
      };
      if (row.pathId === "starting" || row.pathId === "selling") {
        existing[row.pathId] = row.count;
      }
      byDate.set(row.date, existing);
    }

    return Array.from(byDate.values())
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((row) => ({
        date: new Date(String(row.date)).toLocaleDateString("bg-BG", {
          day: "numeric",
          month: "short",
        }),
        [SALES_STAGE_PATH_LABELS.starting]: row.starting as number,
        [SALES_STAGE_PATH_LABELS.selling]: row.selling as number,
      }));
  }, [stats.dailyByPath, stats.dailyTotals]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || chartData.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
      );
    }, el);
    return () => ctx.revert();
  }, [chartData.length]);

  if (chartData.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Няма данни за избрания период
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" />
          <XAxis
            dataKey="date"
            stroke="oklch(0.45 0.02 260)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="oklch(0.45 0.02 260)"
            fontSize={12}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.9 0.01 260)",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar
            dataKey={SALES_STAGE_PATH_LABELS.starting}
            stackId="stage"
            fill="oklch(0.55 0.18 280)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey={SALES_STAGE_PATH_LABELS.selling}
            stackId="stage"
            fill="oklch(0.65 0.15 200)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
