"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { RiskDisclaimer } from "@/components/app/risk-disclaimer";
import { SetupRequired } from "@/components/app/setup-required";
import { StickyVerdictHeader, SignalSummary, type Signal } from "@/components/app";
import { CaseReport } from "@/components/app/cases/case-report";
import { CaseSignals } from "@/components/app/cases/case-signals";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  analyzeCase,
  getAnalysisJob,
  getCaseById,
  isCaseTerminal,
  type AnalysisJob,
  type CaseRow,
} from "@/lib/backend";

type SignalFactor = {
  detector?: string;
  score_contribution?: number;
  confidence?: number;
  explanation?: string;
  key_indicators?: Record<string, unknown>;
};

type DetectorBreakdown = {
  score?: number;
  weight?: number;
  confidence?: number;
  indicators?: Record<string, unknown>;
  explanation?: string;
};

type SignalPayload = {
  risk_level?: string;
  confidence?: number;
  top_factors?: SignalFactor[];
  recommendations?: string[];
  detectors_triggered?: number;
  detector_breakdown?: Record<string, DetectorBreakdown>;
};

export default function CaseDetailPage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  const { token, loading: authLoading, isConfigured } = useAuth();

  const [row, setRow] = useState<CaseRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [polling, setPolling] = useState(false);
  const [jobStatus, setJobStatus] = useState<AnalysisJob | null>(null);
  const [pollStopped, setPollStopped] = useState(false);
  const pollStartRef = useRef<number | null>(null);
  const rowRef = useRef<CaseRow | null>(null);

  useEffect(() => {
    rowRef.current = row;
  }, [row]);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const c = await getCaseById(token, caseId);
      setRow(c);
      const jobId = (c.signals as Record<string, unknown> | null)?.analysis_job_id;
      if (typeof jobId === "string" && jobId.length > 0) {
        try {
          const job = await getAnalysisJob(token, jobId);
          setJobStatus(job);
        } catch {
          setJobStatus(null);
        }
      } else {
        setJobStatus(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load case";
      toast.error(message);
      setRow(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token || !row || isCaseTerminal(row.status) || pollStopped) return;

    if (!pollStartRef.current) {
      pollStartRef.current = Date.now();
    }
    setPolling(true);

    let stopped = false;
    const interval = setInterval(() => {
      void (async () => {
        try {
          if (stopped) return;
          const startedAt = pollStartRef.current ?? Date.now();
          if (Date.now() - startedAt > 2 * 60 * 1000) {
            setPolling(false);
            setPollStopped(true);
            stopped = true;
            clearInterval(interval);
            return;
          }

          const currentRow = rowRef.current;
          if (!currentRow || isCaseTerminal(currentRow.status)) {
            setPolling(false);
            stopped = true;
            clearInterval(interval);
            return;
          }

          const jobId = (currentRow.signals as Record<string, unknown> | null)?.analysis_job_id;
          if (typeof jobId === "string" && jobId.length > 0) {
            const job = await getAnalysisJob(token, jobId);
            setJobStatus(job);

            if (job.status === "completed" || job.status === "failed") {
              const c = await getCaseById(token, caseId);
              setRow(c);
              if (isCaseTerminal(c.status)) {
                setPolling(false);
                stopped = true;
                clearInterval(interval);
              }
            }
          } else {
            const c = await getCaseById(token, caseId);
            setRow(c);
            if (isCaseTerminal(c.status)) {
              setPolling(false);
              stopped = true;
              clearInterval(interval);
            }
          }
        } catch {
          setPolling(false);
          stopped = true;
          clearInterval(interval);
        }
      })();
    }, 2000);

    return () => {
      stopped = true;
      clearInterval(interval);
      setPolling(false);
    };
  }, [token, caseId, row?.status, pollStopped]);

  useEffect(() => {
    if (!token) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, caseId]);

  async function onAnalyze() {
    if (!token) return;
    setAnalyzing(true);
    try {
      toast.loading("Queued for analysis…", { id: "analyze" });
      await analyzeCase(token, caseId);
      toast.success("Analysis started", { id: "analyze" });
      await load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast.error(message, { id: "analyze" });
    } finally {
      setAnalyzing(false);
    }
  }

  const signalPayload: SignalPayload = (row?.signals ?? {}) as SignalPayload;
  const topFactors = Array.isArray(signalPayload.top_factors) ? signalPayload.top_factors : [];
  const recommendations = Array.isArray(signalPayload.recommendations)
    ? signalPayload.recommendations
    : [];
  const detectorBreakdown = signalPayload.detector_breakdown || {};

  // Convert top factors to Signal format for SignalSummary
  const signals: Signal[] = topFactors.map((factor, index) => ({
    id: `signal-${index}`,
    name: factor.detector || "Unknown Detector",
    severity: 
      (factor.score_contribution ?? 0) > 30 ? "critical" :
      (factor.score_contribution ?? 0) > 20 ? "high" :
      (factor.score_contribution ?? 0) > 10 ? "medium" : "low",
    message: factor.explanation || "No explanation provided",
    details: factor.key_indicators ? 
      Object.entries(factor.key_indicators)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(", ") : 
      undefined,
    confidence: factor.confidence,
  }));

  if (authLoading || loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="space-y-6">
        {!isConfigured ? (
          <SetupRequired />
        ) : !row ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Case not found.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Sticky Verdict Header - Always Visible */}
            {row.status === "analyzed" && (
              <StickyVerdictHeader
                caseId={caseId}
                caseName={row.name || "Untitled Case"}
                riskScore={row.risk_score ?? 0}
                confidence={signalPayload.confidence ?? 0}
                status={row.status}
              />
            )}

            <PageHeader
              title={row.status !== "analyzed" ? "Case Analysis" : ""}
              description={row.status !== "analyzed" ? caseId : ""}
              backLink={{ href: "/dashboard", label: "Back to dashboard" }}
              actions={
                <Button
                  onClick={onAnalyze}
                  disabled={analyzing || !row || row.status === "processing"}
                >
                  {analyzing ? "Queueing…" : row?.status === "processing" ? "Processing…" : "Re-analyze"}
                </Button>
              }
            />

            {/* Key Signals - Progressive Disclosure (3-5 most important) */}
            {row.status === "analyzed" && signals.length > 0 && (
              <>
                <SignalSummary
                  signals={signals}
                  maxVisible={5}
                  title="Key Fraud Signals"
                  description="Critical indicators detected in this case"
                />
                <Separator />
              </>
            )}

            {/* Processing Status for non-analyzed cases */}
            {row.status !== "analyzed" && (
              <>
                <Card className="border-2 border-foreground">
                  <CardContent className="py-12 text-center">
                    <p className="text-lg font-semibold mb-2">
                      {row.status === "processing" && polling ? "Analysis in progress..." : 
                       row.status === "failed" ? "Analysis failed" :
                       "Ready to analyze"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {row.status === "processing" && polling ? "This may take a few moments" :
                       row.status === "failed" ? jobStatus?.error || "An error occurred during analysis" :
                       "Click 'Analyze' to begin fraud detection"}
                    </p>
                  </CardContent>
                </Card>
                <Separator />
              </>
            )}

            {/* Forensics - Collapsible Details */}
            {row.status === "analyzed" && (
              <Tabs defaultValue="report" className="w-full">
                <TabsList>
                  <TabsTrigger value="report">Executive Summary</TabsTrigger>
                  <TabsTrigger value="forensics">Full Forensics</TabsTrigger>
                </TabsList>

                <TabsContent value="report" className="mt-4">
                  <CaseReport
                    status={row.status}
                    riskScore={row.risk_score}
                    explanation={row.explanation}
                    recommendations={recommendations}
                  />
                </TabsContent>

                <TabsContent value="forensics" className="mt-4">
                  <CaseSignals
                    topFactors={topFactors}
                    recommendations={recommendations}
                    detectorBreakdown={detectorBreakdown}
                    confidence={signalPayload.confidence}
                  />
                </TabsContent>
              </Tabs>
            )}

            <RiskDisclaimer />
          </>
        )}
      </div>
    </div>
  );
}
