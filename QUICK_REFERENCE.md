# FraudEx Refactor Quick Reference Card
## Keep This Open During Implementation

---

## 🎯 The Golden Rules

```
1. EVERY SCREEN ANSWERS ONE QUESTION
   ❌ "Here's data" 
   ✅ "What needs attention?"

2. PRIORITIZE RUTHLESSLY
   ❌ Equal visual weight
   ✅ Critical → Secondary → Tertiary

3. INTERPRET, DON'T DUMP
   ❌ "Score: 78.3 from weighted..."
   ✅ "High Risk: Review Now"

4. DISCLOSE PROGRESSIVELY
   ❌ Show everything by default
   ✅ Top 3-5 facts, rest on demand

5. CLARITY = TRUST
   ❌ Complexity = credibility
   ✅ Simple = confident
```

---

## 📋 Component Decision Tree

```
Need to show...                Use...                   Why?
─────────────────────────────────────────────────────────────────
Critical action required      Alert (red border)       Interrupt
Risk level                    RiskBadge                Color codes
Confidence score              ConfidenceMeter          0-100 visual
Technical details             Collapsible              Hide by default
Different perspectives        Tabs                     Separate lenses
Infrequent action             Accordion                Reduce clutter
Scannable list                Table                    Row comparison
Trend direction               Sparkline + text         Change, not state
Definition/help               Tooltip                  Just-in-time
Loading                       Skeleton                 Match structure
```

---

## 🎨 Visual Consistency Checklist

**Before Committing Any Component:**

```
Risk Encoding
□ Critical = Red (bg-red-50, text-red-800)
□ High = Orange (bg-orange-50, text-orange-800)
□ Medium = Amber (bg-amber-50, text-amber-800)
□ Low = Green (bg-emerald-50, text-emerald-800)
□ Using riskBandClasses() from /lib/risk.ts?

Confidence Encoding
□ 90-100% = opacity-100 (very high)
□ 70-90% = opacity-80 (high)
□ 50-70% = opacity-60 (moderate)
□ <50% = opacity-40 (low)

Status Encoding
□ analyzed = "success" variant
□ processing = "default" variant
□ failed = "destructive" variant
□ uploaded = "secondary" variant

Typography
□ Verdict = text-2xl font-semibold
□ Section = text-lg font-semibold
□ Metric = text-3xl font-bold
□ Label = text-sm font-medium text-muted-foreground
□ Body = text-sm
□ Detail = text-xs text-muted-foreground
```

---

## 🔍 Progressive Disclosure Pattern

```tsx
// ✅ CORRECT PATTERN
<Card>
  {/* LAYER 1: Always visible */}
  <CardHeader>
    <CardTitle>Benford Analysis</CardTitle>
    <Badge>65% impact</Badge>
  </CardHeader>
  
  <CardContent>
    {/* LAYER 2: Interpretation */}
    <p>Statistical anomaly detected.</p>
    
    {/* LAYER 3: On demand */}
    <Collapsible>
      <CollapsibleTrigger>View technical details</CollapsibleTrigger>
      <CollapsibleContent>
        {/* MAD, Chi-squared, etc. */}
      </CollapsibleContent>
    </Collapsible>
  </CardContent>
</Card>

// ❌ WRONG PATTERN
<Card>
  {/* All details shown by default */}
  <div>Benford: Score 75.3, Weight 0.35, MAD 0.0234...</div>
</Card>
```

---

## 📐 Layout Priorities (Top to Bottom)

```
Command Center Page:
├── 1. Critical Alerts (40% viewport)
│   └── Red Alert component, action buttons
├── 2. Priority Queue (30% viewport)
│   └── Table with badges, quick actions
├── 3. Contextual Metrics (20% viewport)
│   └── 4-column grid of StatCards
└── 4. Secondary Actions (10% viewport)
    └── Collapsed accordions

Investigation Page:
├── 1. Sticky Verdict Header (fixed)
│   └── Risk + Confidence + Actions
├── 2. Key Signals Tab (default)
│   └── Top 3-5 signals only
├── 3. Narrative Tab
│   └── Plain language summary
└── 4. Forensics Tab
    └── All technical details

Pattern Page:
├── 1. Pattern Alert (hero)
│   └── Anomaly + Recommendations
├── 2. Comparative Charts
│   └── Change vs. baseline
└── 3. Deep Dive Tabs
    └── Patterns / Detectors / Cohorts

System Health Page:
├── 1. Trust Indicators (top)
│   └── Reliability, Coverage, Calibration
├── 2. Error Patterns (middle)
│   └── Structured table
└── 3. Audit Trail (collapsed)
    └── Detailed logs
```

---

## 🚫 Anti-Patterns to Avoid

```
❌ THE "COMPREHENSIVE DASHBOARD"
   Showing everything because "users might need it"
   → Use progressive disclosure

❌ THE "TECHNICAL CREDIBILITY TRAP"
   Complex formulas to appear sophisticated
   → Interpretation first, calculation on demand

❌ THE "FEATURE PARITY MISTAKE"
   Every metric gets equal visual weight
   → Strict hierarchy by action priority

❌ THE "REAL-TIME EVERYTHING"
   Auto-refresh all data constantly
   → Refresh critical items only

❌ THE "DRILL-DOWN ASSUMPTION"
   Users want to explore every detail
   → Most need summary + 3-5 key facts

❌ THE "RAW DATA EXPOSURE"
   JSON blobs visible in UI
   → Never show raw technical objects

❌ THE "EQUAL TREATMENT FALLACY"
   All cases shown with same prominence
   → Sort by risk × confidence × age
```

