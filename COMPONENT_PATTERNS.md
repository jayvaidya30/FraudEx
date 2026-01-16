# FraudEx Component Patterns & Tactical Guide
## Companion to IMPLEMENTATION_PLAN.md

---

## Quick Reference: Component Selection Matrix

```
Decision Need               | shadcn Component    | Why                           | Example Use Case
----------------------------|--------------------|------------------------------ |----------------------------------
Critical alert              | Alert + AlertTitle | Interrupt attention           | "3 cases need review now"
Risk level                  | Badge              | Instant visual parsing        | Critical/High/Medium/Low
Hierarchical metrics        | Card               | Logical grouping              | Risk score + breakdown
Hide technical details      | Collapsible        | Progressive disclosure        | "View detector details"
Mutually exclusive views    | Tabs               | Separate perspectives         | Signals / Narrative / Forensics
Infrequent actions          | Accordion          | Reduce primary clutter        | "Create new case"
Scannable data              | Table              | Efficient comparison          | Priority queue
Confidence/progress         | Progress           | Normalize 0-100 scale         | "Detection reliability: 96%"
Contextual help             | Tooltip            | Just-in-time explanation      | "What is Benford's Law?"
Loading state               | Skeleton           | Reduce perceived latency      | Match content structure
```

---

## Pattern Library

### 1. Risk Badge Pattern

**Purpose**: Consistent visual encoding of risk across entire application

```tsx
// /components/risk/risk-badge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { riskBandClasses, type RiskBand } from "@/lib/risk";

interface RiskBadgeProps {
  risk: RiskBand;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function RiskBadge({ risk, size = "md", showLabel = true }: RiskBadgeProps) {
  const classes = riskBandClasses(risk);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1"
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(classes.badge, sizeClasses[size])}
    >
      {showLabel && risk.toUpperCase()}
    </Badge>
  );
}
```

**Usage**:
```tsx
// Everywhere risk is displayed
<RiskBadge risk={riskBandFromScore(case.risk_score)} />

// In tables (compact)
<RiskBadge risk={risk} size="sm" showLabel={false} />

// In headers (prominent)
<RiskBadge risk={risk} size="lg" />
```

---

### 2. Confidence Meter Pattern

**Purpose**: Visual encoding of analytical confidence

```tsx
// /components/risk/confidence-meter.tsx
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number; // 0-1 scale
  label?: string;
  variant?: "inline" | "block";
}

export function ConfidenceMeter({ 
  value, 
  label = "Confidence",
  variant = "inline" 
}: ConfidenceMeterProps) {
  const percentage = Math.round(value * 100);
  
  const confidence = 
    percentage >= 90 ? { label: "Very High", color: "emerald" } :
    percentage >= 70 ? { label: "High", color: "green" } :
    percentage >= 50 ? { label: "Moderate", color: "amber" } :
    { label: "Low", color: "orange" };
  
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{label}:</span>
        <Badge variant="outline" className={cn(
          percentage >= 70 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"
        )}>
          {percentage}%
        </Badge>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{confidence.label} ({percentage}%)</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
```

**Usage**:
```tsx
// In case headers
<ConfidenceMeter value={0.87} variant="inline" />

// In detail cards
<ConfidenceMeter value={0.87} variant="block" label="Analysis Confidence" />
```

---

### 3. Priority Queue Pattern

**Purpose**: Action-oriented case list with composite prioritization

