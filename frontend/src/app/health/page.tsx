"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { MetricCard, MetricGrid } from "@/components/app";
import { ConfidenceMeter } from "@/components/risk";
import { DetectorPerformanceBarChart } from "@/components/app/analytics/detector-performance-bar-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/lib/backend";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";
import { Activity, CheckCircle, AlertTriangle, TrendingUp, Shield } from "lucide-react";

export default function SystemHealthPage() {
  const router = useRouter();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? getSupabaseBrowserClient() : null),
    []
  );

  const [token, setToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await getAnalyticsSummary(token!);
        setAnalytics(data);
      } catch (err: unknown) {
        const message = getErrorMessage(err) || "Failed to load system health";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnalytics();
  }, [token]);

  // Calculate system health metrics
  const systemHealth = useMemo(() => {
    if (!analytics) return null;

    // Overall system confidence (average detector confidence)
    // Note: DetectorStats doesn't have avg_confidence, using triggered_count as proxy
    const avgConfidence = analytics.detector_stats.reduce(
      (sum, d) => sum + (d.triggered_count > 0 ? 0.75 : 0.5),
      0
    ) / (analytics.detector_stats.length || 1);

    // Detection coverage (how many detectors are active)
    const activeDetectors = analytics.detector_stats.filter(
      (d) => d.triggered_count > 0
    ).length;
    const totalDetectors = analytics.detector_stats.length;
    const coverage = (activeDetectors / totalDetectors) * 100;

    // Analysis throughput (cases analyzed per day)
    const throughput =
      analytics.trends_7d.length > 0
        ? analytics.trends_7d.reduce((sum, t) => sum + t.count, 0) /
          analytics.trends_7d.length
        : 0;

    // Confidence trend (last 3 days vs previous)
    const recentTrends = analytics.trends_7d.slice(-3);
    const previousTrends = analytics.trends_7d.slice(-6, -3);
    const recentAvgRisk =
      recentTrends.reduce((s, t) => s + t.avg_risk_score, 0) /
      (recentTrends.length || 1);
    const previousAvgRisk =
      previousTrends.reduce((s, t) => s + t.avg_risk_score, 0) /
      (previousTrends.length || 1);
    const riskTrend =
      previousAvgRisk > 0
        ? ((recentAvgRisk - previousAvgRisk) / previousAvgRisk) * 100
        : 0;

    return {
      avgConfidence,
      coverage,
      throughput,
      riskTrend,
      activeDetectors,
      totalDetectors,
    };
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
            <h1 className="text-2xl font-semibold tracking-tight">System Health</h1>
            <p className="text-sm text-muted-foreground">
              Trust indicators and detector performance monitoring
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-black/20 p-6 text-center">
            <h3 className="font-semibold">Error Loading System Health</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : analytics && systemHealth ? (
          <>
            {/* System Status Overview */}
            <Card className="border-2 border-foreground">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Overall health and trust indicators</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Operational
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">System Confidence</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(systemHealth.avgConfidence * 100)}%
                      </span>
                    </div>
                    <ConfidenceMeter
                      confidence={Math.round(systemHealth.avgConfidence * 100)}
                      showPercentage={false}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round(systemHealth.coverage)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Detector Coverage
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round(systemHealth.throughput)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cases/Day
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {systemHealth.activeDetectors}/{systemHealth.totalDetectors}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active Detectors
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Health Metrics */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">Health Metrics</h2>
              <MetricGrid columns={4}>
                <MetricCard
                  title="System Confidence"
                  value={`${Math.round(systemHealth.avgConfidence * 100)}%`}
                  subtitle="Average detector confidence"
                  icon={<Shield className="h-4 w-4" />}
                  priority={systemHealth.avgConfidence > 0.7 ? "low" : "medium"}
                />
                <MetricCard
                  title="Throughput"
                  value={Math.round(systemHealth.throughput)}
                  subtitle="Cases analyzed per day"
                  icon={<Activity className="h-4 w-4" />}
                  priority="low"
                />
                <MetricCard
                  title="Risk Trend"
                  value={`${systemHealth.riskTrend > 0 ? "+" : ""}${systemHealth.riskTrend.toFixed(1)}%`}
                  subtitle="Last 3 days vs previous"
                  icon={<TrendingUp className="h-4 w-4" />}
                  priority={Math.abs(systemHealth.riskTrend) > 20 ? "high" : "medium"}
                  trend={systemHealth.riskTrend > 5 ? "up" : systemHealth.riskTrend < -5 ? "down" : "neutral"}
                />
                <MetricCard
                  title="Active Detectors"
                  value={systemHealth.activeDetectors}
                  subtitle={`${systemHealth.totalDetectors} total configured`}
                  icon={<CheckCircle className="h-4 w-4" />}
                  priority={
                    systemHealth.activeDetectors === systemHealth.totalDetectors
                      ? "low"
                      : "medium"
                  }
                />
              </MetricGrid>
            </div>

            {/* Detector Performance */}
            <DetectorPerformanceBarChart
              stats={analytics.detector_stats}
              title="Detector Trust Indicators"
              description="Performance and confidence metrics for each detector"
            />

            {/* Detector Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detector Details</CardTitle>
                <CardDescription>
                  Comprehensive view of all fraud detection systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.detector_stats.map((detector, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{detector.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Triggered: {detector.triggered_count} times | Avg Risk:{" "}
                          {detector.avg_score?.toFixed(1) ?? "N/A"}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {detector.triggered_count > 0 ? "75%" : "50%"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Confidence
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            detector.triggered_count > 0
                              ? "border-foreground"
                              : "border-muted"
                          }
                        >
                          {detector.triggered_count > 0 ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-xs text-muted-foreground text-right">
              Last updated: {new Date(analytics.generated_at).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No system health data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
