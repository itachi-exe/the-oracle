import { Fingerprint, Swords, Gauge, Lock, BarChart3, History, Database, ShieldCheck } from "lucide-react";

const features = [
  { Icon: Fingerprint, title: "Own Your Agent", sub: "One agent, minted to your wallet" },
  { Icon: Swords, title: "Sparring", sub: "It argues its own side" },
  { Icon: Gauge, title: "Confidence", sub: "A read, not a stat dump" },
  { Icon: Lock, title: "On-chain Lock", sub: "Disagreement record included" },
  { Icon: BarChart3, title: "Shared Reputation", sub: "One score, ranked live" },
  { Icon: History, title: "Track Record", sub: "Every override, visible" },
  { Icon: Database, title: "In-context Memory", sub: "It learns your style as you go" },
  { Icon: ShieldCheck, title: "0G Verified", sub: "Proof, not promises" },
];

export function FeatureGrid() {
  return (
    <section id="product" className="mx-auto max-w-[1180px] scroll-mt-[110px] px-6 pt-[130px]">
      <h2 className="m-0 mb-3.5 max-w-[640px] text-[40px] font-normal leading-[1.1] tracking-[-0.03em] text-ink-1">
        Everything you need to own a sharper agent
      </h2>
      <p className="m-0 mb-11 max-w-[560px] text-[17px] leading-[1.5] text-ink-5">
        One agent that's actually yours: sparring, memory, on-chain proof, and one shared score.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ Icon, title, sub }) => (
          <a
            key={title}
            href="#"
            className="group flex min-h-[150px] flex-col gap-11 rounded-[11px] border border-line-3 bg-panel p-[22px] no-underline transition-colors duration-200 hover:border-line-7"
          >
            <Icon className="size-[18px] text-ink-6" aria-hidden="true" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-medium text-ink-1">{title}</span>
                <span className="text-[13px] text-ink-6 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                  →
                </span>
              </div>
              <div className="mt-1 text-[13.5px] text-ink-6">{sub}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
