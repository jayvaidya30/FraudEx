import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { riskBandClasses, riskBandFromScore, riskBandLabel } from "@/lib/risk";

interface RiskScoreDisplayProps {
  score: number | null;
  status: string;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskScoreDisplay({ 
  score, 
  status, 
  showProgress = true,
  size = "md" 
}: RiskScoreDisplayProps) {
  if (status !== "analyzed" || typeof score !== "number") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const band = riskBandFromScore(score);
  const ui = riskBandClasses(band);
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={ui.badge}>
          {riskBandLabel(band)}
        </Badge>
        <span className={`font-semibold ${sizeClasses[size]}`}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
      {showProgress && <Progress value={score} className="h-1.5" />}
    </div>
  );
}
