"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Anomaly {
  id: string
  metric: string
  currentValue: number
  previousValue: number
  changePercent: number
  severity: "critical" | "high" | "medium" | "low"
  description: string
  timestamp?: string
}

interface AnomalyDetectionCardProps {
  anomalies: Anomaly[]
  title?: string
  description?: string
  className?: string
}

export function AnomalyDetectionCard({
  anomalies,
  title = "Anomaly Detection",
  description = "Significant changes from baseline",
  className,
}: AnomalyDetectionCardProps) {
  const sortedAnomalies = [...anomalies].sort((a, b) => {
    const priority: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    }
    return priority[a.severity] - priority[b.severity]
  })

  const getSeverityConfig = (severity: Anomaly["severity"]) => {
    switch (severity) {
      case "critical":
        return {
          border: "border-2 border-black",
          bg: "bg-black/5",
          badge: "Critical",
        }
      case "high":
        return {
          border: "border-foreground",
          bg: "bg-muted/50",
          badge: "High",
        }
      case "medium":
        return {
          border: "border-muted-foreground",
          bg: "bg-background",
          badge: "Medium",
        }
      case "low":
        return {
          border: "border-muted",
          bg: "bg-background",
          badge: "Low",
        }
    }
  }

  const formatChange = (changePercent: number) => {
    const abs = Math.abs(changePercent)
    const sign = changePercent >= 0 ? "+" : ""
    return `${sign}${changePercent.toFixed(1)}%`
  }

  if (anomalies.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No anomalies detected</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {sortedAnomalies.length} anomal{sortedAnomalies.length === 1 ? "y" : "ies"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedAnomalies.map((anomaly) => {
          const config = getSeverityConfig(anomaly.severity)
          const isIncrease = anomaly.changePercent >= 0

          return (
            <div
              key={anomaly.id}
              className={cn("p-4 rounded-lg", config.border, config.bg)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{anomaly.metric}</h4>
                    <Badge variant="outline" className="text-xs">
                      {config.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {anomaly.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Previous: </span>
                      <span className="font-medium">{anomaly.previousValue}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current: </span>
                      <span className="font-medium">{anomaly.currentValue}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1">
                    {isIncrease ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-bold">
                      {formatChange(anomaly.changePercent)}
                    </span>
                  </div>
                  {anomaly.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {anomaly.timestamp}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
