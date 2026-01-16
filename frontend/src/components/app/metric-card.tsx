"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown } from "lucide-react"
import { formatTrend } from "@/lib/risk"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  previousValue?: number
  currentValue?: number
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  priority?: "critical" | "high" | "medium" | "low"
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({
  title,
  value,
  previousValue,
  currentValue,
  subtitle,
  trend,
  trendLabel,
  priority = "medium",
  icon,
  className,
}: MetricCardProps) {
  // Calculate trend if previous and current values provided
  const calculatedTrend =
    previousValue !== undefined && currentValue !== undefined
      ? formatTrend(currentValue, previousValue)
      : null

  const displayTrend = calculatedTrend || {
    direction: trend || "neutral",
    percentage: trendLabel,
    isGood: trend === "up",
  }

  const priorityConfig = {
    critical: {
      border: "border-2 border-black",
      bg: "bg-black/5",
    },
    high: {
      border: "border-foreground",
      bg: "bg-muted/50",
    },
    medium: {
      border: "border-muted-foreground",
      bg: "bg-background",
    },
    low: {
      border: "border-muted",
      bg: "bg-background",
    },
  }

  const config = priorityConfig[priority]

  const getTrendIcon = () => {
    switch (displayTrend.direction) {
      case "up":
        return <TrendingUp className="h-4 w-4" />
      case "down":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  return (
    <Card className={cn(config.border, config.bg, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {displayTrend.direction !== "neutral" && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              {displayTrend.percentage && (
                <span className="text-sm text-muted-foreground">
                  {displayTrend.percentage}
                </span>
              )}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface MetricGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function MetricGrid({
  children,
  columns = 4,
  className,
}: MetricGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  )
}
