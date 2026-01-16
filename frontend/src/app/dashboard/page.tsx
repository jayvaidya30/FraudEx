"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, AlertTriangle, Loader2, XCircle, ShieldAlert, TrendingUp, FileCheck } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { SetupRequired } from "@/components/app/setup-required";
import { RiskDisclaimer } from "@/components/app/risk-disclaimer";
import { CaseUploadForm } from "@/components/app/cases/case-upload-form";
import { CasesTable } from "@/components/app/cases/cases-table";
import { AlertBanner, PriorityQueue, MetricCard, MetricGrid } from "@/components/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCases } from "@/hooks/use-cases";
import { analyzeCase, isCaseTerminal, getAnalyticsSummary, type AnalyticsSummary } from "@/lib/backend";
import { riskBandFromScore } from "@/lib/risk";

export default function DashboardPage() {
  const router = useRouter();
  const { token, loading: authLoading, isConfigured } = useAuth();
  const { cases, jobByCaseId, loading: casesLoading, refresh } = useCases(token);
  const [busyCaseId, setBusyCaseId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const hasProcessing = useMemo(() => {
    if (!cases) return false;
    return cases.some((c) => !isCaseTerminal(c.status));
  }, [cases]);

  useEffect(() => {
    if (!token || !hasProcessing) return;
    const interval = setInterval(() => {
      void refresh();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [token, hasProcessing, refresh]);

  useEffect(() => {
    if (!token) return;
    
    async function loadAnalytics() {
      if (!token) return;
      setAnalyticsLoading(true);
      try {
        const data = await getAnalyticsSummary(token);
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setAnalyticsLoading(false);
      }
    }

    void loadAnalytics();
  }, [token]);

  function handleUploadSuccess(caseId: string) {
    router.push(`/cases/${caseId}`);
  }

  async function onAnalyze(caseId: string) {
    if (!token) return;
    setBusyCaseId(caseId);
    try {
      toast.loading("Queued for analysis…", { id: `analyze-${caseId}` });
      await analyzeCase(token, caseId);
      toast.success("Analysis started", { id: `analyze-${caseId}` });
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast.error(message, { id: `analyze-${caseId}` });
    } finally {
      setBusyCaseId(null);
    }
  }

  const summary = useMemo(() => {
    const rows = cases ?? [];
    const total = rows.length;
    const failed = rows.filter((c) => c.status === "failed").length;
    const pending = rows.filter((c) => c.status === "uploaded").length;
    const processing = rows.filter((c) => c.status === "processing").length;
    const analyzed = rows.filter((c) => c.status === "analyzed").length;
    const highRisk = rows.filter((c) => {
      const band = riskBandFromScore(c.risk_score);
      return c.status === "analyzed" && band === "high";
    }).length;
    const critical = rows.filter((c) => {
      const band = riskBandFromScore(c.risk_score);
      return c.status === "analyzed" && band === "critical";
    }).length;
    const highOrCritical = highRisk + critical;
    return { total, failed, pending, processing, analyzed, highOrCritical, highRisk, critical };
  }, [cases]);

  const sortedCases = useMemo(() => {
    if (!cases) return null;
    const priority = (s: string) => (s === "failed" ? 0 : s === "processing" ? 1 : s === "uploaded" ? 2 : 3);
    return [...cases].sort((a, b) => {
      const pa = priority(a.status);
      const pb = priority(b.status);
      if (pa !== pb) return pa - pb;

      const ra = a.risk_score ?? -1;
      const rb = b.risk_score ?? -1;
      if (ra !== rb) return rb - ra;

      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    });
  }, [cases]);

  if (authLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="space-y-6">
        <PageHeader
          title="Command Center"
          description="What needs attention right now."
        />

        {!isConfigured ? (
          <SetupRequired />
        ) : (
          <>
            {/* Critical Alerts - Top Priority */}
            {summary.failed > 0 && (
              <AlertBanner
                severity="critical"
                title={`${summary.failed} failed case${summary.failed > 1 ? 's' : ''}`}
                message="These cases encountered processing errors and need immediate attention."
                action={{
                  label: "View failed cases",
                  onClick: () => router.push("/cases?filter=failed"),
                }}
              />
            )}

            {summary.critical > 0 && (
              <AlertBanner
                severity="warning"
                title={`${summary.critical} critical risk case${summary.critical > 1 ? 's' : ''}`}
                message="High-priority fraud indicators detected requiring review."
                action={{
                  label: "Review critical cases",
                  onClick: () => router.push("/cases?filter=critical"),
                }}
              />
            )}

            {/* Priority Queue - Cases Needing Attention */}
            <PriorityQueue cases={cases ?? []} />

            {/* Key Metrics - Simplified Overview */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">System Status</h2>
              <MetricGrid columns={4}>
                <MetricCard
                  title="Total Cases"
                  value={summary.total}
                  subtitle="All analyzed documents"
                  icon={<FileText className="h-4 w-4" />}
                  priority="low"
                />
                <MetricCard
                  title="High Risk"
                  value={summary.highOrCritical}
                  subtitle={`${summary.critical} critical, ${summary.highRisk} high`}
                  icon={<AlertTriangle className="h-4 w-4" />}
                  priority={summary.critical > 0 ? "critical" : summary.highRisk > 0 ? "high" : "low"}
                />
                <MetricCard
                  title="Processing"
                  value={summary.processing}
                  subtitle="Currently analyzing"
                  icon={<Loader2 className="h-4 w-4" />}
                  priority={summary.processing > 3 ? "high" : "medium"}
                />
                <MetricCard
                  title="Completed"
                  value={summary.analyzed}
                  subtitle="Ready for review"
                  icon={<FileCheck className="h-4 w-4" />}
                  priority="low"
                />
              </MetricGrid>
            </div>

            <Separator />

            {/* Upload New Case */}
            <Card>
              <CardHeader>
                <CardTitle>Create case</CardTitle>
                <CardDescription>Upload a document to analyze for fraud indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <CaseUploadForm token={token} onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>

            <Separator />

            {/* All Cases - Access to every case */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">All Cases</h2>
                <Button variant="outline" size="sm" onClick={refresh} disabled={casesLoading}>
                  {hasProcessing ? "Updating…" : "Refresh"}
                </Button>
              </div>

              {sortedCases === null ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : sortedCases.length === 0 ? (
                <EmptyState
                  icon={<FileText className="h-6 w-6" />}
                  title="No cases yet"
                  description="Upload a document to get started"
                />
              ) : (
                <CasesTable
                  cases={sortedCases}
                  jobByCaseId={jobByCaseId}
                  onAnalyze={onAnalyze}
                  busyCaseId={busyCaseId}
                />
              )}
            </div>

            <RiskDisclaimer />
          </>
        )}
      </div>
    </div>
  );}