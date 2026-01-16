"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { TopSignals } from "@/components/app/analytics";
import { AnomalyDetectionCard, type Anomaly, ComparisonBarChart, type ComparisonItem, MetricCard, MetricGrid } from "@/components/app";
import { DetectorPerformanceBarChart } from "@/components/app/analytics/detector-performance-bar-chart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsSummary, getRiskDistribution, type AnalyticsSummary } from "@/lib/backend";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";
import { FileText, AlertTriangle, Activity, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? getSupabaseBrowserClient() : null),
    []
  );

  const [token, setToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskDistData, setRiskDistData] = useState<{
    distribution: any;
    total_analyzed: number;
    average_score: number;
    min_score: number;
    max_score: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token || null;
      if (!accessToken) {
        router.push("/login");
        return;
      }
      if (cancelled) return;
      setToken(accessToken);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  useEffect(() => {
    if (!token) return;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const [data, riskDist] = await Promise.all([
          getAnalyticsSummary(token!),
          getRiskDistribution(token!)
        ]);
        setAnalytics(data);
        setRiskDistData(riskDist);
      } catch (err: unknown) {
        const message = getErrorMessage(err) || "Failed to load analytics";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnalytics();
  }, [token]);

  // Calculate anomalies (what changed)
  const anomalies: Anomaly[] = useMemo(() => {
    if (!analytics || analytics.trends_7d.length < 2) return [];

    const recent = analytics.trends_7d[analytics.trends_7d.length - 1];
    const previous = analytics.trends_7d[analytics.trends_7d.length - 2];

    const result: Anomaly[] = [];

    // High risk cases change
    if (recent.high_risk_count !== previous.high_risk_count) {
      const changePercent = previous.high_risk_count > 0
        ? ((recent.high_risk_count - previous.high_risk_count) / previous.high_risk_count) * 100
        : 100;
      const severity = Math.abs(changePercent) > 50 ? "critical" : Math.abs(changePercent) > 25 ? "high" : "medium";
      result.push({
        id: "high-risk-change",
        metric: "High Risk Cases",
        currentValue: recent.high_risk_count,
        previousValue: previous.high_risk_count,
        changePercent,
        severity,
        description: changePercent > 0
          ? "Significant increase in high-risk cases detected"
          : "Decrease in high-risk cases",
      });
    }

    // Average risk score change
    if (Math.abs(recent.avg_risk_score - previous.avg_risk_score) > 5) {
      const changePercent = previous.avg_risk_score > 0
        ? ((recent.avg_risk_score - previous.avg_risk_score) / previous.avg_risk_score) * 100
        : 0;
      result.push({
        id: "avg-risk-change",
        metric: "Average Risk Score",
        currentValue: Math.round(recent.avg_risk_score),
        previousValue: Math.round(previous.avg_risk_score),
        changePercent,
        severity: Math.abs(changePercent) > 20 ? "high" : "medium",
        description: changePercent > 0
          ? "Overall risk level trending upward"
          : "Overall risk level trending downward",
      });
    }

    // Case volume change
    if (recent.count !== previous.count) {
      const changePercent = previous.count > 0
        ? ((recent.count - previous.count) / previous.count) * 100
        : 100;
      if (Math.abs(changePercent) > 30) {
        result.push({
          id: "volume-change",
          metric: "Case Volume",
          currentValue: recent.count,
          previousValue: previous.count,
          changePercent,
          severity: Math.abs(changePercent) > 50 ? "high" : "medium",
          description: changePercent > 0
            ? "Unusual spike in case submissions"
            : "Significant drop in case submissions",
        });
      }
    }

    return result;
  }, [analytics]);

  // Comparison data (before vs after)
  const comparisonItems: ComparisonItem[] = useMemo(() => {
    if (!analytics || analytics.trends_7d.length < 4) return [];

    // Compare last 3 days with previous 3 days
    const recent3 = analytics.trends_7d.slice(-3);
    const previous3 = analytics.trends_7d.slice(-6, -3);

    const recentAvg = {
      count: recent3.reduce((s, t) => s + t.count, 0) / 3,
      highRisk: recent3.reduce((s, t) => s + t.high_risk_count, 0) / 3,
      avgRisk: recent3.reduce((s, t) => s + t.avg_risk_score, 0) / 3,
    };

    const previousAvg = {
      count: previous3.reduce((s, t) => s + t.count, 0) / 3,
      highRisk: previous3.reduce((s, t) => s + t.high_risk_count, 0) / 3,
      avgRisk: previous3.reduce((s, t) => s + t.avg_risk_score, 0) / 3,
    };

    return [
      {
        label: "Daily Cases",
        beforeValue: Math.round(previousAvg.count),
        afterValue: Math.round(recentAvg.count),
      },
      {
        label: "High Risk Cases",
        beforeValue: Math.round(previousAvg.highRisk),
        afterValue: Math.round(recentAvg.highRisk),
      },
      {
        label: "Average Risk Score",
        beforeValue: Math.round(previousAvg.avgRisk),
        afterValue: Math.round(recentAvg.avgRisk),
        maxValue: 100,
      },
    ];
  }, [analytics]);

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="rounded-lg border p-6 text-center">
          <h2 className="text-lg font-semibold">Setup Required</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Supabase environment variables are missing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Pattern Intelligence</h1>
            <p className="text-sm text-muted-foreground">
              Anomaly detection and change analysis across fraud patterns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">← Dashboard</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                window.location.reload();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {/* Skeleton loading state */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-black/20 p-6 text-center">
            <h3 className="font-semibold">Error Loading Analytics</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : analytics ? (
          <>
            {/* Key Change Metrics - What Changed */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">Key Changes</h2>
              <MetricGrid columns={4}>
                <MetricCard
                  title="Total Cases"
                  value={analytics.total_cases}
                  currentValue={analytics.trends_7d[analytics.trends_7d.length - 1]?.count}
                  previousValue={analytics.trends_7d[analytics.trends_7d.length - 2]?.count}
                  subtitle="Last 7 days"
                  icon={<FileText className="h-4 w-4" />}
                  priority="low"
                />
                <MetricCard
                  title="Analyzed"
                  value={analytics.analyzed_cases}
                  subtitle={`${((analytics.analyzed_cases / analytics.total_cases) * 100).toFixed(0)}% of total`}
                  icon={<Activity className="h-4 w-4" />}
                  priority="low"
                />
                <MetricCard
                  title="High Risk"
                  value={analytics.high_risk_count}
                  currentValue={analytics.trends_7d[analytics.trends_7d.length - 1]?.high_risk_count}
                  previousValue={analytics.trends_7d[analytics.trends_7d.length - 2]?.high_risk_count}
                  subtitle="Requires attention"
                  icon={<AlertTriangle className="h-4 w-4" />}
                  priority={analytics.high_risk_count > 5 ? "high" : "medium"}
                />
                <MetricCard
                  title="Average Risk"
                  value={analytics.avg_risk_score.toFixed(1)}
                  currentValue={analytics.avg_risk_score}
                  previousValue={analytics.trends_7d[analytics.trends_7d.length - 2]?.avg_risk_score}
                  subtitle="Risk score"
                  icon={<TrendingUp className="h-4 w-4" />}
                  priority={analytics.avg_risk_score > 60 ? "high" : "medium"}
                />
              </MetricGrid>
            </div>

            {/* Anomaly Detection - Primary Focus */}
            {anomalies.length > 0 && (
              <AnomalyDetectionCard
                anomalies={anomalies}
                title="Anomaly Detection"
                description="Significant deviations from baseline patterns"
              />
            )}

            {/* Change Analysis - Before vs After */}
            <div className="grid gap-6 lg:grid-cols-2">
              {comparisonItems.length > 0 && (
                <ComparisonBarChart
                  items={comparisonItems}
                  title="Trend Analysis"
                  description="Last 3 days vs previous 3 days"
                  beforeLabel="Previous"
                  afterLabel="Recent"
                />
              )}

              {/* Top Signals */}
              <TopSignals signals={analytics.top_signals} />
            </div>

            {/* Detector Effectiveness */}
            <DetectorPerformanceBarChart 
              stats={analytics.detector_stats}
              title="Detector Effectiveness"
              description="Detection performance ranked by effectiveness"
            />

            {/* Recent high-risk cases */}
            {analytics.recent_high_risk_cases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent High-Risk Cases</CardTitle>
                  <CardDescription>Cases requiring immediate review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analytics.recent_high_risk_cases.map((caseId) => (
                      <Link
                        key={caseId}
                        href={`/cases/${caseId}`}
                        className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-mono hover:bg-muted transition-colors"
                      >
                        {caseId.slice(0, 8)}...
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Footer with generation time */}
            <div className="text-xs text-muted-foreground text-right">
              Generated at: {new Date(analytics.generated_at).toLocaleString()}
              {analytics.period_start && analytics.period_end && (
                <span className="ml-4">
                  Period: {new Date(analytics.period_start).toLocaleDateString()} -{" "}
                  {new Date(analytics.period_end).toLocaleDateString()}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-sm text-muted-foreground">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
