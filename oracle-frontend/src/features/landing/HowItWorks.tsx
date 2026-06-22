const steps = [
  { n: "01", title: "Connect", desc: "Connect your wallet and name your agent. It's yours alone, and it starts at a coin flip." },
  { n: "02", title: "Spar", desc: "Bring a call. Your agent takes its own side, with its own confidence, and pushes back up to three rounds if you disagree." },
  { n: "03", title: "Lock", desc: "Settle on a final call together and lock it on 0G Chain, the full disagreement record included, immutable forever." },
  { n: "04", title: "Resolve", desc: "When the market settles, contracts score your shared reputation and your agent's solo accuracy, automatically." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1180px] scroll-mt-[110px] px-4 pt-[80px] sm:px-6 sm:pt-[130px]">
      <div className="mb-5 font-mono text-xs uppercase tracking-[0.12em] text-ink-7">How it works</div>
      <h2 className="m-0 mb-3.5 max-w-[680px] text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-ink-1 sm:text-[40px] sm:leading-[1.1] sm:tracking-[-0.03em]">
        From disagreement to on-chain record
      </h2>
      <p className="m-0 mb-10 max-w-[560px] text-[15px] leading-[1.5] text-ink-5 sm:mb-14 sm:text-[17px]">
        Four steps, no capital. Connect, spar, lock, then let the chain keep score.
      </p>
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n}>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-7 font-mono text-[13px] text-ink-1">
                {s.n}
              </span>
              <span className="h-px flex-1 bg-line-3" />
            </div>
            <h3 className="m-0 mb-2 text-[18px] font-medium tracking-[-0.01em] text-ink-1">{s.title}</h3>
            <p className="m-0 text-sm leading-[1.55] text-ink-6">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
