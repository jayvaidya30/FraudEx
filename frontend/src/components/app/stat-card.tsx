import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: "default" | "primary" | "warning" | "danger" | "amber";
}

const variantClasses = {
  default: "border-l-muted",
  primary: "border-l-primary",
  warning: "border-l-orange-500",
  danger: "border-l-red-500",
  amber: "border-l-amber-500",
};

export function StatCard({ label, value, description, icon, variant = "default" }: StatCardProps) {
  return (
    <Card className={cn("border-l-4", variantClasses[variant])}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </div>
          {icon && (
            <div className="ml-4 rounded-full bg-muted/50 p-3 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
