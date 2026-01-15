import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function RiskDisclaimer() {
  return (
    <Alert>
      <AlertTitle>Risk indicators, not accusations</AlertTitle>
      <AlertDescription>
        FraudEx flags potential anomalies and corruption risk indicators based on available
        data. It does not conclude wrongdoing. Always verify with human review.
      </AlertDescription>
    </Alert>
  );
}
