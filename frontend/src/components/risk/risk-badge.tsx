import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface RiskBadgeProps {
  score: number;
  level?: RiskLevel;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "critical";
  if (score >= 50) return "high";
  if (score >= 30) return "medium";
  return "low";
}

const riskConfig = {
  critical: {
    label: "Critical Risk",
    shortLabel: "Critical",
    color: "bg-black hover:bg-black text-white border-2 border-black",
    dotColor: "bg-black",
  },
  high: {
    label: "High Risk",
    shortLabel: "High",
    color: "bg-foreground hover:bg-foreground text-background border border-foreground",
    dotColor: "bg-foreground",
  },
  medium: {
    label: "Medium Risk",
    shortLabel: "Medium",
    color: "bg-muted hover:bg-muted text-foreground border border-border",
    dotColor: "bg-muted-foreground",
  },
  low: {
    label: "Low Risk",
    shortLabel: "Low",
    color: "bg-background hover:bg-background text-muted-foreground border border-muted",
    dotColor: "bg-muted",
  },
};

const sizeConfig = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function RiskBadge({
  score,
  level,
  showScore = false,
  size = "md",
  className,
}: RiskBadgeProps) {
  const riskLevel = level || getRiskLevel(score);
  const config = riskConfig[riskLevel];

  return (
    <Badge
      className={cn(
        "font-semibold border",
        config.color,
        sizeConfig[size],
        className
      )}
    >
      <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.shortLabel}
      {showScore && <span className="ml-1">({score})</span>}
    </Badge>
  );
}

export function RiskDot({ level }: { level: RiskLevel }) {
  const config = riskConfig[level];
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", config.dotColor)}
      title={config.label}
    />
  );
}
