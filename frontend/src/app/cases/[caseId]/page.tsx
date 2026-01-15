"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { RiskDisclaimer } from "@/components/app/risk-disclaimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeCase, getCaseById, type CaseRow } from "@/lib/backend";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function StatusBadge({ status }: { status: string }) {
  const variant = status === "analyzed" ? "default" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
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
    } catch (err: any) {
      toast.error(err?.message || "Failed to load case");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, caseId]);

  async function onAnalyze() {
    if (!token) return;
    setAnalyzing(true);
    try {
      toast.loading("Analyzing…", { id: "analyze" });
      await analyzeCase(token, caseId);
      toast.success("Analysis complete", { id: "analyze" });
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Analysis failed", { id: "analyze" });
    } finally {
      setAnalyzing(false);
    }
  }

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

          <Button onClick={onAnalyze} disabled={analyzing || !row}>
            {analyzing ? "Running…" : "Analyze"}
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
                  <Card>
                    <CardContent className="py-6">
                      {row.explanation ? (
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
                            {row.explanation}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No explanation yet. Run analysis to generate the report.
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
