"use client";

import { useEffect, useRef } from "react";
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

interface CartAdditionsChartProps {
  dailyTotals: { date: string; totalAdds: number }[];
  dailyByCombo: { date: string; comboKey: string; count: number }[];
  combos: { comboKey: string; serviceName: string; comboLabel: string; count: number }[];
}

const COLORS = [
  "oklch(0.66 0.2 160)",
  "oklch(0.65 0.22 250)",
  "oklch(0.7 0.18 180)",
  "oklch(0.75 0.15 140)",
  "oklch(0.65 0.2 300)",
  "oklch(0.72 0.16 80)",
];

export function CartAdditionsChart({ dailyTotals, dailyByCombo, combos }: CartAdditionsChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const topCombos = combos.slice(0, 6);
  const comboLabels = new Map(
    topCombos.map((combo) => [
      combo.comboKey,
      `${combo.serviceName} - ${combo.comboLabel}`,
    ]),
  );
  const topComboKeys = new Set(topCombos.map((combo) => combo.comboKey));

  const chartData = dailyTotals.map((row) => {
    const formatted = {
      date: new Date(row.date).toLocaleDateString("bg-BG", {
        day: "numeric",
        month: "short",
      }),
      totalAdds: row.totalAdds,
    } as Record<string, string | number>;

    for (const comboKey of topComboKeys) {
      formatted[comboKey] = 0;
    }
    formatted.other = 0;
    return formatted;
  });
  const dateIndex = new Map(dailyTotals.map((row, index) => [row.date, index]));

  for (const row of dailyByCombo) {
    const idx = dateIndex.get(row.date) ?? -1;
    if (idx === -1) continue;
    if (topComboKeys.has(row.comboKey)) {
      chartData[idx][row.comboKey] = Number(chartData[idx][row.comboKey] ?? 0) + row.count;
    } else {
      chartData[idx].other = Number(chartData[idx].other ?? 0) + row.count;
    }
  }

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

  if (dailyTotals.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Няма данни
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)" />
          <XAxis
            dataKey="date"
            stroke="oklch(0.45 0.02 260)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="oklch(0.45 0.02 260)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.99 0.003 260)",
              border: "1px solid oklch(0.9 0.01 260)",
              borderRadius: "8px",
              color: "oklch(0.13 0.005 260)",
            }}
            formatter={(value: number, name: string) => {
              if (name === "other") return [value, "Други комбинации"];
              return [value, comboLabels.get(name) ?? name];
            }}
          />
          <Legend
            formatter={(value: string) =>
              value === "other" ? "Други комбинации" : (comboLabels.get(value) ?? value)
            }
          />
          {topCombos.map((combo, index) => (
            <Bar
              key={combo.comboKey}
              dataKey={combo.comboKey}
              stackId="cartAdditions"
              fill={COLORS[index % COLORS.length]}
            />
          ))}
          <Bar dataKey="other" stackId="cartAdditions" fill="oklch(0.78 0.01 260)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
