import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

type CaseStatus = "pending" | "analyzing" | "completed" | "failed" | "needs_review";

interface StatusBadgeProps {
  status: CaseStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<CaseStatus, {
  label: string;
  color: string;
  icon: typeof Clock;
  animated?: boolean;
}> = {
  pending: {
    label: "Pending",
    color: "bg-muted text-muted-foreground border-muted hover:bg-muted",
    icon: Clock,
  },
  analyzing: {
    label: "Analyzing",
    color: "bg-foreground text-background border-foreground hover:bg-foreground",
    icon: Loader2,
    animated: true,
  },
  completed: {
    label: "Completed",
    color: "bg-background text-foreground border-border hover:bg-background",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    color: "bg-black text-white border-black hover:bg-black",
    icon: XCircle,
  },
  needs_review: {
    label: "Needs Review",
    color: "bg-muted text-foreground border-border hover:bg-muted",
    icon: AlertCircle,
  },
};

const sizeConfig = {
  sm: {
    badge: "text-xs px-2 py-0.5",
    icon: "h-3 w-3",
  },
  md: {
    badge: "text-sm px-2.5 py-1",
    icon: "h-3.5 w-3.5",
  },
  lg: {
    badge: "text-base px-3 py-1.5",
    icon: "h-4 w-4",
  },
};

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeStyles = sizeConfig[size];

  return (
    <Badge
      className={cn(
        "font-medium border inline-flex items-center gap-1.5",
        config.color,
        sizeStyles.badge,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            sizeStyles.icon,
            config.animated && "animate-spin"
          )}
        />
      )}
      {config.label}
    </Badge>
  );
}

export function getStatusPriority(status: CaseStatus): number {
  const priority = {
    failed: 1,
    needs_review: 2,
    analyzing: 3,
    pending: 4,
    completed: 5,
  };
  return priority[status] || 999;
}
