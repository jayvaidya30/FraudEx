"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CaseStatusBadge } from "./case-status-badge";

interface CaseSummaryCardProps {
  status: string;
  riskScore: number | null;
  createdAt: string | null;
  polling?: boolean;
  pollStopped?: boolean;
  jobStatus?: string | null;
  jobError?: string | null;
}

export function CaseSummaryCard({
  status,
  riskScore,
  createdAt,
  polling,
  pollStopped,
  jobStatus,
  jobError,
}: CaseSummaryCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
        <div>
          <div className="text-xs text-muted-foreground">Status</div>
          <div className="mt-1 space-y-1">
            <CaseStatusBadge status={status} />
            {polling && (
              <div className="text-xs text-muted-foreground">Updating…</div>
            )}
            {pollStopped && (
              <div className="text-xs text-muted-foreground">Auto-refresh paused</div>
            )}
            {status === "processing" && jobStatus && (
              <div className="text-xs text-muted-foreground">
                Job: {jobStatus}
              </div>
            )}
            {jobStatus === "failed" && jobError && (
              <div className="text-xs text-destructive">{jobError}</div>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Risk score</div>
          <div className="mt-1 text-2xl font-semibold">
            {riskScore ?? "—"}
            {riskScore !== null && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                / 100
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Created</div>
          <div className="mt-1 text-sm">
            {createdAt ? new Date(createdAt).toLocaleString() : "—"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
