"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskDistribution } from "@/lib/backend";

interface RiskDistributionChartProps {
  distribution: RiskDistribution;
  total: number;
}

export function RiskDistributionChart({ distribution, total }: RiskDistributionChartProps) {
  const data = [
    { label: "Low", value: distribution.low, color: "bg-green-500", textColor: "text-green-700" },
    { label: "Medium", value: distribution.medium, color: "bg-yellow-500", textColor: "text-yellow-700" },
    { label: "High", value: distribution.high, color: "bg-orange-500", textColor: "text-orange-700" },
    { label: "Critical", value: distribution.critical, color: "bg-red-500", textColor: "text-red-700" },
  ];

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Risk Distribution</CardTitle>
        <CardDescription>Cases by risk level ({total} total)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={item.textColor}>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
