"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Signal {
  id: string
  name: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  message: string
  details?: string
  confidence?: number
}

interface SignalSummaryProps {
  signals: Signal[]
  maxVisible?: number
  title?: string
  description?: string
  className?: string
}

export function SignalSummary({
  signals,
  maxVisible = 3,
  title = "Key Signals",
  description = "Top fraud indicators detected",
  className,
}: SignalSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  const sortedSignals = [...signals].sort((a, b) => {
    const priority: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      info: 4,
    }
    return priority[a.severity] - priority[b.severity]
  })

  const visibleSignals = expanded
    ? sortedSignals
    : sortedSignals.slice(0, maxVisible)
  const hasMore = sortedSignals.length > maxVisible

  const getSeverityConfig = (severity: Signal["severity"]) => {
    switch (severity) {
      case "critical":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          border: "border-2 border-black",
          bg: "bg-black/5",
        }
      case "high":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          border: "border-foreground",
          bg: "bg-muted/50",
        }
      case "medium":
        return {
          icon: <Info className="h-4 w-4" />,
          border: "border-muted-foreground",
          bg: "bg-background",
        }
      case "low":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          border: "border-muted",
          bg: "bg-background",
        }
      case "info":
        return {
          icon: <Info className="h-4 w-4" />,
          border: "border-muted",
          bg: "bg-background",
        }
    }
  }

  if (signals.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No signals detected</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} ({sortedSignals.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleSignals.map((signal) => {
          const config = getSeverityConfig(signal.severity)
          return (
            <div
              key={signal.id}
              className={cn("p-4 rounded-lg", config.border, config.bg)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{signal.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {signal.severity}
                    </Badge>
                    {signal.confidence !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(signal.confidence * 100)}% confident
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{signal.message}</p>
                  {signal.details && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {signal.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full"
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show {sortedSignals.length - maxVisible} more signal
                {sortedSignals.length - maxVisible > 1 ? "s" : ""}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
