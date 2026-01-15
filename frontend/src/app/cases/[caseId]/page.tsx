"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { RiskDisclaimer } from "@/components/app/risk-disclaimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  analyzeCase,
  getAnalysisJob,
  getCaseById,
  isCaseTerminal,
  type AnalysisJob,
  type CaseRow,
} from "@/lib/backend";
import { oneLineInterpretation, riskBandClasses, riskBandFromScore, riskBandLabel } from "@/lib/risk";
import { getErrorMessage } from "@/lib/errors";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "analyzed"
      ? "default"
      : status === "failed"
        ? "destructive"
        : status === "processing"
          ? "outline"
          : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

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

function formatDetectorName(name: string) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;

  const supabase = useMemo(
    () => (isSupabaseConfigured ? getSupabaseBrowserClient() : null),
    [],
  );

  const [token, setToken] = useState<string | null>(null);
  const [row, setRow] = useState<CaseRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [polling, setPolling] = useState(false);
  const [jobStatus, setJobStatus] = useState<AnalysisJob | null>(null);
  const [pollStopped, setPollStopped] = useState(false);
  const pollStartRef = useRef<number | null>(null);
  const [showAllDetectors, setShowAllDetectors] = useState(false);

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
      toast.error(getErrorMessage(err) || "Failed to load case");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token || !row || isCaseTerminal(row.status)) return;
    const jobId = (row.signals as Record<string, unknown> | null)?.analysis_job_id;
    if (!pollStartRef.current) {
      pollStartRef.current = Date.now();
    }
    setPollStopped(false);
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const startedAt = pollStartRef.current ?? Date.now();
        if (Date.now() - startedAt > 2 * 60 * 1000) {
          setPolling(false);
          setPollStopped(true);
          clearInterval(interval);
          return;
        }
        if (typeof jobId === "string" && jobId.length > 0) {
          const job = await getAnalysisJob(token, jobId);
          setJobStatus(job);

          if (job.status === "completed" || job.status === "failed") {
            const c = await getCaseById(token, caseId);
            setRow(c);
            if (isCaseTerminal(c.status)) {
              setPolling(false);
              clearInterval(interval);
            }
          }
        } else {
          const c = await getCaseById(token, caseId);
          setRow(c);
          if (isCaseTerminal(c.status)) {
            setPolling(false);
            clearInterval(interval);
          }
        }
      } catch {
        setPolling(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [token, caseId, row]);

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
      toast.error(getErrorMessage(err) || "Analysis failed", { id: "analyze" });
    } finally {
      setAnalyzing(false);
    }
  }

  const signalPayload: SignalPayload = (row?.signals ?? {}) as SignalPayload;
  const topFactors = Array.isArray(signalPayload.top_factors) ? signalPayload.top_factors : [];
  const recommendations = Array.isArray(signalPayload.recommendations)
    ? signalPayload.recommendations
    : [];
  const detectorEntries = signalPayload.detector_breakdown
    ? Object.entries(signalPayload.detector_breakdown)
    : [];
  const displayedDetectorEntries = detectorEntries.filter(([, d]) =>
    showAllDetectors ? true : (d?.score ?? 0) > 0,
  );

  const scoreBand = riskBandFromScore(row?.risk_score ?? null);
  const scoreBandUi = riskBandClasses(scoreBand);
  const scoreLabel = riskBandLabel(scoreBand);
  const primaryRecommendation = recommendations[0] ?? null;
  const cleanedExplanation = row?.explanation
    ? row.explanation
        .replace(/^[\p{Extended_Pictographic}\uFE0F]+\s*/gmu, "")
        .replace(/^DISCLAIMER:/gim, "Disclaimer:")
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:underline">
                ← Back to dashboard
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Case</h1>
            <div className="mt-1 font-mono text-xs text-muted-foreground">{caseId}</div>
          </div>

          <Button onClick={onAnalyze} disabled={analyzing || !row || row.status === "processing"}>
            {analyzing ? "Queueing…" : row?.status === "processing" ? "Processing…" : "Analyze"}
          </Button>
        </div>

        <RiskDisclaimer />

        {!isSupabaseConfigured ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Supabase is not configured. Set <span className="font-mono text-xs">frontend/.env.local</span> and refresh.
            </CardContent>
          </Card>
        ) : (
          loading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : !row ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">Case not found.</CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="mt-1">
                      <StatusBadge status={row.status} />
                      {polling && (
                        <span className="ml-2 text-xs text-muted-foreground">Updating…</span>
                      )}
                      {pollStopped && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Auto-refresh paused
                        </span>
                      )}
                      {row.status === "processing" && jobStatus?.status && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Job: {jobStatus.status}
                        </span>
                      )}
                      {jobStatus?.status === "failed" && jobStatus.error && (
                        <div className="mt-1 text-xs text-destructive">
                          {jobStatus.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Risk score</div>
                    <div className="mt-1 text-2xl font-semibold">
                      {row.risk_score ?? "—"}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="mt-1 text-sm">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              <Tabs defaultValue="report" className="w-full">
                <TabsList>
                  <TabsTrigger value="report">Explainable report</TabsTrigger>
                  <TabsTrigger value="signals">Signals</TabsTrigger>
                </TabsList>

                <TabsContent value="report" className="mt-4">
                  <div className="space-y-4">
                    <Card className="border-l-4" style={{ borderLeftColor: "transparent" }}>
                      <CardContent className="space-y-4 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Executive summary
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={scoreBandUi.badge}>
                                {scoreLabel}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Risk score {row.risk_score ?? "—"}/100
                              </span>
                            </div>
                            <div className="text-sm">
                              {oneLineInterpretation(scoreBand)}
                            </div>
                          </div>

                          {primaryRecommendation && (
                            <div className="max-w-xl rounded-md border bg-muted/40 p-3 text-sm">
                              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Primary recommendation
                              </div>
                              <div className="mt-1">{primaryRecommendation}</div>
                            </div>
                          )}
                        </div>

                        {typeof row.risk_score === "number" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Risk score</span>
                              <span className={scoreBandUi.text}>{scoreLabel}</span>
                            </div>
                            <Progress
                              value={row.risk_score}
                              className="h-2"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm text-muted-foreground">Risk level</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {signalPayload.risk_level ?? "unknown"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Score {row.risk_score ?? "—"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm text-muted-foreground">Confidence</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-lg font-semibold">
                            {typeof signalPayload.confidence === "number"
                              ? `${(signalPayload.confidence * 100).toFixed(0)}%`
                              : "—"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm text-muted-foreground">
                            Detectors triggered
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-lg font-semibold">
                            {typeof signalPayload.detectors_triggered === "number"
                              ? signalPayload.detectors_triggered
                              : "—"}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top factors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {topFactors.length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                              No contributing factors recorded.
                            </div>
                          ) : (
                            topFactors.map((factor, index) => (
                              <div key={`${factor.detector ?? "factor"}-${index}`} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {formatDetectorName(factor.detector ?? "signal")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {typeof factor.score_contribution === "number"
                                      ? `${factor.score_contribution.toFixed(1)} pts`
                                      : "—"}
                                  </span>
                                </div>
                                {factor.explanation && (
                                  <p className="text-xs text-muted-foreground">
                                    {factor.explanation}
                                  </p>
                                )}
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {recommendations.length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                              No recommendations available.
                            </div>
                          ) : (
                            <ul className="list-disc space-y-2 pl-5 text-sm">
                              {recommendations.map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Detector breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {detectorEntries.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No detector output available.</div>
                        ) : (
                          <Accordion type="single">
                            <AccordionItem value="detectors">
                              <AccordionTrigger value="detectors">
                                Detector breakdown
                              </AccordionTrigger>
                              <AccordionContent value="detectors" className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-xs text-muted-foreground">
                                    Showing {displayedDetectorEntries.length} of {detectorEntries.length} detectors
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAllDetectors((v) => !v)}
                                  >
                                    {showAllDetectors ? "Hide zero-impact" : "Show all"}
                                  </Button>
                                </div>

                                <div className="overflow-auto rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Detector</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Confidence</TableHead>
                                        <TableHead>Summary</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {displayedDetectorEntries.map(([name, detail]) => (
                                        <TableRow key={name}>
                                          <TableCell className="font-medium">
                                            {formatDetectorName(name)}
                                          </TableCell>
                                          <TableCell>{detail?.score ?? 0}</TableCell>
                                          <TableCell>
                                            {typeof detail?.confidence === "number"
                                              ? `${(detail.confidence * 100).toFixed(0)}%`
                                              : "—"}
                                          </TableCell>
                                          <TableCell className="max-w-[520px]">
                                            <span className="text-xs text-muted-foreground">
                                              {detail?.explanation || "—"}
                                            </span>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </CardContent>
                    </Card>

                    <Accordion type="single">
                      <AccordionItem value="technical">
                        <AccordionTrigger value="technical">Technical details</AccordionTrigger>
                        <AccordionContent value="technical" className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            Raw detector output and internal fields are available for audit and debugging.
                          </div>
                          <pre className="max-h-[50vh] overflow-auto rounded-md bg-muted p-4 text-xs">
                            {JSON.stringify(row.signals ?? {}, null, 2)}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Card>
                      <CardHeader>
                        <CardTitle>Report narrative</CardTitle>
                      </CardHeader>
                      <CardContent className="py-6">
                        {cleanedExplanation ? (
                          <div className="space-y-4">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: (props) => (
                                  <h1 className="text-2xl font-semibold tracking-tight" {...props} />
                                ),
                                h2: (props) => (
                                  <h2 className="text-xl font-semibold tracking-tight" {...props} />
                                ),
                                h3: (props) => (
                                  <h3 className="text-lg font-semibold tracking-tight" {...props} />
                                ),
                                p: (props) => <p className="text-sm leading-6" {...props} />,
                                ul: (props) => <ul className="list-disc space-y-1 pl-5" {...props} />,
                                ol: (props) => <ol className="list-decimal space-y-1 pl-5" {...props} />,
                                li: (props) => <li className="text-sm" {...props} />,
                                blockquote: (props) => (
                                  <blockquote
                                    className="border-l-2 pl-4 text-sm text-muted-foreground"
                                    {...props}
                                  />
                                ),
                                code: (props) => (
                                  <code className="rounded bg-muted px-1 py-0.5 text-xs" {...props} />
                                ),
                              }}
                            >
                              {cleanedExplanation}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No explanation yet. Run analysis to generate the report.
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="pt-2">
                      <RiskDisclaimer />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="signals" className="mt-4">
                  <Card>
                    <CardContent className="py-6">
                      <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-4 text-xs">
                        {JSON.stringify(row.signals ?? {}, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )
        )}
      </div>
    </div>
  );
}
