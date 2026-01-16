import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Error", message, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/10">
      <CardContent className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-destructive">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
