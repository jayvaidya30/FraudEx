"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { AlertTriangle } from "lucide-react";

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

import type { RiskDistribution } from "@/lib/backend";

const chartConfig = {
  cases: {
    label: "Cases",
  },
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

interface RiskDistributionBarChartProps {
  distribution: RiskDistribution;
  totalAnalyzed: number;
  averageScore: number;
  title?: string;
  description?: string;
}

export function RiskDistributionBarChart({ 
  distribution, 
  totalAnalyzed,
  averageScore,
  title = "Risk Distribution",
  description = "Breakdown of cases by risk severity"
}: RiskDistributionBarChartProps) {
  const chartData = useMemo(() => {
    return [
      {
        level: "Low",
        cases: distribution.low,
        fill: chartConfig.low.color,
        percentage: totalAnalyzed > 0 ? ((distribution.low / totalAnalyzed) * 100).toFixed(1) : "0",
      },
      {
        level: "Medium",
        cases: distribution.medium,
        fill: chartConfig.medium.color,
        percentage: totalAnalyzed > 0 ? ((distribution.medium / totalAnalyzed) * 100).toFixed(1) : "0",
      },
      {
        level: "High",
        cases: distribution.high,
        fill: chartConfig.high.color,
        percentage: totalAnalyzed > 0 ? ((distribution.high / totalAnalyzed) * 100).toFixed(1) : "0",
      },
      {
        level: "Critical",
        cases: distribution.critical,
        fill: chartConfig.critical.color,
        percentage: totalAnalyzed > 0 ? ((distribution.critical / totalAnalyzed) * 100).toFixed(1) : "0",
      },
    ];
  }, [distribution, totalAnalyzed]);

  const highAndCritical = distribution.high + distribution.critical;
  const highRiskPercentage = totalAnalyzed > 0 
    ? ((highAndCritical / totalAnalyzed) * 100).toFixed(1) 
    : "0";

  if (totalAnalyzed === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No analyzed cases yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
              right: 32,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="level"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontWeight: 600 }}
            />
            <XAxis 
              dataKey="cases" 
              type="number"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="cases" radius={5}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="cases"
                position="right"
                offset={12}
                className="fill-foreground font-semibold"
                fontSize={13}
                formatter={(value: number) => `${value} (${chartData.find(d => d.cases === value)?.percentage}%)`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Average Risk Score</p>
            <p className="text-2xl font-bold">{averageScore.toFixed(1)}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm font-medium text-muted-foreground">High Risk + Critical</p>
            <p className="text-2xl font-bold text-destructive">{highAndCritical} ({highRiskPercentage}%)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
