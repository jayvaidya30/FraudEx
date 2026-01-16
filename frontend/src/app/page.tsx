import Link from "next/link";

import { RiskDisclaimer } from "@/components/app/risk-disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">FraudEx</h1>
            <p className="text-lg text-muted-foreground">
              An AI-assisted decision-support system for reviewers. It surfaces risk indicators and explains why a
              document may warrant attention.
            </p>
            <div className="text-sm text-muted-foreground">
              Built for auditability, transparency, and human verification.
            </div>
          </div>

          <RiskDisclaimer />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <TooltipProvider>
              <Card>
                <CardHeader>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="cursor-help">Human review required</CardTitle>
                    </TooltipTrigger>
                    <TooltipContent>AI-assisted, not AI-decided.</TooltipContent>
                  </Tooltip>
                  <CardDescription>Risk indicators are not conclusions.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  FraudEx highlights anomalies and prioritization cues; reviewers confirm facts, context, and intent.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="cursor-help">Explainable outputs</CardTitle>
                    </TooltipTrigger>
                    <TooltipContent>Clear reasoning for every indicator.</TooltipContent>
                  </Tooltip>
                  <CardDescription>Plain-language reasoning.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Each case includes contributing factors, recommendations, and a traceable detector breakdown.
                </CardContent>
              </Card>
            </TooltipProvider>
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>A safe mental model for analysts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Create a case by uploading a document</li>
              <li>Run analysis to generate risk indicators and a score (0–100)</li>
              <li>Review the executive summary, top factors, and recommendations</li>
              <li>Open technical details only when needed for audit and verification</li>
            </ol>
            <Separator />
            <div>
              This product is designed to support decisions, not replace judgment.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
