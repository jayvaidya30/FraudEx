import { Badge } from "@/components/ui/badge";

interface CaseStatusBadgeProps {
  status: string;
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const variant =
    status === "analyzed"
      ? "default"
      : status === "failed"
        ? "destructive"
        : status === "processing"
          ? "outline"
          : "secondary";
  
  return <Badge variant={variant}>{status}</Badge>;
}
