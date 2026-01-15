"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DetectorStats } from "@/lib/backend";
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

interface DetectorPerformanceProps {
  stats: DetectorStats[];
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

export function DetectorPerformance({ stats }: DetectorPerformanceProps) {
  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Detector Performance</CardTitle>
          <CardDescription>Signal detection effectiveness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
            No detector data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Detector Performance</CardTitle>
        <CardDescription>Signal detection effectiveness</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map((detector) => (
            <div key={detector.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{getDetectorIcon(detector.name)}</span>
                  <span className="text-sm font-medium">
                    {formatDetectorName(detector.name)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {(detector.detection_rate * 100).toFixed(0)}% detection rate
                </span>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex-1">
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{ width: `${detector.detection_rate * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-3 text-muted-foreground">
                  <span>Triggered: {detector.triggered_count}</span>
                  <span>Avg: {detector.avg_score.toFixed(1)}</span>
                  <span>Max: {detector.max_score.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
