import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface RiskInterpretationProps {
  score: number;
  level?: RiskLevel;
  explanation?: string;
  compact?: boolean;
  className?: string;
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "critical";
  if (score >= 50) return "high";
  if (score >= 30) return "medium";
  return "low";
}

const interpretationConfig = {
  critical: {
    icon: ShieldAlert,
    title: "Critical Risk",
    message: "Immediate action required. Strong indicators of fraudulent activity detected.",
    action: "Escalate immediately for investigation",
    color: "text-foreground",
    bgColor: "bg-black/5",
    borderColor: "border-black",
  },
  high: {
    icon: AlertTriangle,
    title: "High Risk",
    message: "Significant risk detected. Multiple fraud indicators present.",
    action: "Review and investigate within 24 hours",
    color: "text-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-foreground",
  },
  medium: {
    icon: Info,
    title: "Medium Risk",
    message: "Some concerning patterns identified. Further review recommended.",
    action: "Schedule for detailed review",
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-muted-foreground",
  },
  low: {
    icon: CheckCircle,
    title: "Low Risk",
    message: "No significant risk indicators detected. Transaction appears normal.",
    action: "Standard monitoring sufficient",
    color: "text-muted-foreground",
    bgColor: "bg-background",
    borderColor: "border-muted",
  },
};

export function RiskInterpretation({
  score,
  level,
  explanation,
  compact = false,
  className,
}: RiskInterpretationProps) {
  const riskLevel = level || getRiskLevel(score);
  const config = interpretationConfig[riskLevel];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.color)} />
        <div className="space-y-1 flex-1">
          <p className={cn("font-semibold", config.color)}>{config.title}</p>
          <p className="text-sm text-muted-foreground">
            {explanation || config.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "p-4 border-l-4",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-6 w-6 flex-shrink-0 mt-0.5", config.color)} />
        <div className="space-y-2 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className={cn("font-semibold text-lg", config.color)}>
              {config.title}
            </h3>
            <span className={cn("text-2xl font-bold", config.color)}>
              {score}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {explanation || config.message}
          </p>
          <div className="pt-2 border-t border-muted">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recommended Action
            </p>
            <p className="text-sm font-medium mt-1">{config.action}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function QuickRiskSummary({
  score,
  confidence,
  level,
}: {
  score: number;
  confidence?: number;
  level?: RiskLevel;
}) {
  const riskLevel = level || getRiskLevel(score);
  const config = interpretationConfig[riskLevel];

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          config.bgColor
        )}
      >
        <span className={cn("text-lg font-bold", config.color)}>{score}</span>
      </div>
      <div className="flex-1">
        <p className={cn("font-semibold", config.color)}>{config.title}</p>
        {confidence !== undefined && (
          <p className="text-xs text-muted-foreground">
            {confidence}% confidence
          </p>
        )}
      </div>
    </div>
  );
}
