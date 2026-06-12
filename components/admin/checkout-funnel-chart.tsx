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
import { CHECKOUT_FUNNEL_STAGE_LABELS } from "@/lib/analytics/checkout-funnel";

interface CheckoutFunnelChartProps {
  dailyStarts: { date: string; starts: number }[];
  dailyByStage: { date: string; stage: string; count: number }[];
}

const STAGE_COLORS: Record<string, string> = {
  account: "oklch(0.66 0.2 160)",
  business: "oklch(0.65 0.22 250)",
  payment: "oklch(0.7 0.18 180)",
};

const STAGES = ["account", "business", "payment"] as const;

export function CheckoutFunnelChart({ dailyStarts, dailyByStage }: CheckoutFunnelChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const chartData = dailyStarts.map((row) => {
    const formatted = {
      date: new Date(row.date).toLocaleDateString("bg-BG", {
        day: "numeric",
        month: "short",
      }),
      starts: row.starts,
    } as Record<string, string | number>;

    for (const stage of STAGES) {
      formatted[stage] = 0;
    }
    return formatted;
  });

  const dateIndex = new Map(dailyStarts.map((row, index) => [row.date, index]));

  for (const row of dailyByStage) {
    const idx = dateIndex.get(row.date) ?? -1;
    if (idx === -1) continue;
    if (STAGES.includes(row.stage as (typeof STAGES)[number])) {
      chartData[idx][row.stage] = row.count;
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

  if (dailyStarts.length === 0) {
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
            formatter={(value: number, name: string) => [
              value,
              CHECKOUT_FUNNEL_STAGE_LABELS[name as keyof typeof CHECKOUT_FUNNEL_STAGE_LABELS] ??
                name,
            ]}
          />
          <Legend
            formatter={(value: string) =>
              CHECKOUT_FUNNEL_STAGE_LABELS[value as keyof typeof CHECKOUT_FUNNEL_STAGE_LABELS] ??
              value
            }
          />
          {STAGES.map((stage) => (
            <Bar
              key={stage}
              dataKey={stage}
              stackId="checkoutFunnel"
              fill={STAGE_COLORS[stage]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
