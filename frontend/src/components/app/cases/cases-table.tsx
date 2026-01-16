"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CaseStatusBadge } from "./case-status-badge";
import { RiskScoreDisplay } from "./risk-score-display";
import type { CaseRow, AnalysisJob } from "@/lib/backend";

interface CasesTableProps {
  cases: CaseRow[];
  jobByCaseId?: Record<string, AnalysisJob | null>;
  onAnalyze?: (caseId: string) => void;
  busyCaseId?: string | null;
}

export function CasesTable({ cases, jobByCaseId = {}, onAnalyze, busyCaseId }: CasesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Score</TableHead>
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
                <div className="space-y-1">
                  <CaseStatusBadge status={c.status} />
                  {c.status === "processing" && jobByCaseId[c.case_id]?.status && (
                    <div className="text-xs text-muted-foreground">
                      Job: {jobByCaseId[c.case_id]?.status}
                    </div>
                  )}
                  {jobByCaseId[c.case_id]?.status === "failed" &&
                    jobByCaseId[c.case_id]?.error && (
                      <div className="text-xs text-destructive">
                        {jobByCaseId[c.case_id]?.error}
                      </div>
                    )}
                </div>
              </TableCell>
              <TableCell>
                <RiskScoreDisplay 
                  score={c.risk_score} 
                  status={c.status}
                  size="sm"
                />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/cases/${c.case_id}`}>View</Link>
                  </Button>
                  {c.status !== "analyzed" && onAnalyze && (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
