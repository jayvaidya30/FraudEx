"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { RiskBadge, ConfidenceMeter } from "@/components/risk"
import { cn } from "@/lib/utils"

interface StickyVerdictHeaderProps {
  caseId: string
  caseName: string
  riskScore: number
  confidence: number
  status: string
  sticky?: boolean
  className?: string
}

export function StickyVerdictHeader({
  caseId,
  caseName,
  riskScore,
  confidence,
  status,
  sticky = true,
  className,
}: StickyVerdictHeaderProps) {
  return (
    <Card
      className={cn(
        "border-2 border-foreground bg-background",
        sticky && "sticky top-0 z-10",
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Case Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold truncate">{caseName}</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Case ID: {caseId}</p>
          </div>

          {/* Right: Verdict */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <RiskBadge score={riskScore} />
            <div className="text-right">
              <div className="text-3xl font-bold">{riskScore}</div>
              <div className="text-xs text-muted-foreground">Risk Score</div>
            </div>
          </div>
        </div>

        {/* Bottom: Confidence */}
        <div className="mt-4 pt-4 border-t">
          <ConfidenceMeter confidence={Math.round(confidence * 100)} label="Confidence" />
        </div>
      </div>
    </Card>
  )
}
