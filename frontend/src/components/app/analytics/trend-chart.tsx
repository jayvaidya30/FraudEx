"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrendPoint } from "@/lib/backend";

interface TrendChartProps {
  data: TrendPoint[];
  title: string;
  description: string;
}

export function TrendChart({ data, title, description }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mini bar chart for case count */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Cases per day</span>
              <span>High risk</span>
            </div>
            <div className="flex h-24 items-end gap-1">
              {data.slice(-14).map((point) => {
                const height = (point.count / maxCount) * 100;
                const hasHighRisk = point.high_risk_count > 0;
                return (
                  <div
                    key={point.date}
                    className="group relative flex-1"
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        hasHighRisk ? "bg-orange-400" : "bg-primary/60"
                      } hover:bg-primary`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${point.date}: ${point.count} cases, avg risk ${point.avg_risk_score.toFixed(1)}`}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs shadow-lg group-hover:block">
                      <div className="font-medium">{new Date(point.date).toLocaleDateString()}</div>
                      <div>{point.count} cases</div>
                      <div>Avg risk: {point.avg_risk_score.toFixed(1)}</div>
                      {point.high_risk_count > 0 && (
                        <div className="text-orange-500">{point.high_risk_count} high risk</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{data.length > 0 ? new Date(data[Math.max(0, data.length - 14)].date).toLocaleDateString() : ""}</span>
              <span>{data.length > 0 ? new Date(data[data.length - 1].date).toLocaleDateString() : ""}</span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
            <div>
              <div className="text-lg font-semibold">
                {data.reduce((sum, d) => sum + d.count, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Cases</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {(data.reduce((sum, d) => sum + d.avg_risk_score, 0) / data.length).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Risk</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-500">
                {data.reduce((sum, d) => sum + d.high_risk_count, 0)}
              </div>
              <div className="text-xs text-muted-foreground">High Risk</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
