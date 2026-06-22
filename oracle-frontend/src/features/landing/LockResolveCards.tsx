import { Check, X } from "lucide-react";

const resolves = [
  { Icon: Check, title: "Lakers to win = WON", sub: "Sports · settled on-chain", tag: "+1.8%", tone: "success" as const },
  { Icon: X, title: "ETH > $4k = LOST", sub: "Crypto · settled on-chain", tag: "−0.9%", tone: "danger" as const },
  { Icon: Check, title: "Album #1 debut = WON", sub: "Culture · settled on-chain", tag: "+1.2%", tone: "success" as const },
];

export function LockResolveCards() {
  return (
    <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-4 pt-[60px] sm:px-6 sm:pt-[90px] md:grid-cols-2">
      <div className="flex flex-col rounded-xl border border-line-3 bg-panel p-5 sm:p-[30px]">
        <h3 className="m-0 mb-2.5 text-[22px] font-normal tracking-[-0.02em] text-ink-1 sm:text-[26px]">Lock it on-chain</h3>
        <p className="m-0 mb-7 text-[15px] leading-[1.5] text-ink-5">
          Your address, the market, your call, and the block timestamp, recorded on 0G Chain. Immutable, forever.
        </p>
        <div className="mt-auto rounded-[10px] border border-line-3 bg-panel-2 p-[22px]">
          <div className="mb-4.5 flex items-start justify-between">
            <div>
              <div className="mb-1 font-mono text-[11px] text-ink-7">PREDICTION</div>
              <div className="text-[15px] font-medium text-ink-1">BTC &gt; $100k · Fri</div>
            </div>
            <span className="rounded-full border border-line-7 px-2.5 py-1 font-mono text-[11.5px] text-ink-3">YES</span>
          </div>
          <div className="mb-4.5 flex items-start gap-2 rounded-md border border-warn-border bg-warn-bg px-3 py-2.5">
            <span className="text-warn">⚠</span>
            <span className="text-[12.5px] leading-[1.45] text-warn-text">This can't be changed or deleted once locked.</span>
          </div>
          <div className="flex justify-between text-[13px] text-ink-6">
            <span>Locked at</span>
            <span className="font-mono">block 4,182,907</span>
          </div>
          <div className="mt-2 flex justify-between text-[13px] text-ink-6">
            <span>Tx</span>
            <span className="font-mono text-ink-3">0x9f…e21 ↗</span>
          </div>
          <div className="mt-2 flex justify-between text-[13px] text-ink-2">
            <span>Status</span>
            <span className="font-mono text-success">● Confirmed</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-xl border border-line-3 bg-panel p-5 sm:p-[30px]">
        <h3 className="m-0 mb-2.5 text-[22px] font-normal tracking-[-0.02em] text-ink-1 sm:text-[26px]">Resolves itself</h3>
        <p className="m-0 mb-7 text-[15px] leading-[1.5] text-ink-5">
          When a market settles, contracts read the outcome and update accuracy and rank automatically. No admin.
        </p>
        <div className="mt-auto flex flex-col gap-2.5">
          {resolves.map((r) => (
            <div key={r.title} className="flex items-center gap-3 rounded-[9px] border border-line-3 bg-panel-2 px-3.5 py-2.5">
              <span
                className={
                  "flex size-[30px] shrink-0 items-center justify-center rounded-md text-white " +
                  (r.tone === "success" ? "bg-gradient-to-br from-[#3a7a52] to-[#2f6644]" : "bg-gradient-to-br from-[#7a3a3a] to-[#662f2f]")
                }
              >
                <r.Icon className="size-[15px]" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] text-ink-2">{r.title}</div>
                <div className="font-mono text-[11.5px] text-ink-7">{r.sub}</div>
              </div>
              <div className={"font-mono text-xs " + (r.tone === "success" ? "text-success" : "text-danger")}>{r.tag}</div>
            </div>
          ))}
          <div className="mt-1 rounded-[9px] border border-line-5 bg-panel-2 px-3.5 py-3">
            <div className="mb-1 font-mono text-[11px] text-ink-3">RANK UPDATE</div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-ink-1">Your call resolved WON · accuracy +2%</span>
              <span className="font-mono text-[12.5px] text-success">#12 → #9 ↑</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
