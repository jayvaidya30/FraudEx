"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { listCases, getAnalysisJob, isCaseTerminal, type CaseRow, type AnalysisJob } from "@/lib/backend";

export function useCases(token: string | null) {
  const [cases, setCases] = useState<CaseRow[] | null>(null);
  const [jobByCaseId, setJobByCaseId] = useState<Record<string, AnalysisJob | null>>({});
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
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
      const message = err instanceof Error ? err.message : "Failed to load cases";
      toast.error(message);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void refresh();
  }, [token, refresh]);

  return { cases, jobByCaseId, loading, refresh };
}
