import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Coins, Trophy, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchMarkets } from "@/lib/api";
import { formatTimeRemaining } from "@/lib/format";
import type { Category } from "@/lib/types";

const categoryIcon: Record<Category, typeof Coins> = {
  crypto: Coins,
  sports: Trophy,
  culture: Music2,
};

const filters: Array<"all" | Category> = ["all", "crypto", "sports", "culture"];

export function LoggerPage() {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const navigate = useNavigate();

  const markets = useQuery({ queryKey: ["markets"], queryFn: fetchMarkets });

  const visible = useMemo(() => {
    const all = markets.data ?? [];
    return filter === "all" ? all : all.filter((m) => m.category === filter);
  }, [markets.data, filter]);

  // Picking an outcome here only states your tentative lean — it always starts a
  // sparring session with your agent before anything locks. See guardrail §0.3:
  // the agent must take its own position, never just mirror you.
  function handlePick(marketId: string, outcome: string) {
    navigate(`/app?market=${marketId}&outcome=${encodeURIComponent(outcome)}`);
  }

  return (
    <div className="p-7">
      <div className="mb-[22px] flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md border px-3 py-1.5 font-mono text-xs capitalize cursor-pointer transition-colors duration-150",
              filter === f ? "border-brand-border bg-brand-bg text-brand-2" : "border-line-4 text-ink-5 hover:text-ink-2",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {markets.isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[164px] animate-pulse rounded-xl border border-line-3 bg-panel" />
          ))}
        </div>
      )}

      {markets.isError && (
        <div className="rounded-lg border border-danger-border bg-panel-2 px-4 py-3 text-sm text-danger">
          Markets are unavailable right now.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((market) => {
          const Icon = categoryIcon[market.category];
          return (
            <div key={market.id} className="rounded-xl border border-line-3 bg-panel p-5 transition-colors duration-200 hover:border-line-7">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-[11px] text-brand-2">
                  <Icon className="size-3.5" aria-hidden="true" />
                  {market.category}
                </span>
                <span className="flex items-center gap-2">
                  {market.isLive && (
                    <span className="flex items-center gap-1 rounded-full border border-success-border bg-success-bg px-2 py-0.5 font-mono text-[10px] text-success">
                      <span className="size-1.5 rounded-full bg-success" /> LIVE
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-ink-7">{formatTimeRemaining(market.closesAt)}</span>
                </span>
              </div>
              <div className="mb-2 min-h-[44px] text-base leading-[1.35] text-ink-2">{market.question}</div>
              <div className="mb-5 min-h-[15px] font-mono text-[11px] text-ink-6">{market.liveNote}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePick(market.id, "Yes")}
                  className="flex-1 cursor-pointer rounded-md bg-success py-2 text-[13px] font-medium text-app-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handlePick(market.id, "No")}
                  className="flex-1 cursor-pointer rounded-md bg-danger py-2 text-[13px] font-medium text-app-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
                >
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
