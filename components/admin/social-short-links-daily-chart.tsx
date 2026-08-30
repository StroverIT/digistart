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
import type { ShortLinkDailyStat } from "@/lib/analytics/types";

const COLORS = [
  "oklch(0.65 0.22 320)",
  "oklch(0.65 0.22 250)",
  "oklch(0.65 0.2 170)",
  "oklch(0.72 0.18 90)",
  "oklch(0.65 0.22 20)",
];

export function SocialShortLinksDailyChart({ data }: { data: ShortLinkDailyStat[] }) {
  const totalsByLink = new Map<string, number>();
  for (const row of data) {
    totalsByLink.set(row.label, (totalsByLink.get(row.label) ?? 0) + row.views);
  }

  const topLinks = Array.from(totalsByLink.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label]) => label);

  const byDate = new Map<string, Record<string, string | number>>();
  for (const row of data) {
    if (!topLinks.includes(row.label)) continue;
    const current = byDate.get(row.date) ?? { date: row.date };
    const previous = Number(current[row.label] ?? 0);
    current[row.label] = previous + row.views;
    byDate.set(row.date, current);
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

  if (chartData.length === 0 || topLinks.length === 0) {
    return (
      <div className="h-[320px] flex items-center justify-center text-muted-foreground">
        Няма кликове от социални линкове за избрания период
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
          {topLinks.map((label, index) => (
            <Bar key={label} dataKey={label} stackId="views" fill={COLORS[index % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
