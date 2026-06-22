import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ConfidenceMeter({
  value,
  className,
}: {
  /** 0..1 */
  value: number;
  className?: string;
}) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const pct = Math.round(value * 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Progress
        value={animated * 100}
        className="h-1.5 flex-1"
        aria-label="Oracle confidence"
      />
      <span className="font-mono text-sm tabular-nums text-foreground">{pct}%</span>
    </div>
  );
}