```tsx
// /components/command-center/priority-queue.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk/risk-badge";
import { formatDistanceToNow } from "date-fns";
import { riskBandFromScore, type CaseRow } from "@/lib/backend";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface PriorityQueueProps {
  cases: CaseRow[];
  limit?: number;
  onAction?: (caseId: string) => void;
}

// Composite priority: risk × confidence × recency
function calculatePriority(c: CaseRow): number {
  const risk = c.risk_score ?? 0;
  const confidence = (c.signals as any)?.confidence ?? 0.5;
  const ageHours = Date.now() - new Date(c.created_at).getTime() / (1000 * 60 * 60);
  const urgency = Math.max(0, 1 - (ageHours / 48)); // Decays over 48h
  
  return risk * confidence * urgency;
}

export function PriorityQueue({ cases, limit = 10, onAction }: PriorityQueueProps) {
  const sortedCases = [...cases]
    .filter(c => c.status === "analyzed" && c.risk_score !== null)
    .sort((a, b) => calculatePriority(b) - calculatePriority(a))
    .slice(0, limit);
  
  if (sortedCases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No cases in queue
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Case</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead>Key Signal</TableHead>
          <TableHead>Waiting</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedCases.map((c) => {
          const risk = riskBandFromScore(c.risk_score);
          const topSignal = (c.signals as any)?.top_factors?.[0]?.detector ?? "Unknown";
          const waiting = formatDistanceToNow(new Date(c.created_at), { addSuffix: true });
          
          return (
            <TableRow key={c.case_id} className="hover:bg-muted/50">
              <TableCell className="font-mono text-xs">
                {c.case_id.slice(0, 8)}...
              </TableCell>
              <TableCell>
                <RiskBadge risk={risk} size="sm" />
              </TableCell>
              <TableCell className="text-sm">{topSignal}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{waiting}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                >
                  <Link href={`/cases/${c.case_id}`}>
                    Review <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
```

**Usage**:
```tsx
// In command center
<Card>
  <CardHeader>
    <CardTitle>Review Queue</CardTitle>
    <CardDescription>Ranked by risk × confidence × recency</CardDescription>
  </CardHeader>
  <CardContent>
    <PriorityQueue cases={cases} limit={10} />
  </CardContent>
</Card>
```

---

### 4. Alert Banner Pattern

**Purpose**: Surface critical items requiring immediate attention

