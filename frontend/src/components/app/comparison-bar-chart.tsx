"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ComparisonItem {
  label: string
  beforeValue: number
  afterValue: number
  maxValue?: number
}

interface ComparisonBarChartProps {
  items: ComparisonItem[]
  title?: string
  description?: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function ComparisonBarChart({
  items,
  title = "Before vs After",
  description,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: ComparisonBarChartProps) {
  // Find max value for scaling
  const maxValue = items.reduce((max, item) => {
    const itemMax = item.maxValue ?? Math.max(item.beforeValue, item.afterValue)
    return Math.max(max, itemMax)
  }, 0)

  const getBarWidth = (value: number) => {
    if (maxValue === 0) return "0%"
    return `${(value / maxValue) * 100}%`
  }

  const getChange = (before: number, after: number) => {
    if (before === 0) return after > 0 ? "+100%" : "0%"
    const change = ((after - before) / before) * 100
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <div className="flex items-center gap-4 text-xs mt-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-muted-foreground/30" />
            <span>{beforeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-foreground" />
            <span>{afterLabel}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map((item, index) => {
          const change = getChange(item.beforeValue, item.afterValue)
          const isIncrease = item.afterValue > item.beforeValue
          const isDecrease = item.afterValue < item.beforeValue

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    isIncrease && "border-foreground",
                    isDecrease && "border-muted-foreground"
                  )}
                >
                  {change}
                </Badge>
              </div>

              {/* Before bar */}
              <div className="space-y-1">
                <div className="h-6 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-muted-foreground/30 transition-all"
                    style={{ width: getBarWidth(item.beforeValue) }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{beforeLabel}</span>
                  <span>{item.beforeValue}</span>
                </div>
              </div>

              {/* After bar */}
              <div className="space-y-1">
                <div className="h-6 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: getBarWidth(item.afterValue) }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{afterLabel}</span>
                  <span>{item.afterValue}</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
