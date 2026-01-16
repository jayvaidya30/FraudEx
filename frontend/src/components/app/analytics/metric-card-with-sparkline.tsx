"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { Area, AreaChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface MetricCardWithSparklineProps {
  title: string;
  value: string | number;
  change?: number;
  data?: number[];
  icon?: LucideIcon;
  trend?: "up" | "down" | "stable";
  subtitle?: string;
}

export function MetricCardWithSparkline({
  title,
  value,
  change,
  data = [],
  icon: Icon,
  trend,
  subtitle,
}: MetricCardWithSparklineProps) {
  const sparklineData = useMemo(() => {
    return data.map((val, idx) => ({ index: idx, value: val }));
  }, [data]);

  const trendIcon = useMemo(() => {
    if (trend === "up") return TrendingUp;
    if (trend === "down") return TrendingDown;
    return Minus;
  }, [trend]);

  const TrendIcon = trendIcon;
  const trendColor = trend === "up" 
    ? "text-destructive" 
    : trend === "down" 
    ? "text-green-500" 
    : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>
          
          {(change !== undefined || subtitle) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {change !== undefined && (
                <span className={`flex items-center gap-1 font-medium ${trendColor}`}>
                  <TrendIcon className="h-3 w-3" />
                  {change > 0 ? "+" : ""}{change}%
                </span>
              )}
              {subtitle && <span>{subtitle}</span>}
            </div>
          )}

          {sparklineData.length > 0 && (
            <div className="h-[40px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  data={sparklineData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <Area
                    dataKey="value"
                    type="natural"
                    fill="var(--color-value)"
                    fillOpacity={0.35}
                    stroke="var(--color-value)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