```tsx
// /components/command-center/alert-banner.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import type { CaseRow } from "@/lib/backend";

interface CriticalItem {
  type: "high-risk" | "failed";
  caseId: string;
  reason: string;
  age: string;
}

interface AlertBannerProps {
  items: CriticalItem[];
}

export function AlertBanner({ items }: AlertBannerProps) {
  if (items.length === 0) return null;
  
  const highRisk = items.filter(i => i.type === "high-risk");
  const failed = items.filter(i => i.type === "failed");
  
  return (
    <div className="space-y-3">
      {highRisk.length > 0 && (
        <Alert variant="destructive" className="border-l-4 border-l-red-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Cases Require Review</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {highRisk.slice(0, 3).map(item => (
                <div key={item.caseId} className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-mono">{item.caseId.slice(0, 8)}</span>
                    <span className="mx-2">•</span>
                    <span>{item.reason}</span>
                    <span className="mx-2">•</span>
                    <span className="text-muted-foreground">{item.age}</span>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/cases/${item.caseId}`}>Review</Link>
                  </Button>
                </div>
              ))}
              {highRisk.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  + {highRisk.length - 3} more cases
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {failed.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failures</AlertTitle>
          <AlertDescription>
            {failed.length} case{failed.length > 1 ? 's' : ''} failed to analyze.
            <Button size="sm" variant="outline" className="ml-3">
              Retry All
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

---

### 5. Sticky Verdict Header Pattern

**Purpose**: Maintain context during scroll in case detail view

```tsx
// /components/investigation/sticky-verdict-header.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk/risk-badge";
import { ConfidenceMeter } from "@/components/risk/confidence-meter";
import { oneLineInterpretation, riskBandFromScore } from "@/lib/risk";
import { FileUp, Scale } from "lucide-react";

interface StickyVerdictHeaderProps {
  caseId: string;
  riskScore: number | null;
  confidence?: number;
  status: string;
  onEscalate?: () => void;
  onExport?: () => void;
}

export function StickyVerdictHeader({ 
  caseId, 
  riskScore, 
  confidence = 0.5,
  status,
  onEscalate,
  onExport 
}: StickyVerdictHeaderProps) {
  const riskBand = riskBandFromScore(riskScore);
  const interpretation = oneLineInterpretation(riskBand);
  
  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Case {caseId.slice(0, 8)}
            </h1>
            <div className="flex items-center gap-3">
              <RiskBadge risk={riskBand} size="lg" />
              <ConfidenceMeter value={confidence} variant="inline" />
              <Badge variant={status === "analyzed" ? "default" : "secondary"}>
                {status}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              <FileUp className="h-4 w-4 mr-2" />
              Export
            </Button>
            {(riskBand === "high" || riskBand === "critical") && (
              <Button variant="default" size="sm" onClick={onEscalate}>
                <Scale className="h-4 w-4 mr-2" />
                Escalate
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2">
          {interpretation}
        </p>
      </div>
    </div>
  );
}
```

---

### 6. Progressive Signal Disclosure Pattern

**Purpose**: Show top signals by default, hide technical details

```tsx
// /components/investigation/signal-summary.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Signal {
  detector: string;
  contribution: number;
  confidence: number;
  explanation: string;
  indicators?: Record<string, unknown>;
}

interface SignalSummaryProps {
  signals: Signal[];
  maxVisible?: number;
}

export function SignalSummary({ signals, maxVisible = 3 }: SignalSummaryProps) {
  const topSignals = signals
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, maxVisible);
  
  return (
    <div className="space-y-4">
      {topSignals.map((signal, idx) => (
        <SignalCard key={idx} signal={signal} rank={idx + 1} />
      ))}
    </div>
  );
}

function SignalCard({ signal, rank }: { signal: Signal; rank: number }) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="rounded-full w-8 h-8 flex items-center justify-center">
              {rank}
            </Badge>
            <CardTitle className="text-base">
              {signal.detector.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </CardTitle>
          </div>
          <Badge variant="secondary">
            {(signal.contribution * 100).toFixed(0)}% impact
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{signal.explanation}</p>
        
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            {showDetails ? 'Hide' : 'View'} technical details
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {signal.indicators && Object.entries(signal.indicators).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="font-mono text-xs">{String(value)}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
```

---

### 7. Pattern Alert Pattern

**Purpose**: Surface significant anomalies in analytics

```tsx
// /components/patterns/pattern-alert.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Anomaly {
  title: string;
  description: string;
  metric: string;
  change: number; // percentage
  severity: "warning" | "critical";
  affectedCount: number;
  recommendations: string[];
}

interface PatternAlertProps {
  anomaly: Anomaly;
  onInvestigate?: () => void;
}

export function PatternAlert({ anomaly, onInvestigate }: PatternAlertProps) {
  const borderColor = anomaly.severity === "critical" 
    ? "border-l-red-500" 
    : "border-l-orange-500";
  
  const changeColor = anomaly.change > 0
    ? "text-red-600"
    : "text-green-600";
  
  return (
    <Alert className={cn("border-l-4", borderColor)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {anomaly.title}
        <Badge variant={anomaly.severity === "critical" ? "destructive" : "default"}>
          {anomaly.change > 0 ? "+" : ""}{anomaly.change.toFixed(0)}%
        </Badge>
      </AlertTitle>
      <AlertDescription>
        <p className="text-sm mb-3">{anomaly.description}</p>
        
        {anomaly.recommendations.length > 0 && (
          <div className="space-y-2 mb-3">
            <p className="text-xs font-medium">Recommended Actions:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              {anomaly.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={onInvestigate}>
            View {anomaly.affectedCount} Affected Cases
          </Button>
          <Button size="sm" variant="outline">
            Create Investigation
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

---

### 8. Comparison Chart Pattern

**Purpose**: Always show change, not absolute state

```tsx
// /components/charts/comparison-bar-chart.tsx
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  name: string;
  current: number;
  baseline: number;
  variance: number; // percentage
}

interface ComparisonBarChartProps {
  data: DataPoint[];
  title: string;
  description?: string;
  metric: string;
}

export function ComparisonBarChart({ data, title, description, metric }: ComparisonBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tickFormatter={(value) => value.replace(/_/g, " ")}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-sm">{data.name}</p>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-medium">{data.current.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Baseline:</span>
                        <span>{data.baseline.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t pt-1">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={data.variance > 0 ? "text-red-600" : "text-green-600"}>
                          {data.variance > 0 ? "+" : ""}{data.variance.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
            <Bar 
              dataKey="variance" 
              fill={(data) => data.variance > 0 ? "#ef4444" : "#10b981"}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-xs text-muted-foreground">
          Showing variance from 30-day baseline • {metric}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Implementation Checklist

### Before Starting Each Phase

- [ ] Review component selection matrix
- [ ] Identify information hierarchy (primary/secondary/tertiary)
- [ ] Define dominant question for the screen
- [ ] Plan progressive disclosure layers
- [ ] Check semantic consistency requirements

### During Development

- [ ] Use shared risk components (RiskBadge, ConfidenceMeter)
- [ ] Default to hiding technical details
- [ ] Show trends/changes, not absolute values
- [ ] Add Tooltip for definitions
- [ ] Use Skeleton for loading states
- [ ] Test keyboard navigation

### Code Review Checklist

- [ ] Risk badge colors match design system
- [ ] Confidence encoding uses opacity
- [ ] Status badges use semantic variants
- [ ] Charts show comparisons/baselines
- [ ] Technical details in Collapsible/Tab
- [ ] Primary action is clear
- [ ] Loading state matches content structure
- [ ] ARIA labels present

---

## Quick Start Commands

### Generate New Component

```bash
# Example: Create new risk component
cat > frontend/src/components/risk/risk-trend-indicator.tsx << 'EOF'
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskTrendProps {
  direction: "up" | "down" | "stable";
  value: number;
  interpretation: "good" | "bad" | "neutral";
}

export function RiskTrend({ direction, value, interpretation }: RiskTrendProps) {
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const color = interpretation === "good" ? "text-green-600" : interpretation === "bad" ? "text-red-600" : "text-muted-foreground";
  
  return (
    <div className="flex items-center gap-1">
      <Icon className={cn("h-4 w-4", color)} />
      <span className={cn("text-xs font-medium", color)}>
        {Math.abs(value).toFixed(1)}%
      </span>
      <span className="text-xs text-muted-foreground">
        ({interpretation})
      </span>
    </div>
  );
}
EOF
```

### Test Component Isolation

```bash
# Create Storybook-like test file
cat > frontend/src/app/test-components/page.tsx << 'EOF'
import { RiskBadge } from "@/components/risk/risk-badge";
import { ConfidenceMeter } from "@/components/risk/confidence-meter";

export default function TestComponents() {
  return (
    <div className="container py-8 space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Risk Badges</h2>
        <div className="flex gap-4">
          <RiskBadge risk="critical" />
          <RiskBadge risk="high" />
          <RiskBadge risk="medium" />
          <RiskBadge risk="low" />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-4">Confidence Meters</h2>
        <div className="space-y-4 max-w-md">
          <ConfidenceMeter value={0.95} variant="block" />
          <ConfidenceMeter value={0.75} variant="block" />
          <ConfidenceMeter value={0.45} variant="block" />
        </div>
      </section>
    </div>
  );
}
EOF
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Inconsistent Risk Colors
**Problem**: Different components use different shades of red for "critical"
**Solution**: Always import from `/lib/risk.ts`, never hardcode colors

```tsx
// ❌ BAD
<Badge className="bg-red-500 text-white">Critical</Badge>

// ✅ GOOD
import { riskBandClasses } from "@/lib/risk";
<Badge className={riskBandClasses("critical").badge}>Critical</Badge>
```

### Pitfall 2: Showing Everything by Default
**Problem**: Case detail page overwhelms with all detector data
**Solution**: Use Tabs + Collapsible for progressive disclosure

```tsx
// ❌ BAD
<div>
  {Object.entries(detectorBreakdown).map(([name, data]) => (
    <DetectorCard key={name} data={data} />
  ))}
</div>

// ✅ GOOD
<Tabs defaultValue="signals">
  <TabsContent value="signals">
    {topSignals.slice(0, 3).map(signal => <SignalCard />)}
  </TabsContent>
  <TabsContent value="forensics">
    {Object.entries(detectorBreakdown).map(...)}
  </TabsContent>
</Tabs>
```

### Pitfall 3: Charts Without Context
**Problem**: Bar chart shows absolute detection counts
**Solution**: Always show comparison to baseline

```tsx
// ❌ BAD
<BarChart data={detectorStats.map(d => ({ name: d.name, value: d.count }))} />

// ✅ GOOD
<ComparisonBarChart 
  data={detectorStats.map(d => ({
    name: d.name,
    current: d.count,
    baseline: d.baseline_30d,
    variance: ((d.count - d.baseline_30d) / d.baseline_30d) * 100
  }))}
  metric="detection rate"
/>
```

---

## Next Steps

1. **Bookmark this guide** for reference during implementation
2. **Start with Phase 1**: Create shared risk components
3. **Use test-components page** to verify visual consistency
4. **Review patterns** before each new component
5. **Iterate**: These patterns will evolve based on user feedback

Remember: **Clarity > Comprehensiveness**. When in doubt, hide it in a Collapsible.
