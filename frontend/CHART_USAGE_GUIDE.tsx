// Chart Component Usage Guide

// 1. RISK DISTRIBUTION BAR CHART
// Best for: Comparing risk categories
import { RiskDistributionBarChart } from "@/components/app/analytics/risk-distribution-bar-chart";

<RiskDistributionBarChart
  distribution={{ low: 10, medium: 20, high: 15, critical: 5 }}
  totalAnalyzed={50}
  averageScore={42.5}
  title="Risk Distribution"
  description="Cases organized by severity"
/>

// 2. DETECTOR PERFORMANCE BAR CHART
// Best for: Ranking detectors by effectiveness
import { DetectorPerformanceBarChart } from "@/components/app/analytics/detector-performance-bar-chart";

<DetectorPerformanceBarChart
  stats={detectorStats}
  title="Detection Effectiveness"
  description="Ranked by detection rate"
/>

// 3. TREND STACKED AREA CHART
// Best for: Volume trends with composition
import { TrendStackedAreaChart } from "@/components/app/analytics/trend-stacked-area-chart";

<TrendStackedAreaChart
  trends={trends30d}
  period="30d"
  title="Risk Volume Trends"
/>

// 4. RISK RADAR CHART (Enhanced)
// Best for: Multi-dimensional comparison (5-7 metrics)
import { RiskRadarChart } from "@/components/app/charts/risk-radar-chart";

<RiskRadarChart
  detectorStats={analytics.detector_stats}
  title="Detector Performance"
  description="Real-time effectiveness"
/>

// 5. RISK TREND LINE CHART
// Best for: Precise metric tracking over time
import { RiskTrendLineChart } from "@/components/app/charts/risk-trend-line-chart";

<RiskTrendLineChart
  trends={trends7d}
  period="7d"
  title="Risk Trends - 7 Days"
/>

// 6. METRIC CARD WITH SPARKLINE
// Best for: KPIs with mini trend visualization
import { MetricCardWithSparkline } from "@/components/app/analytics/metric-card-with-sparkline";
import { FileText } from "lucide-react";

<MetricCardWithSparkline
  title="Total Cases"
  value={totalCases}
  icon={FileText}
  data={trends7d.map(t => t.count)}
  trend="up"
  change={12}
  subtitle="Last 7 days"
/>

// LAYOUT PATTERNS

// Pattern 1: Dashboard Metrics Grid
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <MetricCardWithSparkline {...metric1} />
  <MetricCardWithSparkline {...metric2} />
  <MetricCardWithSparkline {...metric3} />
  <MetricCardWithSparkline {...metric4} />
</div>

// Pattern 2: Two Column Charts
<div className="grid gap-6 lg:grid-cols-2">
  <RiskDistributionBarChart {...} />
  <RiskRadarChart {...} />
</div>

// Pattern 3: Full Width + Split
<div className="space-y-6">
  <TrendStackedAreaChart {...} /> {/* Full width */}
  <div className="grid gap-6 lg:grid-cols-2">
    <Chart1 {...} />
    <Chart2 {...} />
  </div>
</div>

// CHART SELECTION GUIDE

// Use BAR CHART when:
// - Comparing categories
// - Labels are long
// - Exact values matter

// Use RADAR CHART when:
// - Comparing 5-7 dimensions
// - Pattern recognition important
// - Relative comparison, not absolute values

// Use STACKED AREA when:
// - Showing composition over time
// - Total volume matters
// - Visual continuity important

// Use LINE CHART when:
// - Precise values matter
// - Comparing multiple metrics
// - Trend direction important

// Use SPARKLINES when:
// - Space is limited
// - Quick trend indication needed
// - Supporting a larger metric
