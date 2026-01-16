"use client";

import { useMemo } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  score: {
    label: "Risk Score",
    color: "var(--chart-1)",
  },
  weighted: {
    label: "Weighted Impact",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type DetectorBreakdown = {
  score?: number;
  weight?: number;
  confidence?: number;
  indicators?: Record<string, unknown>;
  explanation?: string;
};

interface DetectorRadarChartProps {
  detectorBreakdown: Record<string, DetectorBreakdown>;
  title?: string;
  description?: string;
}

function formatDetectorName(name: string) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function DetectorRadarChart({ 
  detectorBreakdown,
  title = "Risk Detector Analysis",
  description = "Multi-dimensional fraud detection scores"
}: DetectorRadarChartProps) {
  const chartData = useMemo(() => {
    const entries = Object.entries(detectorBreakdown)
      .filter(([, data]) => (data?.score ?? 0) > 0)
      .sort((a, b) => (b[1]?.score ?? 0) - (a[1]?.score ?? 0));

    if (entries.length === 0) {
      return [];
    }

    return entries.map(([name, data]) => ({
      detector: formatDetectorName(name),
      score: Math.round(data?.score ?? 0),
      weighted: Math.round((data?.score ?? 0) * (data?.weight ?? 1)),
    }));
  }, [detectorBreakdown]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const maxScore = Math.max(...chartData.map(d => d.score));
    const maxWeighted = Math.max(...chartData.map(d => d.weighted));
    const maxVal = Math.max(maxScore, maxWeighted);
    // Round up to nearest 10 with at least 10% padding
    return Math.ceil(maxVal * 1.1 / 10) * 10;
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>No active detectors</p>
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
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey="detector" tick={{ fontWeight: 600, fontSize: 11 }} />
            <PolarGrid />
            <PolarRadiusAxis angle={90} domain={[0, maxValue]} />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.75}
              stroke="var(--color-score)"
              strokeWidth={3}
            />
            <Radar
              dataKey="weighted"
              fill="var(--color-weighted)"
              fillOpacity={0.5}
              stroke="var(--color-weighted)"
              strokeWidth={3}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
