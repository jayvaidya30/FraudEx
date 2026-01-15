"use client";

import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: "default" | "warning" | "danger" | "success";
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon,
  variant = "default" 
}: MetricCardProps) {
  const variantStyles = {
    default: "border-l-primary",
    warning: "border-l-yellow-500",
    danger: "border-l-red-500",
    success: "border-l-green-500",
  };

  return (
    <Card className={`border-l-4 ${variantStyles[variant]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{value}</span>
              {trend && (
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="text-2xl text-muted-foreground">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
