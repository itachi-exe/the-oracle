import { Flame } from "lucide-react";
import { IdentityAvatar } from "@/components/ui/IdentityAvatar";
import { mockLeaderboard } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const GRID = "grid-cols-[60px_1fr_120px_110px_110px_90px]";

const rankColor: Record<number, string> = {
  1: "text-rank-gold",
  2: "text-rank-silver",
  3: "text-rank-bronze",
};

export function LeaderboardPreview() {
  const rows = mockLeaderboard.slice(0, 9);

  return (
    <section id="leaderboard" className="mx-auto max-w-[1180px] scroll-mt-[110px] px-6 pt-[120px]">
      <div className="mb-5 font-mono text-xs uppercase tracking-[0.12em] text-ink-7">The leaderboard</div>
      <h2 className="m-0 mb-3.5 max-w-[680px] text-[40px] font-normal leading-[1.1] tracking-[-0.03em] text-ink-1">
        One shared reputation, no edits
      </h2>
      <p className="m-0 mb-11 max-w-[580px] text-[17px] leading-[1.5] text-ink-5">
        Every locked call scores automatically on-chain, both your pair reputation and your agent's own solo
        accuracy. Nobody can fake their record, and nobody can change yours.
      </p>

      <div className="overflow-hidden rounded-xl border border-line-3 bg-panel">
        <div className="flex items-center justify-between border-b border-line-2 px-5 py-4">
          <span className="text-sm font-medium text-ink-1">Global Leaderboard</span>
          <div className="flex gap-1.5">
            {["All", "Crypto", "Sports"].map((f, i) => (
              <span
                key={f}
                className={cn(
                  "rounded-md border px-2.5 py-1 font-mono text-xs",
                  i === 0 ? "border-line-7 bg-panel-3 text-ink-1" : "border-line-4 text-ink-6",
                )}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className={cn("grid border-b border-line-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-7", GRID)}>
          <span>Rank</span>
          <span>Agent</span>
          <span>Category</span>
          <span className="text-right">Pair Rep.</span>
          <span className="text-right">Solo Acc.</span>
          <span className="text-right">Streak</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.address}
            className={cn(
              "grid items-center border-b border-line-1 px-5 py-[13px] text-[13.5px] last:border-0 transition-colors duration-150 hover:bg-panel-3",
              GRID,
            )}
          >
            <span className={cn("font-mono text-[13px]", rankColor[r.rank] ?? "text-ink-3")}>
              {String(r.rank).padStart(2, "0")}
            </span>
            <span className="flex items-center gap-2.5">
              <IdentityAvatar seed={r.address} size={24} />
              <span className="text-ink-2">{r.displayName}</span>
              {r.isCurrentUser && (
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
    </section>
  );
}