---

## 🛠️ Quick Code Snippets

### Risk Badge (Copy-Paste)
```tsx
import { RiskBadge } from "@/components/risk/risk-badge";
import { riskBandFromScore } from "@/lib/risk";

<RiskBadge risk={riskBandFromScore(case.risk_score)} size="md" />
```

### Confidence Meter (Copy-Paste)
```tsx
import { ConfidenceMeter } from "@/components/risk/confidence-meter";

<ConfidenceMeter value={0.87} variant="inline" />
```

### Progressive Disclosure (Copy-Paste)
```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

<Collapsible>
  <CollapsibleTrigger className="text-xs text-muted-foreground">
    View technical details
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Hidden by default */}
  </CollapsibleContent>
</Collapsible>
```

### Sticky Header (Copy-Paste)
```tsx
<div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
  {/* Verdict content */}
</div>
```

### Comparison Chart Pattern (Copy-Paste)
```tsx
// Always show variance, not absolute
const data = detectors.map(d => ({
  name: d.name,
  current: d.score,
  baseline: d.baseline_30d,
  variance: ((d.score - d.baseline_30d) / d.baseline_30d) * 100
}));
```

---

## 📊 Before Committing: Ask These Questions

```
Information Hierarchy
□ Does this screen answer ONE dominant question clearly?
□ Is the most important information in the top 40% of viewport?
□ Are secondary details hidden or below the fold?

Progressive Disclosure
□ Default view shows ≤5 key items?
□ Technical details in Collapsible or separate tab?
□ Can user make decision without expanding anything?

Visual Consistency
□ Risk badge uses riskBandClasses()?
□ Confidence uses opacity encoding?
□ Status uses semantic badge variants?
□ Loading state uses Skeleton?

Accessibility
□ Keyboard navigation works (Tab, Enter, Escape)?
□ Screen reader labels present (aria-label)?
□ Color contrast meets WCAG AA (4.5:1)?
□ Focus indicators visible?

Performance
□ LCP < 2.5s?
□ No layout shift on load?
□ Images/charts lazy loaded?
```

---

## ⚡ Speed Dial (Quick Commands)

```bash
# Start dev server
npm run dev

# Check for errors
npm run lint

# Test component in isolation
# Visit: http://localhost:3000/test-components

# Run type check
npm run type-check

# Format code
npm run format

# Build for production
npm run build
```

---

## 🎯 Decision-Making Framework

```
When stuck, ask:
┌────────────────────────────────────────────┐
│ "Does this help the user make a decision   │
│  faster and with more confidence?"         │
└────────────────────────────────────────────┘
         ↓                    ↓
      YES                    NO
       ↓                      ↓
   Keep it             Hide it or remove it


When designing layout, ask:
┌────────────────────────────────────────────┐
│ "What is the ONE question this screen     │
│  must answer?"                             │
└────────────────────────────────────────────┘
         ↓
  Design hierarchy around that answer


When choosing component, ask:
┌────────────────────────────────────────────┐
│ "Should this be visible by default?"      │
└────────────────────────────────────────────┘
     ↓                          ↓
 Critical for               Supporting
  decision                   evidence
     ↓                          ↓
  Card/Badge              Collapsible/Tab
```

---

## 📞 Emergency Contacts

```
Question about...              Check...
─────────────────────────────────────────────
Strategy/Why                   IMPLEMENTATION_PLAN.md
Code patterns                  COMPONENT_PATTERNS.md
Layout/Visual                  WIREFRAMES.md
Quick overview                 REFACTOR_SUMMARY.md
This card                      QUICK_REFERENCE.md

Still stuck?
1. Check existing components in /components/
2. Review similar patterns in COMPONENT_PATTERNS.md
3. Open issue with tag `refactor-question`
```

---

## 🎓 Remember

```
┌─────────────────────────────────────────────────┐
│  "Every screen must answer one dominant         │
│   question. If it doesn't directly improve      │
│   understanding, prioritization, or trust—      │
│   redesign or remove it."                       │
│                                                  │
│  - FraudEx Design Philosophy                    │
└─────────────────────────────────────────────────┘
```

---

## ✅ End-of-Day Checklist

```
Before logging off:
□ All new components use shared risk/confidence encodings
□ No hardcoded badge colors
□ Progressive disclosure implemented where appropriate
□ Changes committed with descriptive message
□ No console errors
□ Tested in light + dark mode
□ Quick keyboard nav test passed

Weekly:
□ Consistency audit (risk colors, spacing)
□ Accessibility spot check
□ Performance measurement
□ Demo to stakeholder

Phase completion:
□ All checklist items in COMPONENT_PATTERNS.md passed
□ User testing feedback collected
□ Metrics baseline recorded
```

---

**Print this card and keep it visible during implementation!**

Last updated: Implementation start
Version: 1.0
