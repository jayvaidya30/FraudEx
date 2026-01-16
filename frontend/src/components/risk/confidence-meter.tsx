import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfidenceMeterProps {
  confidence: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getConfidenceLevel(confidence: number): {
  label: string;
  color: string;
  description: string;
} {
  if (confidence >= 80) {
    return {
      label: "High Confidence",
      color: "bg-foreground",
      description: "Strong evidence supports this assessment",
    };
  }
  if (confidence >= 60) {
    return {
      label: "Medium Confidence",
      color: "bg-foreground",
      description: "Moderate evidence supports this assessment",
    };
  }
  if (confidence >= 40) {
    return {
      label: "Low Confidence",
      color: "bg-muted-foreground",
      description: "Limited evidence available",
    };
  }
  return {
    label: "Very Low Confidence",
    color: "bg-muted-foreground",
    description: "Insufficient evidence for reliable assessment",
  };
}

const sizeConfig = {
  sm: {
    height: "h-1.5",
    text: "text-xs",
  },
  md: {
    height: "h-2",
    text: "text-sm",
  },
  lg: {
    height: "h-3",
    text: "text-base",
  },
};

export function ConfidenceMeter({
  confidence,
  label,
  showPercentage = true,
  size = "md",
  className,
}: ConfidenceMeterProps) {
  const level = getConfidenceLevel(confidence);
  const config = sizeConfig[size];

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <span className={cn("text-muted-foreground font-medium", config.text)}>
              {label}
            </span>
          )}
          {showPercentage && (
            <div className="flex items-center gap-1">
              <span className={cn("font-semibold", config.text)}>
                {confidence}%
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{level.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {level.description}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}
      <div className={cn("relative w-full rounded-full bg-muted", config.height)}>
        <div
          className={cn(
            "absolute left-0 top-0 rounded-full transition-all duration-300",
            config.height,
            level.color
          )}
          style={{ width: `${confidence}%`, opacity: confidence / 100 }}
        />
      </div>
    </div>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const level = getConfidenceLevel(confidence);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="inline-flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1 text-xs font-medium"
            style={{ opacity: confidence / 100 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            {confidence}%
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{level.label}</p>
          <p className="text-xs text-muted-foreground">{level.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
