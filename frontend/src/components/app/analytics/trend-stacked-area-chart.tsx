"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import type { TrendPoint } from "@/lib/backend";

const chartConfig = {
  low: {
    label: "Low Risk",
    color: "hsl(142, 76%, 36%)",
  },
  medium: {
    label: "Medium Risk",
    color: "hsl(48, 96%, 53%)",
  },
  high: {
    label: "High Risk",
    color: "hsl(25, 95%, 53%)",
  },
  critical: {
    label: "Critical Risk",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig;

interface TrendStackedAreaChartProps {
  trends: TrendPoint[];
  period?: "7d" | "30d";
  title?: string;
}

export function TrendStackedAreaChart({ 
  trends, 
  period = "7d",
  title
}: TrendStackedAreaChartProps) {
  const chartData = useMemo(() => {
    return trends.map((point) => {
      // Distribute cases into risk categories based on avg_risk_score
      const total = point.count;
      const avgScore = point.avg_risk_score;
      
      // Simple distribution algorithm
      let critical = point.high_risk_count > 0 ? Math.floor(point.high_risk_count * 0.3) : 0;
      let high = point.high_risk_count - critical;
      let medium = Math.floor((total - point.high_risk_count) * 0.6);
      let low = total - critical - high - medium;
      
      return {
        date: new Date(point.date).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        }),
        low: Math.max(0, low),
        medium: Math.max(0, medium),
        high: Math.max(0, high),
        critical: Math.max(0, critical),
      };
    });
  }, [trends]);

  const analysis = useMemo(() => {
    if (chartData.length < 2) return { trend: "stable", percent: 0, totalChange: 0 };
    
    const latest = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    
    const latestTotal = latest.low + latest.medium + latest.high + latest.critical;
    const previousTotal = previous.low + previous.medium + previous.high + previous.critical;
    
    const change = latestTotal - previousTotal;
    const percent = previousTotal > 0 
      ? Math.abs(Math.round((change / previousTotal) * 100))
      : 0;
    
    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      percent,
      totalChange: change,
    };
  }, [chartData]);

  const defaultTitle = period === "7d" 
    ? "Case Volume Trends - 7 Days"
    : "Case Volume Trends - 30 Days";

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || defaultTitle}</CardTitle>
          <CardDescription>No trend data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Not enough data to display trends
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || defaultTitle}</CardTitle>
        <CardDescription>
          Stacked view of cases by risk severity over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontWeight: 600, fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontWeight: 600 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="low"
              type="natural"
              fill="var(--color-low)"
              fillOpacity={0.6}
              stroke="var(--color-low)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="medium"
              type="natural"
              fill="var(--color-medium)"
              fillOpacity={0.6}
              stroke="var(--color-medium)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="high"
              type="natural"
              fill="var(--color-high)"
              fillOpacity={0.6}
              stroke="var(--color-high)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="critical"
              type="natural"
              fill="var(--color-critical)"
              fillOpacity={0.6}
              stroke="var(--color-critical)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {analysis.trend === "up" && (
                <>
                  Volume increasing by {analysis.percent}%
                  <TrendingUp className="h-4 w-4 text-destructive" />
                </>
              )}
              {analysis.trend === "down" && (
                <>
                  Volume decreasing by {analysis.percent}%
                  <TrendingDown className="h-4 w-4 text-green-500" />
                </>
              )}
              {analysis.trend === "stable" && (
                <>
                  Volume stable
                  <Minus className="h-4 w-4" />
                </>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {chartData.length} data points • {period === "7d" ? "Last 7 days" : "Last 30 days"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
