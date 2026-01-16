# FraudEx Visual Wireframes & Layout Specifications
## Screen-by-Screen Layout Guide

---

## Navigation & Shell

### Top Navigation (Persistent)
```
┌────────────────────────────────────────────────────────────────┐
│ [FraudEx] Command Center | Investigation | Patterns | Health   │
│                                                  [User] [Theme] │
└────────────────────────────────────────────────────────────────┘
```

**Components**: 
- Logo + Nav Links (Tabs-like visual)
- User dropdown + Theme toggle (right-aligned)

**Behavior**:
- Active page highlighted with underline
- Sticky at top during scroll

---

## 1. Command Center (Dashboard Replacement)

### Viewport Distribution
```
┌─────────────────────────────────────────────────────────────────┐
│ Command Center                                          [Refresh]│
│ What needs attention right now                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ⚠️ CRITICAL ALERT: 3 High-Risk Cases Require Review            │
│ ├─ Case 18f8db05 • 3 signals, 94% confidence • 2 hours        │
│ │  [Review Case →]                                             │
│ ├─ Case a4c29d71 • Benford anomaly • 4 hours                  │
│ │  [Review Case →]                                             │
│ └─ Case 7e3f8a12 • Velocity spike • 6 hours                   │
│    [Review Case →]                                             │
│                                                                  │
│ ❌ ANALYSIS FAILURES: 2 cases failed                           │
│    [Retry All]                                                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤ 40% viewport
│ Review Queue                                                     │
│ Ranked by risk × confidence × recency                          │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Case ID    Risk     Key Signal        Waiting   Action   │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ 18f8db05  ■ CRIT   Benford+Velocity   2h      [Review →] │  │
│ │ a4c29d71  ■ HIGH   Timing pattern     4h      [Review →] │  │
│ │ 7e3f8a12  ■ HIGH   Multiple signals   6h      [Review →] │  │
│ │ b9d41e36  ■ MED    Weekend activity   8h      [Review →] │  │
│ │ c2f58b90  ■ MED    Outlier amounts   12h      [Review →] │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤ 30% viewport
│ Contextual Metrics                                              │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│ │ Avg Review   │ Detection    │ Active Cases │ Queue Depth  │ │
│ │ Time         │ Accuracy     │              │              │ │
│ │ 4.2h         │ 87%          │ 12           │ 8            │ │
│ │ ↓ 12% better │ → stable     │              │              │ │
│ └──────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤ 20% viewport
│ ▼ Create New Case                                              │
│    [Collapsed accordion - click to expand upload form]          │
│                                                                  │
│ ▼ Browse All Cases                                             │
│    [Collapsed accordion - click to show full table]             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘ 10% viewport
```

### Color Coding
- Critical Alert: Red left border (`border-l-red-500`)
- Risk badges: Critical=Red, High=Orange, Medium=Amber, Low=Green
- Status: Processing=Blue, Failed=Red, Analyzed=Green

---

## 2. Investigation Detail (Case Detail Replacement)

