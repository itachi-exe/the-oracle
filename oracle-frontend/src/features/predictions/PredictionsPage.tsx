import { useQuery } from "@tanstack/react-query";
import { Check, X, Clock } from "lucide-react";
import { fetchPredictions } from "@/lib/api";
import { demoAddress } from "@/lib/mockData";
import type { PredictionStatus } from "@/lib/types";

const statusStyle: Record<PredictionStatus, { dot: string; icon: typeof Check; label: string; pill: string }> = {
  won: { dot: "bg-gradient-to-br from-[#3a7a52] to-[#2f6644]", icon: Check, label: "WON", pill: "text-success border-success-border" },
  lost: { dot: "bg-gradient-to-br from-[#7a3a3a] to-[#662f2f]", icon: X, label: "LOST", pill: "text-danger border-danger-border" },
  pending: { dot: "bg-panel-3", icon: Clock, label: "PENDING", pill: "text-ink-4 border-line-7" },
  resolving: { dot: "bg-panel-3", icon: Clock, label: "RESOLVING", pill: "text-ink-4 border-line-7" },
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

export function PredictionsPage() {
  const predictions = useQuery({
    queryKey: ["predictions", demoAddress],
    queryFn: () => fetchPredictions(demoAddress),
  });

  if (predictions.isLoading) {
    return (
      <div className="flex flex-col gap-2.5 p-7">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[70px] animate-pulse rounded-[11px] border border-line-3 bg-panel" />
        ))}
      </div>
    );
  }

  if (predictions.isError) {
    return (
      <div className="p-7">
        <div className="rounded-lg border border-danger-border bg-panel-2 px-4 py-3 text-sm text-danger">
          Predictions are unavailable right now.
        </div>
      </div>
    );
  }

  if (!predictions.data?.length) {
    return (
      <div className="p-7">
        <div className="rounded-[11px] border border-line-3 bg-panel px-5 py-8 text-center text-sm text-ink-6">
          No predictions locked yet. Spar with your agent or browse the Logger to make your first call.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 p-7">
      {predictions.data.map((p) => {
        const style = statusStyle[p.status];
        const Icon = style.icon;
        return (
          <div key={p.id} className="flex items-center gap-4 rounded-[11px] border border-line-3 bg-panel px-5 py-4">
            <span className={`flex size-[34px] shrink-0 items-center justify-center rounded-[9px] text-white ${style.dot}`}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] text-ink-2">{p.question}</div>
              <div className="font-mono text-xs text-ink-7">
                Locked: {p.outcome} · {formatDate(p.lockedAt)}
                {p.userOverrodeAgent && (
                  <span className="ml-2 text-ink-6">(agent had {p.agentOutcome})</span>
                )}
              </div>
            </div>
            {p.userOverrodeAgent && (
              <span
                className="rounded-full border border-line-7 bg-panel-2 px-2.5 py-0.5 font-mono text-[10.5px] text-ink-3"
                title="You overrode your agent's read on this call"
              >
                OVERRIDE
              </span>
            )}
            <span className={`rounded-full border px-3 py-1 font-mono text-[11.5px] ${style.pill}`}>{style.label}</span>
          </div>
        );
      })}
    </div>
  );
}
