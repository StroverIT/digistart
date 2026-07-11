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
import type { ConsultationSourceAggregate } from "@/lib/analytics/types";
import { RankedStatsList, type RankedStatItem } from "@/components/admin/ranked-stats-list";

const AUDIENCE_SEGMENT_LABELS = {
  starting: "Искам да продавам",
  selling: "Вече продавам",
} as const;

type ConsultationSourcesPanelProps = {
  stats: ConsultationSourceAggregate;
};

function buildSegmentItems(stats: ConsultationSourceAggregate): RankedStatItem[] {
  return stats.bySegment.map((entry, index) => ({
    id: entry.segment,
    label: entry.label,
    count: entry.bookings,
    badge: index === 0 && entry.bookings > 0 ? "Най-често" : undefined,
  }));
}

function buildPageItems(stats: ConsultationSourceAggregate): RankedStatItem[] {
  return stats.byPage.map((entry) => ({
    id: entry.key,
    label: entry.label,
    count: entry.bookings,
    subtitle: entry.pagePath,
  }));
}

export function ConsultationSourcesPanel({ stats }: ConsultationSourcesPanelProps) {
  const segmentItems = useMemo(() => buildSegmentItems(stats), [stats]);
  const pageItems = useMemo(() => buildPageItems(stats), [stats]);

  return (
    <Card data-admin-animate className="bg-card border-border">
      <CardHeader>
        <CardTitle>Консултации по източник</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          От коя страница идват записаните консултации — общо {stats.allTimeTotal} записа
          {stats.lastDaysTotal > 0 ? ` (${stats.lastDaysTotal} за 30 дни)` : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {segmentItems.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold mb-3">Денонощна машина по аудитория</h3>
            <RankedStatsList
              items={segmentItems}
              emptyMessage=""
              countLabel="консултации"
            />
          </div>
        ) : null}

        <div className={segmentItems.length > 0 ? "pt-4 border-t border-border" : undefined}>
          <h3 className="text-sm font-semibold mb-3">По страница</h3>
          <RankedStatsList
            items={pageItems}
            emptyMessage="Все още няма записани консултации с източник."
            countLabel="консултации"
            showRank
          />
        </div>

        {stats.dailyTotals.length > 0 ? (
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Консултации по дни (30 дни)</h3>
            <ConsultationSourcesDailyChart stats={stats} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ConsultationSourcesDailyChart({ stats }: { stats: ConsultationSourceAggregate }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();

    for (const row of stats.dailyTotals) {
      byDate.set(row.date, {
        date: row.date,
        total: row.totalBookings,
        starting: 0,
        selling: 0,
      });
    }

    for (const row of stats.dailyBySegment) {
      const existing = byDate.get(row.date) ?? {
        date: row.date,
        total: 0,
        starting: 0,
        selling: 0,
      };
      if (row.segment === "starting" || row.segment === "selling") {
        existing[row.segment] = row.bookings;
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
        [AUDIENCE_SEGMENT_LABELS.starting]: row.starting as number,
        [AUDIENCE_SEGMENT_LABELS.selling]: row.selling as number,
        Общо: row.total as number,
      }));
  }, [stats.dailyBySegment, stats.dailyTotals]);

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

  const hasAudienceSegments = stats.dailyBySegment.length > 0;

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
          {hasAudienceSegments ? (
            <>
              <Bar
                dataKey={AUDIENCE_SEGMENT_LABELS.starting}
                stackId="consultations"
                fill="oklch(0.55 0.18 280)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey={AUDIENCE_SEGMENT_LABELS.selling}
                stackId="consultations"
                fill="oklch(0.65 0.15 200)"
                radius={[4, 4, 0, 0]}
              />
            </>
          ) : (
            <Bar dataKey="Общо" fill="oklch(0.55 0.18 280)" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
