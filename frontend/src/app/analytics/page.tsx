"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  CohortAnalysisChart,
  DetectorPerformance,
  MetricCard,
  RiskDistributionChart,
  TopSignals,
  TrendChart,
} from "@/components/app/analytics";
import {
  Activity,
  AlertTriangle,
  FileText,
  Hourglass,
  Loader2,
  ShieldAlert,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/lib/backend";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";

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
        const message = getErrorMessage(err) || "Failed to load analytics";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnalytics();
  }, [token]);

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
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Fraud detection insights and trends across all cases
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
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <h3 className="font-semibold text-destructive">Error Loading Analytics</h3>
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
            {/* Key Metrics Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Cases"
                value={analytics.total_cases}
                subtitle={`${analytics.analyzed_cases} analyzed`}
                icon={<FileText className="h-5 w-5" />}
              />
              <MetricCard
                title="Avg Risk Score"
                value={analytics.avg_risk_score.toFixed(1)}
                subtitle="Across all analyzed cases"
                icon={<Activity className="h-5 w-5" />}
                variant={
                  analytics.avg_risk_score >= 60
                    ? "danger"
                    : analytics.avg_risk_score >= 40
                    ? "warning"
                    : "success"
                }
              />
              <MetricCard
                title="High Risk Cases"
                value={analytics.high_risk_count}
                subtitle="Score ≥ 60"
                icon={<AlertTriangle className="h-5 w-5" />}
                variant="warning"
              />
              <MetricCard
                title="Critical Cases"
                value={analytics.critical_risk_count}
                subtitle="Score ≥ 80"
                icon={<ShieldAlert className="h-5 w-5" />}
                variant="danger"
              />
            </div>

            {/* Second row: Pending + Status */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Pending Review"
                value={analytics.pending_review_count}
                subtitle="Awaiting analysis"
                icon={<Hourglass className="h-5 w-5" />}
              />
              <MetricCard
                title="Uploaded"
                value={analytics.status_distribution.uploaded}
                subtitle="Ready for analysis"
                icon={<UploadCloud className="h-5 w-5" />}
              />
              <MetricCard
                title="Processing"
                value={analytics.status_distribution.processing}
                subtitle="Currently analyzing"
                icon={<Loader2 className="h-5 w-5" />}
              />
              <MetricCard
                title="Failed"
                value={analytics.status_distribution.failed}
                subtitle="Analysis errors"
                icon={<XCircle className="h-5 w-5" />}
                variant={analytics.status_distribution.failed > 0 ? "danger" : "default"}
              />
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="signals">Signals</TabsTrigger>
                <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <RiskDistributionChart
                    distribution={analytics.risk_distribution}
                    total={analytics.analyzed_cases}
                  />
                  <TopSignals signals={analytics.top_signals} />
                </div>
                <DetectorPerformance stats={analytics.detector_stats} />
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <TrendChart
                    data={analytics.trends_7d}
                    title="Last 7 Days"
                    description="Recent case activity and risk trends"
                  />
                  <TrendChart
                    data={analytics.trends_30d}
                    title="Last 30 Days"
                    description="Monthly case activity overview"
                  />
                </div>
              </TabsContent>

              <TabsContent value="signals" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <TopSignals signals={analytics.top_signals} />
                  <DetectorPerformance stats={analytics.detector_stats} />
                </div>
              </TabsContent>

              <TabsContent value="cohorts" className="space-y-6">
                <CohortAnalysisChart cohorts={analytics.cohorts} />
              </TabsContent>
            </Tabs>

            {/* Recent high-risk cases */}
            {analytics.recent_high_risk_cases.length > 0 && (
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-3">Recent High-Risk Cases</h3>
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
              </div>
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
