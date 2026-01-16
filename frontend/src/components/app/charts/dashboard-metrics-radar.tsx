"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

interface DashboardMetricsRadarProps {
  totalCases: number;
  highRiskCases: number;
  criticalCases: number;
  pendingReview: number;
  uploaded: number;
  processing: number;
  failed: number;
}

export function DashboardMetricsRadar({
  totalCases,
  highRiskCases,
  criticalCases,
  pendingReview,
  uploaded,
  processing,
  failed,
}: DashboardMetricsRadarProps) {
  // Normalize to percentages for better visualization
  const maxValue = Math.max(totalCases, highRiskCases, criticalCases, pendingReview, uploaded, processing, failed, 1);
  const scaledMax = Math.ceil(maxValue * 1.1 / 10) * 10;
  
  const data = [
    {
      metric: "Total Cases",
      value: totalCases,
      percentage: (totalCases / maxValue) * 100,
    },
    {
      metric: "High Risk",
      value: highRiskCases,
      percentage: (highRiskCases / maxValue) * 100,
    },
    {
      metric: "Critical",
      value: criticalCases,
      percentage: (criticalCases / maxValue) * 100,
    },
    {
      metric: "Pending Review",
      value: pendingReview,
      percentage: (pendingReview / maxValue) * 100,
    },
    {
      metric: "Uploaded",
      value: uploaded,
      percentage: (uploaded / maxValue) * 100,
    },
    {
      metric: "Processing",
      value: processing,
      percentage: (processing / maxValue) * 100,
    },
    {
      metric: "Failed",
      value: failed,
      percentage: (failed / maxValue) * 100,
    },
  ];

  const chartConfig = {
    percentage: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Overview</CardTitle>
        <CardDescription>Real-time case status and risk distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                  indicator="line"
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const item = payload[0].payload;
                      return `${label}: ${item.value}`;
                    }
                    return label;
                  }}
                />}
              />
              <PolarAngleAxis dataKey="metric" tick={{ fontWeight: 600, fontSize: 11 }} />
              <PolarGrid />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                dataKey="percentage"
                fill="var(--color-percentage)"
                fillOpacity={0.75}
                stroke="var(--color-percentage)"
                strokeWidth={3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
