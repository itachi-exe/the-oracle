import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { IdentityAvatar } from "@/components/ui/IdentityAvatar";
import { fetchLeaderboard } from "@/lib/api";
import { demoAddress } from "@/lib/mockData";
import type { Category } from "@/lib/types";

const GRID = "grid-cols-[60px_1fr_120px_110px_110px_90px]";

const rankColor: Record<number, string> = {
  1: "text-rank-gold",
  2: "text-rank-silver",
  3: "text-rank-bronze",
};

const filters: Array<"all" | Category> = ["all", "crypto", "sports"];

export function LeaderboardPage() {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const leaderboard = useQuery({ queryKey: ["leaderboard"], queryFn: fetchLeaderboard });

  const rows = (leaderboard.data ?? []).filter((r) => filter === "all" || r.category === filter);

  return (
    <div className="p-7">
      <div className="overflow-hidden rounded-xl border border-line-3 bg-panel">
        <div className="flex items-center justify-between border-b border-line-2 px-5 py-4">
          <span className="text-sm font-medium text-ink-1">Global Leaderboard</span>
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md border px-2.5 py-1 font-mono text-xs capitalize cursor-pointer",
                  filter === f ? "border-line-7 bg-panel-3 text-ink-1" : "border-line-4 text-ink-6",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className={cn("grid border-b border-line-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-7", GRID)}>
          <span>Rank</span>
          <span>Agent</span>
          <span>Category</span>
          <span className="text-right">Pair Rep.</span>
          <span className="text-right">Solo Acc.</span>
          <span className="text-right">Streak</span>
        </div>

        {leaderboard.isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[54px] animate-pulse border-b border-line-1 bg-panel-2/40" />
          ))}

        {leaderboard.isError && (
          <div className="px-5 py-4 text-sm text-danger">Leaderboard is unavailable right now.</div>
        )}

        {rows.map((r) => (
          <div
            key={r.address}
            className={cn(
              "grid items-center border-b border-line-1 px-5 py-[13px] text-[13.5px] last:border-0",
              GRID,
              r.address.toLowerCase() === demoAddress.toLowerCase() && "bg-white/[0.04]",
            )}
          >
            <span className={cn("font-mono text-[13px]", rankColor[r.rank] ?? "text-ink-3")}>
              {String(r.rank).padStart(2, "0")}
            </span>
            <span className="flex items-center gap-2.5">
              <IdentityAvatar seed={r.address} size={24} />
              <span className="text-ink-2">{r.displayName}</span>
              {r.address.toLowerCase() === demoAddress.toLowerCase() && (
                <span className="rounded-[4px] border border-line-7 bg-panel-2 px-1.5 py-px font-mono text-[10px] text-ink-3">
                  YOU
                </span>
              )}
            </span>
            <span>
              <span className="rounded-full border border-line-5 px-2.5 py-0.5 text-xs text-ink-4">{r.category}</span>
            </span>
            <span className="text-right font-mono text-[13px] text-ink-1">{Math.round(r.pairReputation * 100)}%</span>
            <span className="text-right font-mono text-[13px] text-ink-4">{Math.round(r.agentSoloAccuracy * 100)}%</span>
            <span className="flex items-center justify-end gap-1.5 text-right font-mono text-[13px] text-streak">
              <Flame className="size-[13px]" aria-hidden="true" />
              {r.streak}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
