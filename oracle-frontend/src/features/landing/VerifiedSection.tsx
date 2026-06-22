import { ShieldCheck } from "lucide-react";

const checks = [
  { tag: "01", title: "Verdicts run in a TEE enclave", desc: "0G Compute serves the model and attests every inference." },
  { tag: "02", title: "Memory lives on 0G Storage", desc: "Profile and conversation history, decentralized and permanent." },
  { tag: "03", title: "Predictions lock on 0G Chain", desc: "Two contracts: PredictionLock and Leaderboard." },
  { tag: "04", title: "Market data flows through 0G DA", desc: "Verifiable inputs feed both the markets and the Oracle's context." },
];

export function VerifiedSection() {
  return (
    <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-4 pt-[80px] sm:gap-16 sm:px-6 sm:pt-[130px] md:grid-cols-2 md:items-center">
      <div>
        <div className="mb-6.5 flex size-14 items-center justify-center rounded-2xl border border-line-5 bg-panel-2 text-ink-6">
          <ShieldCheck className="size-[26px]" aria-hidden="true" />
        </div>
        <h2 className="m-0 mb-4 text-[26px] font-normal leading-[1.18] tracking-[-0.02em] text-ink-1 sm:text-[36px] sm:leading-[1.12] sm:tracking-[-0.03em]">
          Verifiable on 0G, by design
        </h2>
        <p className="m-0 mb-8 text-[15px] leading-[1.55] text-ink-5 sm:text-base">
          Every layer is load-bearing. Nothing about the Oracle asks you to trust a server; the whole stack proves
          itself.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 rounded-lg border border-line-7 px-5 py-2.5 text-sm text-ink-1 no-underline transition-colors duration-200 hover:border-[#4a4a4a]"
        >
          See the architecture →
        </a>
      </div>
      <div className="flex flex-col gap-0.5">
        {checks.map((c) => (
          <div key={c.tag} className="flex items-start gap-3.5 border-b border-line-2 py-4.5">
            <span className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border border-line-7 bg-panel-3 font-mono text-[11px] text-ink-6">
              {c.tag}
            </span>
            <div>
              <div className="text-[15.5px] leading-[1.4] text-ink-2">{c.title}</div>
              <div className="mt-0.5 text-[13.5px] leading-[1.45] text-ink-6">{c.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
