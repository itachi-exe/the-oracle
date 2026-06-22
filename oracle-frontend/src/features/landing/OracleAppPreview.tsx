import { Swords, FilePen, BarChart3, History, Settings, ShieldCheck, ArrowUp } from "lucide-react";

const navIcons = [
  { Icon: Swords, label: "Spar", active: true },
  { Icon: FilePen, label: "Logger" },
  { Icon: BarChart3, label: "Leaderboard" },
  { Icon: History, label: "My Predictions" },
  { Icon: Settings, label: "Settings" },
];

export function OracleAppPreview() {
  return (
    <div className="flex min-h-[540px]">
      <div className="flex w-[208px] shrink-0 flex-col gap-1.5 border-r border-line-2 p-3.5">
        <div className="flex items-center gap-2 px-2 pb-[18px] pt-1">
          <img src="/oracle-logo.png" alt="" className="size-[22px] object-contain" />
          <span className="text-sm font-medium text-ink-1">The Oracle</span>
        </div>
        {navIcons.map(({ Icon, label, active }) => (
          <div
            key={label}
            className={
              active
                ? "flex items-center gap-2.5 rounded-md border border-line-7 bg-panel-3 px-2.5 py-2 text-[13px] text-ink-2"
                : "flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-ink-6"
            }
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line-2 px-5.5 py-3.5">
          <span className="text-[13.5px] font-medium text-ink-1">Spar</span>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-success-border bg-success-bg px-2.5 py-1 font-mono text-[11.5px] text-success">
              ● 0G Chain
            </span>
            <span className="rounded-md border border-line-4 px-2.5 py-1 font-mono text-xs text-ink-6">0x7a…b3</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6.5">
          <div className="font-mono text-[12.5px] text-ink-6">
            Cassowary · 58% shared reputation · 23 solo calls resolved
          </div>
          <div className="max-w-[62%] self-end rounded-tl-[14px] rounded-tr-[14px] rounded-br-[4px] rounded-bl-[14px] border border-line-5 bg-panel-3 px-[15px] py-[11px] text-sm text-ink-2">
            Will BTC close above $100k this Friday?
          </div>
          <div className="max-w-[84%] rounded-tl-[14px] rounded-tr-[14px] rounded-br-[4px] rounded-bl-[14px] border border-line-6 bg-panel-2 p-5 shadow-2xl">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] text-ink-3">
                <ShieldCheck className="size-[13px]" aria-hidden="true" />
                CASSOWARY
              </span>
              <span className="font-mono text-[10.5px] text-ink-6">1/3</span>
            </div>
            <div className="mb-3 font-serif text-[27px] italic text-ink-1">My read: Yes, but it's close.</div>
            <p className="mb-[18px] text-sm leading-[1.6] text-ink-4">
              Spot ETFs saw three straight days of inflows and funding stays positive. The $100k line is
              psychological, expect a fight at resistance. What's your take?
            </p>
            <div className="mb-[18px] flex items-center gap-3">
              <span className="w-20 font-mono text-xs text-ink-6">Confidence</span>
              <div className="h-2 flex-1 overflow-hidden rounded-[5px] bg-panel-3">
                <div className="h-full w-[64%] rounded-[5px] bg-ink-1" />
              </div>
              <span className="font-mono text-[15px] font-medium text-ink-1">64%</span>
            </div>
            <div className="flex gap-2.5">
              <span className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground">
                Yes
              </span>
              <span className="rounded-md border border-line-7 px-4 py-2 text-[13px] text-ink-4">No</span>
            </div>
          </div>
        </div>

        <div className="border-t border-line-2 px-5.5 py-4">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-line-5 bg-panel-2 px-3.5 py-2.5">
            <span className="flex-1 text-sm text-ink-7">Ask your agent anything…</span>
            <span className="flex size-[30px] items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ArrowUp className="size-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
