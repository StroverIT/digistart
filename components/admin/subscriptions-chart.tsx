"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatPriceWithBgn } from "@/components/ui/price";

interface DailySubscriptionStats {
  date: string;
  subscriptions: number;
  monthlyRevenue: number;
}

interface SubscriptionsChartProps {
  data: DailySubscriptionStats[];
}

export function SubscriptionsChart({ data }: SubscriptionsChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
    }),
    subscriptions: d.subscriptions,
    monthlyRevenue: d.monthlyRevenue,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Няма данни
      </div>
    );
  }

  return (
    <div className="h-[300px]">
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.99 0.003 260)",
              border: "1px solid oklch(0.9 0.01 260)",
              borderRadius: "8px",
              color: "oklch(0.13 0.005 260)",
            }}
            formatter={(value: number, name: string) => {
              if (name === "monthlyRevenue") {
                return [formatPriceWithBgn(value), "Месечен приход"];
              }
              return [value, "Нови абонаменти"];
            }}
          />
          <Bar
            dataKey="subscriptions"
            fill="oklch(0.62 0.23 255)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
