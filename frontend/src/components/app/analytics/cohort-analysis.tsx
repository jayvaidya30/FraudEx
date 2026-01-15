"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CohortAnalysis } from "@/lib/backend";

interface CohortAnalysisProps {
  cohorts: CohortAnalysis[];
}

function getRiskColor(score: number): string {
  if (score >= 80) return "text-red-600";
  if (score >= 60) return "text-orange-600";
  if (score >= 40) return "text-yellow-600";
  return "text-green-600";
}

export function CohortAnalysisChart({ cohorts }: CohortAnalysisProps) {
  if (!cohorts || cohorts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Cohort Analysis</CardTitle>
          <CardDescription>Risk breakdown by case groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
            No cohort data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Cohort Analysis</CardTitle>
        <CardDescription>Risk breakdown by case groups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cohorts.map((cohort) => (
            <div
              key={cohort.cohort_name}
              className="rounded-lg border p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{cohort.cohort_name}</h4>
                <Badge variant="outline">{cohort.case_count} cases</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Avg Risk: </span>
                  <span className={`font-medium ${getRiskColor(cohort.avg_risk_score)}`}>
                    {cohort.avg_risk_score.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Median: </span>
                  <span className={`font-medium ${getRiskColor(cohort.median_risk_score)}`}>
                    {cohort.median_risk_score.toFixed(1)}
                  </span>
                </div>
              </div>

              {cohort.top_signals.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {cohort.top_signals.slice(0, 3).map((signal) => (
                    <Badge key={signal} variant="secondary" className="text-xs">
                      {signal.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Mini risk distribution */}
              <div className="flex h-2 overflow-hidden rounded-full">
                {cohort.risk_distribution.low > 0 && (
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(cohort.risk_distribution.low / cohort.case_count) * 100}%`,
                    }}
                    title={`Low: ${cohort.risk_distribution.low}`}
                  />
                )}
                {cohort.risk_distribution.medium > 0 && (
                  <div
                    className="bg-yellow-500"
                    style={{
                      width: `${(cohort.risk_distribution.medium / cohort.case_count) * 100}%`,
                    }}
                    title={`Medium: ${cohort.risk_distribution.medium}`}
                  />
                )}
                {cohort.risk_distribution.high > 0 && (
                  <div
                    className="bg-orange-500"
                    style={{
                      width: `${(cohort.risk_distribution.high / cohort.case_count) * 100}%`,
                    }}
                    title={`High: ${cohort.risk_distribution.high}`}
                  />
                )}
                {cohort.risk_distribution.critical > 0 && (
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${(cohort.risk_distribution.critical / cohort.case_count) * 100}%`,
                    }}
                    title={`Critical: ${cohort.risk_distribution.critical}`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
