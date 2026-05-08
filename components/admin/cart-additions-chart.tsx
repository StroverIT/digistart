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

interface CartAdditionsChartProps {
  data: { date: string; totalAdds: number }[];
}

export function CartAdditionsChart({ data }: CartAdditionsChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const chartData = data.map((row) => ({
    date: new Date(row.date).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
    }),
    totalAdds: row.totalAdds,
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
  }, [chartData.length]);

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
            <linearGradient id="colorCartAdds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.66 0.2 160)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="oklch(0.66 0.2 160)" stopOpacity={0} />
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
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.99 0.003 260)",
              border: "1px solid oklch(0.9 0.01 260)",
              borderRadius: "8px",
              color: "oklch(0.13 0.005 260)",
            }}
            formatter={(value: number) => [value, "Добавяния"]}
          />
          <Area
            type="monotone"
            dataKey="totalAdds"
            stroke="oklch(0.66 0.2 160)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCartAdds)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
