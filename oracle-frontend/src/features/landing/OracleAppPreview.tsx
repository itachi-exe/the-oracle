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
    <div className="flex min-h-[420px] sm:min-h-[540px]">
      <div className="hidden w-[208px] shrink-0 flex-col gap-1.5 border-r border-line-2 p-3.5 sm:flex">
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

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line-2 px-3.5 py-3 sm:px-5.5 sm:py-3.5">
          <span className="text-[13px] font-medium text-ink-1 sm:text-[13.5px]">Spar</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden rounded-full border border-success-border bg-success-bg px-2.5 py-1 font-mono text-[11.5px] text-success sm:inline">
              ● 0G Chain
            </span>
            <span className="rounded-md border border-line-4 px-2 py-1 font-mono text-[11px] text-ink-6 sm:px-2.5 sm:text-xs">
              0x7a…b3
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-3.5 sm:gap-4 sm:p-6.5">
          <div className="font-mono text-[11px] text-ink-6 sm:text-[12.5px]">
            Cassowary · 58% shared reputation · 23 solo calls resolved
          </div>
          <div className="max-w-[80%] self-end rounded-tl-[14px] rounded-tr-[14px] rounded-br-[4px] rounded-bl-[14px] border border-line-5 bg-panel-3 px-[13px] py-[10px] text-[13px] text-ink-2 sm:max-w-[62%] sm:px-[15px] sm:py-[11px] sm:text-sm">
            Will BTC close above $100k this Friday?
          </div>
          <div className="max-w-[92%] rounded-tl-[14px] rounded-tr-[14px] rounded-br-[4px] rounded-bl-[14px] border border-line-6 bg-panel-2 p-4 shadow-2xl sm:max-w-[84%] sm:p-5">
            <div className="mb-3 flex items-center justify-between sm:mb-3.5">
              <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] text-ink-3">
                <ShieldCheck className="size-[13px]" aria-hidden="true" />
                CASSOWARY
              </span>
              <span className="font-mono text-[10.5px] text-ink-6">1/3</span>
            </div>
            <div className="mb-3 font-serif text-[21px] italic text-ink-1 sm:text-[27px]">My read: Yes, but it's close.</div>
            <p className="mb-[14px] text-[13px] leading-[1.6] text-ink-4 sm:mb-[18px] sm:text-sm">
              Spot ETFs saw three straight days of inflows and funding stays positive. The $100k line is
              psychological, expect a fight at resistance. What's your take?
            </p>
            <div className="mb-[14px] flex items-center gap-3 sm:mb-[18px]">
              <span className="w-16 font-mono text-[11px] text-ink-6 sm:w-20 sm:text-xs">Confidence</span>
              <div className="h-2 flex-1 overflow-hidden rounded-[5px] bg-panel-3">
                <div className="h-full w-[64%] rounded-[5px] bg-ink-1" />
              </div>
              <span className="font-mono text-sm font-medium text-ink-1 sm:text-[15px]">64%</span>
            </div>
            <div className="flex gap-2 sm:gap-2.5">
              <span className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground sm:px-4 sm:py-2 sm:text-[13px]">
                Yes
              </span>
              <span className="rounded-md border border-line-7 px-3 py-1.5 text-[12px] text-ink-4 sm:px-4 sm:py-2 sm:text-[13px]">
                No
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-line-2 px-3.5 py-3 sm:px-5.5 sm:py-4">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-line-5 bg-panel-2 px-3.5 py-2.5">
            <span className="flex-1 truncate text-[13px] text-ink-7 sm:text-sm">Ask your agent anything…</span>
            <span className="flex size-[28px] shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground sm:size-[30px]">
              <ArrowUp className="size-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
