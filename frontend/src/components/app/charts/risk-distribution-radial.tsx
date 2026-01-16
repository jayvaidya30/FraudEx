"use client";

import { useMemo } from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

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
  type ChartConfig,
} from "@/components/ui/chart";

import type { RiskDistribution } from "@/lib/backend";

const chartConfig = {
  cases: {
    label: "Cases",
  },
  critical: {
    label: "Critical",
    color: "var(--destructive)",
  },
  high: {
    label: "High",
    color: "var(--chart-1)",
  },
  medium: {
    label: "Medium",
    color: "var(--chart-2)",
  },
  low: {
    label: "Low",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface RiskDistributionRadialProps {
  riskDistribution: RiskDistribution;
  totalAnalyzed: number;
  averageScore: number;
  title?: string;
  description?: string;
}

export function RiskDistributionRadial({ 
  riskDistribution,
  totalAnalyzed,
  averageScore,
  title = "Risk Distribution",
  description = "Breakdown of analyzed cases by risk level"
}: RiskDistributionRadialProps) {
  const chartData = useMemo(() => {
    const criticalPercent = totalAnalyzed > 0 
      ? Math.round((riskDistribution.critical / totalAnalyzed) * 100)
      : 0;
    
    return [
      { 
        level: "critical", 
        cases: riskDistribution.critical,
        fill: "var(--color-critical)",
        percent: criticalPercent
      },
    ];
  }, [riskDistribution, totalAnalyzed]);

  const summary = useMemo(() => {
    const highRisk = riskDistribution.high + riskDistribution.critical;
    const highRiskPercent = totalAnalyzed > 0
      ? Math.round((highRisk / totalAnalyzed) * 100)
      : 0;
    
    return {
      highRisk,
      highRiskPercent,
      trend: highRiskPercent > 20 ? "up" : "stable",
    };
  }, [riskDistribution, totalAnalyzed]);

  if (totalAnalyzed === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No analyzed cases</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={(chartData[0].percent / 100) * 360}
            innerRadius={80}
            outerRadius={140}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar 
              dataKey="cases" 
              background 
              cornerRadius={10}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {Math.round(averageScore)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Avg Risk
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {summary.highRiskPercent}% high risk cases
          {summary.trend === "up" && <TrendingUp className="h-4 w-4 text-destructive" />}
        </div>
        <div className="text-muted-foreground leading-none">
          {totalAnalyzed} cases analyzed • {riskDistribution.critical} critical
        </div>
      </CardFooter>
    </Card>
  );
}
