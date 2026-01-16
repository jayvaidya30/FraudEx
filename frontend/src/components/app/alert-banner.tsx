import { AlertCircle, ShieldAlert, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AlertSeverity = "critical" | "warning" | "info";

interface AlertBannerProps {
  severity: AlertSeverity;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    className: "border-2 border-black bg-black/5",
  },
  warning: {
    icon: AlertCircle,
    className: "border-l-4 border-foreground bg-muted/30",
  },
  info: {
    icon: AlertCircle,
    className: "border border-border bg-background",
  },
};

export function AlertBanner({
  severity,
  title,
  message,
  action,
  onDismiss,
  className,
}: AlertBannerProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Alert className={cn(config.className, className)}>
      <Icon className="h-5 w-5" />
      <AlertTitle className="flex items-center justify-between">
        <span className="font-semibold">{title}</span>
        <div className="flex items-center gap-2">
          {action && (
            <Button
              onClick={action.onClick}
              variant="default"
              size="sm"
              className="h-7"
            >
              {action.label}
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
