import { useRouter } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RiskBadge, StatusBadge } from "@/components/risk";
import type { CaseRow } from "@/lib/backend";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface PriorityQueueProps {
  cases: CaseRow[];
  maxItems?: number;
  className?: string;
}

export function PriorityQueue({ cases, maxItems = 5, className }: PriorityQueueProps) {
  const router = useRouter();

  const priorityCases = cases
    .filter((c) => {
      // Only show cases that need action
      return (
        c.status === "failed" ||
        (c.status === "analyzed" && (c.risk_score ?? 0) >= 60) ||
        c.status === "processing"
      );
    })
    .slice(0, maxItems);

  if (priorityCases.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Priority Queue</CardTitle>
          <CardDescription>Cases requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No urgent items</p>
            <p className="text-xs mt-1">All cases are in good standing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Priority Queue
          <Badge variant="secondary" className="font-mono">
            {priorityCases.length}
          </Badge>
        </CardTitle>
        <CardDescription>Cases requiring immediate attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        {priorityCases.map((caseItem, index) => (
          <div key={caseItem.case_id}>
            <button
              onClick={() => router.push(`/cases/${caseItem.case_id}`)}
              className={cn(
                "w-full text-left py-4 transition-colors hover:bg-muted/50",
                "focus:outline-none focus:bg-muted/50"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        caseItem.status === "uploaded"
                          ? "pending"
                          : caseItem.status === "processing"
                          ? "analyzing"
                          : caseItem.status === "failed"
                          ? "failed"
                          : "completed"
                      }
                      size="sm"
                    />
                    {caseItem.risk_score !== null && (
                      <RiskBadge score={caseItem.risk_score} size="sm" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Case {caseItem.case_id.slice(0, 8)}
                    </p>
                    {caseItem.explanation && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {caseItem.explanation}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(caseItem.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </button>
            {index < priorityCases.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
