import { Coins, Trophy, Music2 } from "lucide-react";
import type { Category } from "@/lib/types";

const categoryIcon: Record<Category, typeof Coins> = { crypto: Coins, sports: Trophy, culture: Music2 };

const rowA: Array<{ q: string; cat: Category }> = [
  { q: "BTC closes above $100k Friday", cat: "crypto" },
  { q: "Lakers beat the Celtics tonight", cat: "sports" },
  { q: "Sequel tops the box office", cat: "culture" },
  { q: "ETH flips $4k this month", cat: "crypto" },
  { q: "United wins the derby", cat: "sports" },
  { q: "Album debuts at #1", cat: "culture" },
];
const rowB: Array<{ q: string; cat: Category }> = [
  { q: "Chiefs cover the spread", cat: "sports" },
  { q: "SOL outperforms ETH in Q3", cat: "crypto" },
  { q: "Underdog wins the final", cat: "sports" },
  { q: "Show renewed for season 3", cat: "culture" },
  { q: "New ATH before year end", cat: "crypto" },
  { q: "Surprise headliner announced", cat: "culture" },
];
const rowC: Array<{ q: string; cat: Category }> = [
  { q: "Rookie wins MVP", cat: "sports" },
  { q: "Memecoin 10x this week", cat: "crypto" },
  { q: "Film sweeps the awards", cat: "culture" },
  { q: "Rate cut before Q4", cat: "crypto" },
  { q: "Home team makes the playoffs", cat: "sports" },
  { q: "Streaming show goes viral", cat: "culture" },
];

function Row({ items, duration, reverse }: { items: typeof rowA; duration: string; reverse?: boolean }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div
      className="flex w-max gap-3.5"
      style={{
        animation: `${reverse ? "or-marquee-r" : "or-marquee-l"} ${duration} linear infinite`,
      }}
    >
      {doubled.map((g, i) => {
        const Icon = categoryIcon[g.cat];
        return (
          <span
            key={`${g.q}-${i}`}
            className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-[9px] border border-line-3 bg-panel px-4.5 py-2.5 text-sm text-ink-3"
          >
            <Icon className="size-3.5 text-ink-6" aria-hidden="true" />
            {g.q}
            <span className="font-mono text-[11px] uppercase text-ink-7">{g.cat}</span>
          </span>
        );
      })}
    </div>
  );
}

export function MarketsMarquee() {
  return (
    <section className="overflow-hidden pt-[130px]">
      <style>{`
        @keyframes or-marquee-l { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes or-marquee-r { from { transform: translateX(-33.333%); } to { transform: translateX(0); } }
      `}</style>
      <div className="mx-auto max-w-[1180px] px-6 pb-11 text-center">
        <h2 className="m-0 mb-3.5 text-[36px] font-normal leading-[1.12] tracking-[-0.03em] text-ink-1">
          Call it across everything you follow
        </h2>
        <p className="mx-auto m-0 max-w-[520px] text-base leading-[1.5] text-ink-5">
          Sports, crypto, and culture · live markets, settled trustlessly.
        </p>
      </div>
      <div
        className="relative flex flex-col gap-3.5"
        style={{ maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)" }}
      >
        <Row items={rowA} duration="44s" />
        <Row items={rowB} duration="50s" reverse />
        <Row items={rowC} duration="47s" />
      </div>
      <div className="mt-10 text-center">
        <a
          href="#"
          className="inline-flex rounded-lg border border-line-7 px-[22px] py-2.5 text-sm text-ink-1 no-underline transition-colors duration-200 hover:border-[#4a4a4a]"
        >
          Browse all markets
        </a>
      </div>
    </section>
  );
}