### Sticky Header (Always Visible)
```
┌─────────────────────────────────────────────────────────────────┐
│ Case 18f8db05                              [Export] [Escalate] │
│ ■ CRITICAL    Confidence: 94%    ● Analyzed                   │
│ Immediate review recommended. Multiple high-confidence          │
│ indicators detected.                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Tabs Content Area (Scrollable)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Key Signals (3)] [Narrative] [Forensics]                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Key Signals Tab (Default)                                       │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ① Benford's Law Analysis                        65% impact  ││
│ │                                                              ││
│ │ Significant deviation from expected digit distribution      ││
│ │ detected in payment amounts. MAD: 0.0234 exceeds threshold. ││
│ │                                                              ││
│ │ ▶ View technical details                                    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ② Velocity & Timing                             22% impact  ││
│ │                                                              ││
│ │ Unusual concentration of activity during weekend hours.     ││
│ │ Weekend ratio: 45% vs. expected 20%.                        ││
│ │                                                              ││
│ │ ▶ View technical details                                    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ③ Outlier Detection                             13% impact  ││
│ │                                                              ││
│ │ 3 payment amounts exceed 2 standard deviations from mean.   ││
│ │                                                              ││
│ │ ▶ View technical details                                    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Recommended Actions                                             │
│                                                                  │
│ ① Verify payment dates against official business calendar      │
│ ② Cross-reference amounts with contract specifications         │
│ ③ Interview vendor regarding weekend processing explanation    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Narrative Tab
```
┌─────────────────────────────────────────────────────────────────┐
│ [Key Signals] [Narrative] [Forensics]                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Analysis Summary                                                │
│                                                                  │
│ This case exhibits strong indicators of potential fraud across  │
│ multiple detection dimensions. The primary concern is the       │
│ statistical anomaly in payment amount distribution, which       │
│ deviates significantly from Benford's Law expectations.         │
│                                                                  │
│ Additionally, the concentration of transactions during weekend  │
│ hours (45% vs. typical 20%) raises questions about the         │
│ legitimacy of these activities, as government procurement       │
│ typically follows weekday business hours.                       │
│                                                                  │
│ The combination of these factors, along with several outlier    │
│ payments, creates a high-confidence assessment warranting       │
│ immediate review and potential escalation to investigative      │
│ authorities.                                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Forensics Tab (Technical Deep Dive)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Key Signals] [Narrative] [Forensics]                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ All Detector Outputs                                            │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Benford's Law                                               ││
│ │ Score: 75.3  Weight: 0.35  Confidence: 0.89                ││
│ │                                                              ││
│ │ Indicators:                                                  ││
│ │   Sample Size: 247                                          ││
│ │   MAD: 0.0234                                               ││
│ │   Chi-Squared: 18.42                                        ││
│ │   First Digit Deviation: High on 5,6                        ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Velocity Analysis                                           ││
│ │ Score: 62.1  Weight: 0.25  Confidence: 0.78                ││
│ │                                                              ││
│ │ Indicators:                                                  ││
│ │   Total Dates: 45                                           ││
│ │   Weekend Ratio: 0.45                                       ││
│ │   Patterns: [weekend_spike, after_hours]                    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│ [... all other detectors ...]                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Pattern Intelligence (Analytics Replacement)

### Hero Section - Change Detection
```
┌─────────────────────────────────────────────────────────────────┐
│ Pattern Intelligence                                 [Refresh]  │
│ What's changing in our risk landscape                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ⚠️ Pattern Alert: Weekend Activity Spike           +247% ▲     │
│ Velocity detector triggered 3× more in last 7 days            │
│                                                                  │
│ Unusual concentration of bid activity during weekends detected  │
│ across 12 cases. Recommend immediate review of procurement     │
│ calendar controls.                                              │
│                                                                  │
│ [View Affected Cases] [Create Investigation]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Comparative Trends
```
┌─────────────────────────────────────────────────────────────────┐
│ Risk Trajectory                    │ Detector Effectiveness     │
│ 7-day moving average               │ vs. 30-day baseline        │
│                                    │                            │
│ ┌────────────────────────────┐    │ ┌────────────────────────┐│
│ │    ╱╲    ╱╲                │    │ │ Benford    █████░░░░   ││
│ │   ╱  ╲  ╱  ╲     ╱╲        │    │ │ Velocity   ████████░░  ││
│ │  ╱    ╲╱    ╲   ╱  ╲       │    │ │ Outlier    ███░░░░░░░░ ││
│ │ ╱            ╲ ╱    ╲      │    │ │ Timing     ██████░░░░░ ││
│ │╱              ╲       ╲    │    │ └────────────────────────┘│
│ │                        ╲   │    │                            │
│ │ Mon  Wed  Fri  Sun  Tue│    │ │ Green: above baseline      │
│ └────────────────────────────┘    │ Red: below baseline        │
│                                    │                            │
│ Average risk increasing 8%         │ Benford sensitivity        │
│ week-over-week. Primary driver:   │ driving changes            │
│ Benford detector sensitivity.      │                            │
└─────────────────────────────────────────────────────────────────┘
```

### Deep Dive Tabs
```
┌─────────────────────────────────────────────────────────────────┐
│ [Emerging Patterns] [Detector Health] [Cohort Analysis]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Emerging Patterns Tab                                           │
│                                                                  │
│ Signal Co-Occurrence Analysis                                   │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Benford + Velocity               │ 18 cases  │ 73% risk    ││
│ │ Benford + Outlier                │ 12 cases  │ 81% risk    ││
│ │ Velocity + Timing                │  9 cases  │ 62% risk    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│ Clustering Results                                              │
│ • Cluster 1: Weekend heavy activity (12 cases)                 │
│ • Cluster 2: High-value outliers (8 cases)                     │
│ • Cluster 3: Rapid velocity spikes (6 cases)                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. System Health (New Page)

