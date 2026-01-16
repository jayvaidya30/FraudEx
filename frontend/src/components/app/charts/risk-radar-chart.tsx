"use client";

import { useMemo } from "react";
import { TrendingUp, Shield } from "lucide-react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";

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

import type { DetectorStats } from "@/lib/backend";

const chartConfig = {
  triggered: {
    label: "Triggered Count",
    color: "var(--chart-1)",
  },
  avgScore: {
    label: "Avg Score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface RiskRadarChartProps {
  detectorStats: DetectorStats[];
  title?: string;
  description?: string;
}

export function RiskRadarChart({ 
  detectorStats, 
  title = "Risk Detector Performance",
  description = "Analysis of detector effectiveness across different fraud indicators"
}: RiskRadarChartProps) {
  const chartData = useMemo(() => {
    // Take top 6 detectors by trigger count
    const topDetectors = [...detectorStats]
      .sort((a, b) => b.triggered_count - a.triggered_count)
      .slice(0, 6);

    return topDetectors.map((stat) => ({
      detector: stat.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      triggered: stat.triggered_count,
      avgScore: Math.round(stat.avg_score),
    }));
  }, [detectorStats]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const maxTriggered = Math.max(...chartData.map(d => d.triggered));
    const maxScore = Math.max(...chartData.map(d => d.avgScore));
    const maxVal = Math.max(maxTriggered, maxScore);
    // Round up to nearest 10 with at least 10% padding
    return Math.ceil(maxVal * 1.1 / 10) * 10;
  }, [chartData]);

  const trend = useMemo(() => {
    if (detectorStats.length === 0) return { percent: 0, direction: "stable" as const };
    const avgRate = detectorStats.reduce((sum, d) => sum + d.detection_rate, 0) / detectorStats.length;
    return {
      percent: Math.round(avgRate * 100),
      direction: avgRate > 0.5 ? "up" as const : "stable" as const,
    };
  }, [detectorStats]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No detector data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey="detector" tick={{ fontWeight: 600, fontSize: 12 }} />
            <PolarGrid />
            <PolarRadiusAxis angle={90} domain={[0, maxValue]} />
            <Radar
              dataKey="triggered"
              fill="var(--color-triggered)"
              fillOpacity={0.75}
              stroke="var(--color-triggered)"
              strokeWidth={3}
            />
            <Radar
              dataKey="avgScore"
              fill="var(--color-avgScore)"
              fillOpacity={0.5}
              stroke="var(--color-avgScore)"
              strokeWidth={3}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Detection rate: {trend.percent}% {trend.direction === "up" && <TrendingUp className="h-4 w-4" />}
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          {detectorStats.length} detectors active
        </div>
      </CardFooter>
    </Card>
  );
}
