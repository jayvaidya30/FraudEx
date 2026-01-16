"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
  avgRisk: {
    label: "Avg Risk Score",
    color: "var(--chart-1)",
  },
  highRisk: {
    label: "High Risk Cases",
    color: "var(--chart-2)",
  },
  totalCases: {
    label: "Total Cases",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface RiskTrendLineChartProps {
  trends: TrendPoint[];
  period?: "7d" | "30d";
  title?: string;
}

export function RiskTrendLineChart({ 
  trends, 
  period = "7d",
  title
}: RiskTrendLineChartProps) {
  const chartData = useMemo(() => {
    return trends.map((point) => ({
      date: new Date(point.date).toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      }),
      avgRisk: Math.round(point.avg_risk_score),
      highRisk: point.high_risk_count,
      totalCases: point.count,
    }));
  }, [trends]);

  const analysis = useMemo(() => {
    if (chartData.length < 2) return { trend: "stable", percent: 0 };
    
    const latest = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    
    const change = latest.avgRisk - previous.avgRisk;
    const percent = previous.avgRisk > 0 
      ? Math.abs(Math.round((change / previous.avgRisk) * 100))
      : 0;
    
    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      percent,
    };
  }, [chartData]);

  const defaultTitle = period === "7d" 
    ? "Risk Trends - Last 7 Days"
    : "Risk Trends - Last 30 Days";

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
          Tracking risk scores and case volume over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
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
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="avgRisk"
              type="monotone"
              stroke="var(--color-avgRisk)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="highRisk"
              type="monotone"
              stroke="var(--color-highRisk)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="totalCases"
              type="monotone"
              stroke="var(--color-totalCases)"
              strokeWidth={2}
              dot={true}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {analysis.trend !== "stable" && (
              <div className="flex items-center gap-2 leading-none font-medium">
                {analysis.trend === "up" ? "Risk increasing" : "Risk decreasing"} by {analysis.percent}%
                {analysis.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
              </div>
            )}
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {chartData.length} data points • {period === "7d" ? "Last 7 days" : "Last 30 days"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