### Trust Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ System Health                                                   │
│ Can I trust these results?                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────┬──────────────┬──────────────────────────────┐ │
│ │ Analysis     │ Detection    │ Confidence Calibration       │ │
│ │ Reliability  │ Coverage     │                              │ │
│ │              │              │                              │ │
│ │   96.2%      │   4/5        │   Good                       │ │
│ │ ████████████▒│              │                              │ │
│ │              │              │                              │ │
│ │ Cases        │ Active       │ Predictions align with       │ │
│ │ completed    │ detectors    │ manual review outcomes       │ │
│ │ without      │ (Velocity    │                              │ │
│ │ errors (7d)  │ temporarily  │                              │ │
│ │              │ disabled)    │                              │ │
│ └──────────────┴──────────────┴──────────────────────────────┘ │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Analysis Failures (Last 7 Days)                                │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Error Type        │ Frequency │ Typical Cause   │ Status   ││
│ ├─────────────────────────────────────────────────────────────┤│
│ │ Timeout           │    3      │ Large files     │ Resolved ││
│ │ Parsing Error     │    2      │ Malformed CSV   │ Resolved ││
│ │ Memory Exceeded   │    1      │ Complex doc     │ Resolved ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ ▼ View Full Audit Log                                          │
│    [Collapsed - click to expand detailed logs]                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

### Desktop (>1024px)
- Command Center: 3-column metrics grid
- Investigation: Tabs side-by-side with content
- Patterns: 2-column chart layout

### Tablet (768px - 1024px)
- Command Center: 2-column metrics grid
- Investigation: Tabs stack, full-width content
- Patterns: Single column charts

### Mobile (<768px)
- Command Center: Single column, priority queue collapses to cards
- Investigation: Sticky header condenses to single line
- Patterns: Single column, charts adapt to small width

---

## Animation & Transitions

### Priority Queue
- **New high-risk case**: Subtle pulse animation for 3 seconds
- **Status change**: Smooth fade + position shift

```css
@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3); }
}

.new-high-risk {
  animation: pulse-red 2s ease-in-out 3;
}
```

### Loading States
- **Skeleton**: Shimmer effect
- **Table rows**: Fade in as loaded

### Interactions
- **Hover**: Subtle background change (`hover:bg-muted/50`)
- **Click**: Brief scale down (`active:scale-[0.98]`)
- **Expand**: Smooth height transition (`transition-all duration-300`)

---

## Accessibility Specifications

### Keyboard Navigation
- Tab order: Critical alerts → Queue → Actions → Secondary sections
- Enter/Space: Activate buttons and links
- Escape: Close dialogs and collapsibles

### Screen Reader
```tsx
// Alert banner
<Alert aria-live="assertive" role="alert">
  <AlertTitle>Critical Cases Require Review</AlertTitle>
</Alert>

// Risk badge
<Badge aria-label={`Risk level: ${risk}`}>
  {risk}
</Badge>

// Queue table
<Table aria-label="Priority review queue">
  <caption className="sr-only">
    Cases sorted by composite priority score
  </caption>
</Table>
```

### Color Contrast
- All text: Minimum 4.5:1 ratio
- Critical badges: Red on light background meets WCAG AA
- Links: Underline on focus

---

## Print Styles (Case Reports)

### Investigation Detail Page
```css
@media print {
  /* Hide navigation and actions */
  nav, .actions { display: none; }
  
  /* Expand all collapsibles */
  [data-state="closed"] { display: block !important; }
  
  /* Force break before each signal */
  .signal-card { break-before: page; }
  
  /* Add header/footer */
  @page {
    margin: 2cm;
    @top-center {
      content: "FraudEx Case Report: " attr(data-case-id);
    }
    @bottom-right {
      content: "Page " counter(page);
    }
  }
}
```

---

## Implementation Notes

### Z-Index Hierarchy
```tsx
// layout.tsx
const zIndices = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
};

// Sticky verdict header
<div className="sticky top-0 z-[20]">
```

### Grid Breakpoints (Tailwind)
```tsx
// tailwind.config.ts
theme: {
  screens: {
    'sm': '640px',  // Mobile landscape
    'md': '768px',  // Tablet
    'lg': '1024px', // Desktop
    'xl': '1280px', // Wide desktop
    '2xl': '1536px' // Ultra-wide
  }
}
```

### Dark Mode Considerations
```tsx
// All cards should adapt
<Card className="border bg-card text-card-foreground">

// Risk badges need dark variants
const darkClasses = {
  critical: "dark:bg-red-900/30 dark:text-red-300",
  // ... etc
}
```

---

## Next Steps

1. **Print this wireframe guide** for reference during UI work
2. **Use ASCII layouts** as starting point for each page
3. **Test responsive behavior** at each breakpoint
4. **Validate accessibility** with screen reader
5. **Get stakeholder feedback** on layout before styling

Remember: **Layout communicates hierarchy**. Position and size should reflect importance.
