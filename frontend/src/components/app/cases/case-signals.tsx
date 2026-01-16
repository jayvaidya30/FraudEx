import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetectorRadarChart } from "./detector-radar-chart";

type SignalFactor = {
  detector?: string;
  score_contribution?: number;
  confidence?: number;
  explanation?: string;
  key_indicators?: Record<string, unknown>;
};

type DetectorBreakdown = {
  score?: number;
  weight?: number;
  confidence?: number;
  indicators?: Record<string, unknown>;
  explanation?: string;
};

interface CaseSignalsProps {
  topFactors: SignalFactor[];
  recommendations: string[];
  detectorBreakdown: Record<string, DetectorBreakdown>;
  confidence?: number;
}

function formatDetectorName(name: string) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function CaseSignals({ topFactors, recommendations, detectorBreakdown, confidence }: CaseSignalsProps) {
  // Extract Benford and Velocity specific data
  const benfordData = detectorBreakdown["benford"];
  const velocityData = detectorBreakdown["velocity"];

  return (
    <div className="space-y-6">
      {confidence !== undefined && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Analysis Confidence</span>
              <Badge variant="outline">{(confidence * 100).toFixed(1)}%</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <DetectorRadarChart detectorBreakdown={detectorBreakdown} />

      {benfordData && benfordData.indicators && Object.keys(benfordData.indicators).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Benford&apos;s Law Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {benfordData.explanation && (
                <p className="text-sm text-muted-foreground">{benfordData.explanation}</p>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {benfordData.indicators.sample_size !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Sample Size</p>
                    <p className="text-lg font-semibold">{String(benfordData.indicators.sample_size)}</p>
                  </div>
                )}
                {benfordData.indicators.mad !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Mean Absolute Deviation</p>
                    <p className="text-lg font-semibold">{Number(benfordData.indicators.mad).toFixed(4)}</p>
                  </div>
                )}
                {benfordData.indicators.chi_squared !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Chi-Squared</p>
                    <p className="text-lg font-semibold">{Number(benfordData.indicators.chi_squared).toFixed(2)}</p>
                  </div>
                )}
                {benfordData.score !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <p className="text-lg font-semibold">{benfordData.score.toFixed(1)}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {velocityData && velocityData.indicators && Object.keys(velocityData.indicators).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Velocity &amp; Timing Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {velocityData.explanation && (
                <p className="text-sm text-muted-foreground">{velocityData.explanation}</p>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {velocityData.indicators.total_dates !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Dates</p>
                    <p className="text-lg font-semibold">{String(velocityData.indicators.total_dates)}</p>
                  </div>
                )}
                {velocityData.indicators.weekend_ratio !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Weekend Activity</p>
                    <p className="text-lg font-semibold">{(Number(velocityData.indicators.weekend_ratio) * 100).toFixed(0)}%</p>
                  </div>
                )}
                {velocityData.indicators.patterns !== undefined && Array.isArray(velocityData.indicators.patterns) && velocityData.indicators.patterns.length > 0 && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground">Detected Patterns</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {velocityData.indicators.patterns.map((pattern: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          {pattern.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {velocityData.score !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <p className="text-lg font-semibold">{velocityData.score.toFixed(1)}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recommendations available</p>
          ) : (
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
