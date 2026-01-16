import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RiskScoreDisplay } from "./risk-score-display";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { oneLineInterpretation, riskBandFromScore } from "@/lib/risk";

interface CaseReportProps {
  status: string;
  riskScore: number | null;
  explanation: string | null;
  recommendations?: string[];
}

export function CaseReport({ status, riskScore, explanation, recommendations = [] }: CaseReportProps) {
  if (status !== "analyzed") {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Analysis not yet complete. Run analysis to generate the report.
        </CardContent>
      </Card>
    );
  }

  const band = riskBandFromScore(riskScore);
  const interpretation = oneLineInterpretation(band);
  const cleanedExplanation = explanation
    ? explanation
        .replace(/^[\p{Extended_Pictographic}\uFE0F]+\s*/gmu, "")
        .replace(/^DISCLAIMER:/gim, "Disclaimer:")
    : null;

  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-primary">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Executive summary
              </div>
              <p className="text-sm">{interpretation}</p>
            </div>
            <div className="sm:text-right">
              <RiskScoreDisplay score={riskScore} status={status} size="lg" />
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="space-y-2 rounded-md bg-muted/50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide">
                Primary recommendation
              </div>
              <p className="text-sm">{recommendations[0]}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {cleanedExplanation && (
        <Card>
          <CardContent className="prose prose-sm max-w-none p-6 dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {cleanedExplanation}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
