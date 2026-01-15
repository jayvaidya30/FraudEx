"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopSignal } from "@/lib/backend";

interface TopSignalsProps {
  signals: TopSignal[];
}

function getSignalColor(signalType: string): string {
  const colors: Record<string, string> = {
    benford_deviation: "bg-purple-100 text-purple-800",
    round_number_bias: "bg-blue-100 text-blue-800",
    split_invoice_pattern: "bg-orange-100 text-orange-800",
    bid_rigging: "bg-red-100 text-red-800",
    suspicious_keywords: "bg-yellow-100 text-yellow-800",
    urgency_pressure: "bg-pink-100 text-pink-800",
    velocity_anomaly: "bg-cyan-100 text-cyan-800",
  };
  return colors[signalType] || "bg-gray-100 text-gray-800";
}

function formatSignalName(signalType: string): string {
  return signalType
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TopSignals({ signals }: TopSignalsProps) {
  if (!signals || signals.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Fraud Signals</CardTitle>
          <CardDescription>Most frequently triggered indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
            No signals detected yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top Fraud Signals</CardTitle>
        <CardDescription>Most frequently triggered indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {signals.slice(0, 5).map((signal, index) => (
            <div key={signal.signal_type} className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {index + 1}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge className={getSignalColor(signal.signal_type)} variant="secondary">
                    {formatSignalName(signal.signal_type)}
                  </Badge>
                  <span className="text-sm font-medium">
                    {signal.occurrence_count} hits
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{signal.affected_cases} cases affected</span>
                  <span>Avg contribution: {(signal.avg_contribution * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
