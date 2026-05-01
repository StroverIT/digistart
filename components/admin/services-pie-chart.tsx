"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";
import type { ServiceStats } from "@/lib/types";
import { formatPriceWithBgn } from "@/components/ui/price";

interface ServicesPieChartProps {
  data: ServiceStats[];
}

const COLORS = [
  "oklch(0.65 0.22 250)", // Primary blue
  "oklch(0.7 0.18 180)",  // Teal
  "oklch(0.75 0.15 140)", // Green
  "oklch(0.65 0.2 300)",  // Purple
];

export function ServicesPieChart({ data }: ServicesPieChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length === 0) return;
    const el = wrapRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
      );
    }, el);
    return () => ctx.revert();
  }, [data.length]);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Няма данни
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.serviceName,
    value: d.orderCount,
    revenue: d.revenue,
  }));

  return (
    <div ref={wrapRef} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                strokeWidth={0}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.99 0.003 260)",
              border: "1px solid oklch(0.9 0.01 260)",
              borderRadius: "8px",
              color: "oklch(0.13 0.005 260)",
            }}
            formatter={(value: number, name: string, props) => [
              `${value} поръчки (${formatPriceWithBgn(props.payload.revenue)})`,
              name,
            ]}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
            formatter={(value) => (
              <span style={{ color: "oklch(0.13 0.005 260)" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
