"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { RiskDisclaimer } from "@/components/app/risk-disclaimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  analyzeCase,
  getAnalysisJob,
  isCaseTerminal,
  listCases,
  type AnalysisJob,
  type CaseRow,
  uploadCase,
} from "@/lib/backend";
import { riskBandClasses, riskBandFromScore, riskBandLabel } from "@/lib/risk";
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

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? getSupabaseBrowserClient() : null),
    [],
  );

  const [token, setToken] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseRow[] | null>(null);
  const [busyCaseId, setBusyCaseId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [jobByCaseId, setJobByCaseId] = useState<Record<string, AnalysisJob | null>>(
    {},
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const rows = await listCases(token);
      setCases(rows);
      const processing = rows.filter((row) => !isCaseTerminal(row.status));
      if (processing.length === 0) {
        setJobByCaseId({});
        return;
      }

      const jobPairs = await Promise.all(
        processing.map(async (row) => {
          const jobId = (row.signals as Record<string, unknown> | null)?.analysis_job_id;
          if (typeof jobId !== "string" || jobId.length === 0) {
            return [row.case_id, null] as const;
          }
          try {
            const job = await getAnalysisJob(token, jobId);
            return [row.case_id, job] as const;
          } catch {
            return [row.case_id, null] as const;
          }
        }),
      );

      const next: Record<string, AnalysisJob | null> = {};
      for (const [caseId, job] of jobPairs) {
        next[caseId] = job;
      }
      setJobByCaseId(next);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to load cases");
      setCases([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void refresh();
  }, [token, refresh]);

  useEffect(() => {
    if (!token || !cases) return;
    const hasProcessing = cases.some((c) => !isCaseTerminal(c.status));
    if (!hasProcessing) {
      setPolling(false);
      return;
    }

    setPolling(true);
    const interval = setInterval(() => {
      void refresh();
    }, 2000);

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [token, cases, refresh]);

  async function onUpload() {
    if (!token) return;

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file first");
      return;
    }

    try {
      toast.loading("Uploading…", { id: "upload" });
      const result = await uploadCase(token, file);
      toast.success("Uploaded", { id: "upload" });
      await refresh();

      const caseId = result.case?.case_id;
      if (typeof caseId === "string" && caseId.length > 0) router.push(`/cases/${caseId}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Upload failed", { id: "upload" });
    }
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
      toast.error(getErrorMessage(err) || "Analysis failed", { id: `analyze-${caseId}` });
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
    const highOrCritical = rows.filter((c) => {
      const band = riskBandFromScore(c.risk_score);
      return c.status === "analyzed" && (band === "high" || band === "critical");
    }).length;
    return { total, failed, pending, processing, analyzed, highOrCritical };
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              What needs attention right now.
            </p>
          </div>

          <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/analytics">Analytics</Link>
          </Button>
        </div>
        </div>

        {!isSupabaseConfigured ? (
          <Card>
            <CardHeader>
              <CardTitle>Setup required</CardTitle>
              <CardDescription>Supabase environment variables are missing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                Create <span className="font-mono text-xs">frontend/.env.local</span> using
                <span className="font-mono text-xs"> frontend/.env.local.example</span> and set:
              </div>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <span className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</span>
                </li>
                <li>
                  <span className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                </li>
              </ul>
              <Button variant="outline" asChild>
                <Link href="/">Back to overview</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total cases</div>
                  <div className="mt-1 text-2xl font-semibold">{summary.total}</div>
                  <div className="text-xs text-muted-foreground">{summary.analyzed} analyzed</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">High priority</div>
                  <div className="mt-1 text-2xl font-semibold">{summary.highOrCritical}</div>
                  <div className="text-xs text-muted-foreground">High or critical risk</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">In progress</div>
                  <div className="mt-1 text-2xl font-semibold">{summary.processing}</div>
                  <div className="text-xs text-muted-foreground">Currently analyzing</div>
                </CardContent>
              </Card>
              <Card className={summary.failed > 0 ? "border-l-4 border-l-red-500" : "border-l-4 border-l-muted"}>
                <CardContent className="p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Failed</div>
                  <div className="mt-1 text-2xl font-semibold">{summary.failed}</div>
                  <div className="text-xs text-muted-foreground">Needs retry or review</div>
                </CardContent>
              </Card>
            </div>

            <Accordion type="single">
              <AccordionItem value="upload">
                <AccordionTrigger value="upload">Create case</AccordionTrigger>
                <AccordionContent value="upload">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Upload a PDF, image, CSV, or text file.
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="w-full text-sm"
                        accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.csv,.txt"
                      />
                      <Button onClick={onUpload} className="sm:w-40">
                        Upload
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Your cases</h2>
                <Button variant="outline" size="sm" onClick={refresh}>
                  {polling ? "Updating…" : "Refresh"}
                </Button>
              </div>

          {sortedCases === null ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : sortedCases.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                No cases yet. Upload a document to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk score</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCases.map((c) => {
                    const band = riskBandFromScore(c.risk_score);
                    const ui = riskBandClasses(band);
                    return (
                    <TableRow key={c.case_id}>
                      <TableCell className="font-mono text-xs">
                        <Link className="hover:underline" href={`/cases/${c.case_id}`}>
                          {c.case_id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                        {c.status === "processing" && jobByCaseId[c.case_id]?.status && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Job: {jobByCaseId[c.case_id]?.status}
                          </div>
                        )}
                        {jobByCaseId[c.case_id]?.status === "failed" &&
                          jobByCaseId[c.case_id]?.error && (
                            <div className="mt-1 text-xs text-destructive">
                              {jobByCaseId[c.case_id]?.error}
                            </div>
                          )}
                      </TableCell>
                      <TableCell>
                        {c.status === "analyzed" && typeof c.risk_score === "number" ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={ui.badge}>
                                {riskBandLabel(band)}
                              </Badge>
                              <span className="text-sm font-medium">{c.risk_score}</span>
                              <span className="text-xs text-muted-foreground">/100</span>
                            </div>
                            <Progress value={c.risk_score} className="h-1.5" />
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/cases/${c.case_id}`}>View</Link>
                          </Button>
                          {c.status !== "analyzed" && (
                            <Button
                              size="sm"
                              onClick={() => onAnalyze(c.case_id)}
                              disabled={busyCaseId === c.case_id || c.status === "processing"}
                            >
                              {busyCaseId === c.case_id
                                ? "Queueing…"
                                : c.status === "processing"
                                  ? "Processing…"
                                  : c.status === "failed"
                                    ? "Retry"
                                    : "Analyze"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
            </div>

            <div>
              <RiskDisclaimer />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
