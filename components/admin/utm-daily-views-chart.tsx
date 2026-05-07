"use client";

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
import type { UtmDailyStats } from "@/lib/analytics/types";

const COLORS = [
  "oklch(0.65 0.22 250)",
  "oklch(0.65 0.2 170)",
  "oklch(0.72 0.18 90)",
  "oklch(0.65 0.22 20)",
  "oklch(0.68 0.2 320)",
];

function getEventKey(row: UtmDailyStats) {
  return `${row.utmSource} / ${row.utmMedium} / ${row.utmCampaign}`;
}

export function UtmDailyViewsChart({ data }: { data: UtmDailyStats[] }) {
  const totalsByEvent = new Map<string, number>();
  for (const row of data) {
    const key = getEventKey(row);
    totalsByEvent.set(key, (totalsByEvent.get(key) ?? 0) + row.views);
  }

  const topEvents = Array.from(totalsByEvent.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([event]) => event);

  const byDate = new Map<string, Record<string, string | number>>();
  for (const row of data) {
    const event = getEventKey(row);
    if (!topEvents.includes(event)) continue;
    const dateKey = row.date;
    const current = byDate.get(dateKey) ?? { date: dateKey };
    const previous = Number(current[event] ?? 0);
    current[event] = previous + row.views;
    byDate.set(dateKey, current);
  }

  const chartData = Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, value]) => ({
      ...value,
      dateLabel: new Date(String(value.date)).toLocaleDateString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
      }),
    }));

  if (chartData.length === 0 || topEvents.length === 0) {
    return (
      <div className="h-[320px] flex items-center justify-center text-muted-foreground">
        Няма дневни UTM данни
      </div>
    );
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" />
          <XAxis
            dataKey="dateLabel"
            stroke="oklch(0.45 0.02 260)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            stroke="oklch(0.45 0.02 260)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.99 0.003 260)",
              border: "1px solid oklch(0.9 0.01 260)",
              borderRadius: "8px",
              color: "oklch(0.13 0.005 260)",
            }}
          />
          <Legend />
          {topEvents.map((event, index) => (
            <Bar key={event} dataKey={event} stackId="views" fill={COLORS[index % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
