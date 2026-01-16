"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Hash,
  Scissors,
  Search,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DetectorStats } from "@/lib/backend";

const chartConfig = {
  detectionRate: {
    label: "Detection Rate",
    color: "hsl(var(--chart-1))",
  },
  triggered: {
    label: "Triggered",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface DetectorPerformanceBarChartProps {
  stats: DetectorStats[];
  title?: string;
  description?: string;
}

function getDetectorIcon(name: string) {
  const icons: Record<string, React.ReactNode> = {
    BenfordDetector: <BarChart3 className="h-4 w-4" />,
    RoundNumberDetector: <Hash className="h-4 w-4" />,
    SplitInvoiceDetector: <Scissors className="h-4 w-4" />,
    BidRiggingDetector: <AlertTriangle className="h-4 w-4" />,
    KeywordDetector: <Search className="h-4 w-4" />,
    UrgencyDetector: <Zap className="h-4 w-4" />,
    VelocityDetector: <Clock className="h-4 w-4" />,
  };
  return icons[name] || <Activity className="h-4 w-4" />;
}

function formatDetectorName(name: string): string {
  return name
    .replace("Detector", "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

export function DetectorPerformanceBarChart({ 
  stats,
  title = "Detector Performance",
  description = "Effectiveness and trigger frequency" 
}: DetectorPerformanceBarChartProps) {
  const chartData = useMemo(() => {
    return [...stats]
      .sort((a, b) => b.detection_rate - a.detection_rate)
      .map((detector) => ({
        name: formatDetectorName(detector.name),
        fullName: detector.name,
        detectionRate: Math.round(detector.detection_rate * 100),
        triggered: detector.triggered_count,
        avgScore: detector.avg_score.toFixed(1),
        maxScore: detector.max_score.toFixed(1),
      }));
  }, [stats]);

  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No detector data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
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
              left: 80,
              right: 32,
            }}
          >
            <XAxis 
              type="number" 
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={70}
              tick={{ fontWeight: 600, fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                  hideLabel
                  formatter={(value, name, props) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {getDetectorIcon(props.payload.fullName)}
                        <span className="font-medium">{props.payload.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Detection Rate: {value}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Triggered: {props.payload.triggered} times
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg Score: {props.payload.avgScore} | Max: {props.payload.maxScore}
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="detectionRate" radius={4}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.detectionRate > 50 ? "hsl(142, 76%, 36%)" : "hsl(48, 96%, 53%)"} 
                  stroke={entry.detectionRate > 50 ? "hsl(142, 76%, 26%)" : "hsl(48, 96%, 43%)"}
                  strokeWidth={1}
                />
              ))}
              <LabelList
                dataKey="detectionRate"
                position="right"
                offset={8}
                className="fill-foreground font-semibold"
                fontSize={13}
                formatter={(value: number) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
