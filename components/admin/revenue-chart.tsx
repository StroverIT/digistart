"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { DailyStats } from "@/lib/types";
import { formatPriceWithBgn } from "@/components/ui/price";

interface RevenueChartProps {
  data: DailyStats[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
    }),
    revenue: d.revenue,
    visits: d.visits,
  }));

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
  }, [data.length]);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Няма данни
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.65 0.22 250)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.65 0.22 250)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(value) => formatPriceWithBgn(Number(value))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.99 0.003 260)",
              border: "1px solid oklch(0.9 0.01 260)",
              borderRadius: "8px",
              color: "oklch(0.13 0.005 260)",
            }}
            formatter={(value: number) => [formatPriceWithBgn(value), "Приходи"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="oklch(0.65 0.22 250)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
