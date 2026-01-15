"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { RiskDisclaimer } from "@/components/app/risk-disclaimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { analyzeCase, listCases, type CaseRow, uploadCase } from "@/lib/backend";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function StatusBadge({ status }: { status: string }) {
  const variant = status === "analyzed" ? "default" : "secondary";
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

  async function refresh() {
    if (!token) return;
    try {
      const rows = await listCases(token);
      setCases(rows);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load cases");
      setCases([]);
    }
  }

  useEffect(() => {
    if (!token) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

      const created = (result as any)?.case;
      const createdRow = Array.isArray(created) ? created[0] : created;
      const caseId = createdRow?.case_id;
      if (caseId) router.push(`/cases/${caseId}`);
    } catch (err: any) {
      toast.error(err?.message || "Upload failed", { id: "upload" });
    }
  }

  async function onAnalyze(caseId: string) {
    if (!token) return;
    setBusyCaseId(caseId);
    try {
      toast.loading("Analyzing…", { id: `analyze-${caseId}` });
      await analyzeCase(token, caseId);
      toast.success("Analysis complete", { id: `analyze-${caseId}` });
      await refresh();
    } catch (err: any) {
      toast.error(err?.message || "Analysis failed", { id: `analyze-${caseId}` });
    } finally {
      setBusyCaseId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Upload a document to create a case, then run analysis to generate an explainable risk report.
          </p>
        </div>

        <RiskDisclaimer />

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
            <Card>
              <CardHeader>
                <CardTitle>New case</CardTitle>
                <CardDescription>Upload a PDF, image, CSV, or text file.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="w-full text-sm"
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.csv,.txt"
                />
                <Button onClick={onUpload} className="sm:w-40">
                  Upload
                </Button>
              </CardContent>
            </Card>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Your cases</h2>
                <Button variant="outline" size="sm" onClick={refresh}>
                  Refresh
                </Button>
              </div>

          {cases === null ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : cases.length === 0 ? (
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
                  {cases.map((c) => (
                    <TableRow key={c.case_id}>
                      <TableCell className="font-mono text-xs">
                        <Link className="hover:underline" href={`/cases/${c.case_id}`}>
                          {c.case_id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell>{c.risk_score ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/cases/${c.case_id}`}>View</Link>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onAnalyze(c.case_id)}
                            disabled={busyCaseId === c.case_id}
                          >
                            {busyCaseId === c.case_id ? "Running…" : "Analyze"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
