import Link from "next/link";

import { RiskDisclaimer } from "@/components/app/risk-disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">
              FraudEx — AI-assisted, explainable risk indicators
            </h1>
            <p className="text-muted-foreground">
              Upload documents, extract text (OCR when needed), detect anomalies, compute a risk score (0–100),
              and generate a human-readable explanation suitable for review.
            </p>
          </div>

          <RiskDisclaimer />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Document ingestion</CardTitle>
                <CardDescription>Upload PDF, images, CSV, or text.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Each upload creates a unique case ID and preserves original artifacts for traceability.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Explainability</CardTitle>
                <CardDescription>Readable reasoning, not black-box outputs.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Results are labeled as risk indicators with safety safeguards to avoid accusations.
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>What you can do</CardTitle>
            <CardDescription>Mapped to the backend SRS capabilities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Create cases by uploading documents</li>
              <li>Run AI + heuristic analysis to produce risk indicators</li>
              <li>Store risk score, signals, and explainable report per case</li>
              <li>Retrieve case results via the dashboard and case detail view</li>
            </ul>
            <Separator />
            <div className="text-muted-foreground">
              Backend endpoints used: <span className="font-mono text-xs">/auth/me</span>,{" "}
              <span className="font-mono text-xs">/cases</span>, <span className="font-mono text-xs">/cases/upload</span>,{" "}
              <span className="font-mono text-xs">/cases/:id</span>, <span className="font-mono text-xs">/cases/:id/analyze</span>.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
