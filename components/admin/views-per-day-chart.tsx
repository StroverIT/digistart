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
} from "recharts";

export type ViewsPerDayRow = { date: string; visits: number };

interface ViewsPerDayChartProps {
  data: ViewsPerDayRow[];
}

export function ViewsPerDayChart({ data }: ViewsPerDayChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
    }),
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
            formatter={(value: number) => [value, "Посещения"]}
          />
          <Bar dataKey="visits" fill="oklch(0.55 0.18 200)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
