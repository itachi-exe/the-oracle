import { LandingHeader } from "@/features/landing/LandingHeader";
import { Footer } from "@/features/landing/Footer";

const toc = [
  { id: "overview", label: "Overview" },
  { id: "core-model", label: "Own your agent" },
  { id: "sparring", label: "The sparring loop" },
  { id: "scoring", label: "Scoring" },
  { id: "architecture", label: "Built on 0G" },
  { id: "contracts", label: "Smart contracts" },
  { id: "status", label: "Status & roadmap" },
];

const layers = [
  {
    title: "0G Compute",
    desc: "Runs the agent. Inference happens inside a TEE (Intel TDX + NVIDIA H100/H200); responses are signed in-enclave, so a verdict can be checked, not just trusted.",
  },
  {
    title: "0G Storage",
    desc: "Holds the agent: its name, reputation, and the style cues it's picked up from your disagreement history. KV reads are millisecond-fast, built for an agent recalling its own memory.",
  },
  {
    title: "0G Chain",
    desc: "Where calls lock. An EVM L1 with sub-second finality. AgentRegistry, PredictionLock, and Reputation all live here.",
  },
  {
    title: "0G DA",
    desc: "Feeds market questions, outcomes, and sentiment into the agent's reasoning context.",
  },
];

const contracts = [
  {
    name: "AgentRegistry.sol",
    desc: "Mints one agent per wallet on first connect. Holds its name, starting pair reputation (50%), and its solo win/resolved counters.",
  },
  {
    name: "PredictionLock.sol",
    desc: "Append-only. A locked prediction carries the full disagreement record: the agent's own outcome and confidence, your own outcome, and the final agreed call, plus whether you overrode your agent. No edit, no delete.",
  },
  {
    name: "Reputation.sol",
    desc: "Today's manual/mock resolver and scorekeeper: a confidence-weighted delta on resolution, amplified when you override your agent. The resolver is deliberately pluggable: a real oracle can replace it later without touching the scoring math.",
  },
];

const roadmap = [
  { phase: "Now", desc: "Agent creation, the full 3-round sparring loop, on-chain locking with the disagreement record, and a live pair-reputation leaderboard." },
  { phase: "Next", desc: "Resolution and the confidence-weighted reputation update wired to a manual/mock resolver, plus agent solo-accuracy charts." },
  { phase: "Later", desc: "Public agent profiles, search, and shareable prediction cards." },
  { phase: "Post-hackathon", desc: "A real outcome oracle, a live market/sentiment data pipeline, deeper agent memory, and gasless onboarding." },
];

function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[110px] border-b border-line-2 py-10 first:pt-0 sm:py-14">
      <div className="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-ink-7">{label}</div>
      <h2 className="m-0 mb-5 text-[22px] font-normal leading-[1.2] tracking-[-0.01em] text-ink-1 sm:text-[28px] sm:leading-[1.15] sm:tracking-[-0.02em]">{title}</h2>
      <div className="flex flex-col gap-4 text-[14.5px] leading-[1.6] text-ink-4 sm:text-[15px] sm:leading-[1.65]">{children}</div>
    </section>
  );
}

export function DocsPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink-1 antialiased">
      <LandingHeader />

      <div className="mx-auto flex max-w-[1180px] gap-16 px-4 py-10 sm:px-6 sm:py-16 lg:py-16">
        <nav className="sticky top-[130px] hidden h-fit w-[200px] shrink-0 flex-col gap-1 lg:flex">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md px-3 py-1.5 text-sm text-ink-6 no-underline transition-colors duration-150 hover:bg-panel-3 hover:text-ink-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          <div className="mb-6 font-mono text-xs uppercase tracking-[0.12em] text-ink-7 sm:mb-10">Docs</div>
          <h1 className="m-0 mb-3 text-[30px] font-normal leading-[1.12] tracking-[-0.02em] text-ink-1 sm:text-[44px] sm:leading-[1.08] sm:tracking-[-0.03em]">
            How The Oracle works
          </h1>
          <p className="m-0 mb-8 max-w-[620px] text-[15px] leading-[1.6] text-ink-5 sm:mb-12 sm:text-base lg:mb-16">
            Own an AI agent that argues with you before every prediction, locks your calls on-chain forever, and
            climbs one shared reputation with you, starting at a coin flip.
          </p>

          <nav className="mb-10 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="shrink-0 whitespace-nowrap rounded-md border border-line-4 px-3 py-1.5 text-[12.5px] text-ink-4 no-underline"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Section id="overview" label="Overview" title="An agent you own, not one you share">
            <p>
              Prediction markets gate you behind capital and ship decorative AI: a probability bar with no
              reasoning, no memory, no voice. The Oracle removes the capital requirement and makes the agent the
              product.
            </p>
            <p>
              Every wallet raises its own personal agent. Before you lock anything, your agent gives its own
              read: its own outcome, its own confidence, its own reasoning, and asks for yours. The friction
              between your read and its read is the point: that's two minds in the room, not one mirror.
            </p>
          </Section>

          <Section id="core-model" label="The model" title="Own your agent, share one reputation">
            <p>
              One agent per wallet, created the first time you connect. It starts at the coin-flip line, 50%
              shared reputation, and every resolved call moves that number.
            </p>
            <p>There are two scores, on purpose:</p>
            <ul className="m-0 flex list-none flex-col gap-2 pl-0">
              <li className="flex gap-2">
                <span className="text-ink-2">Pair reputation:</span> the ranked, competitive number. It answers
                "how good are <em className="font-serif italic text-ink-2">we</em>."
              </li>
              <li className="flex gap-2">
                <span className="text-ink-2">Agent solo accuracy:</span> scored on the agent's own initial call
                every time, regardless of what got locked. It answers "is my agent actually getting sharper."
              </li>
            </ul>
            <p>
              "Training" here means learning in-context as you go: no uploads, no retraining. The agent
              accumulates your style and your disagreement history into memory that shapes future reads. You'll
              see that learning surface as the agent references past calls, its solo accuracy ticking up, and
              your own override rate trending down as trust builds.
            </p>
          </Section>

          <Section id="sparring" label="The loop" title="The sparring loop">
            <p>You bring a call. From there:</p>
            <ol className="m-0 flex list-none flex-col gap-3 pl-0">
              {[
                "Your agent answers with its own outcome, confidence, and reasoning, then asks for yours.",
                "You state your take. If you agree, the call is settled. No disagreement to resolve.",
                "If you disagree, your agent may push back once with its own restated read.",
                "After its third challenge, your agent concedes and locks in your call. The cap is hard: three is the ceiling, never a target.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line-7 font-mono text-[11px] text-ink-2">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <p>
              Whatever you settle on, the final agreed outcome and confidence, is what locks on-chain, together
              with the full record of who said what.
            </p>
          </Section>

          <Section id="scoring" label="The math" title="Confidence-weighted, override-amplified">
            <p>
              When a market resolves, your pair reputation moves by a delta proportional to how confident the
              locked call was. Conviction is staked, so calibration matters more than raw accuracy.
            </p>
            <pre className="overflow-x-auto rounded-lg border border-line-3 bg-panel-2 p-4 font-mono text-[13px] leading-[1.7] text-ink-3">
{`base   = K × finalConfidence
result = win ? +base : -base
modifier = overrodeAgent ? 1.5 : 1.0
reputationDelta = result × modifier`}
            </pre>
            <p>
              Following your agent to a win earns a steady gain. Overriding it and winning earns more: you
              out-read your own AI. Overriding it and losing costs more, too: it warned you. Your agent's solo
              accuracy is scored separately, purely against its own initial call, independent of what you decided
              to lock.
            </p>
          </Section>

          <Section id="architecture" label="Architecture" title="Every layer is load-bearing">
            <p>Nothing about the Oracle asks you to trust a server. The whole stack proves itself.</p>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {layers.map((l) => (
                <div key={l.title} className="rounded-lg border border-line-3 bg-panel p-5">
                  <div className="mb-2 text-[15px] font-medium text-ink-1">{l.title}</div>
                  <div className="text-sm leading-[1.55] text-ink-5">{l.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="contracts" label="On-chain" title="Three contracts">
            <div className="flex flex-col gap-4">
              {contracts.map((c) => (
                <div key={c.name} className="rounded-lg border border-line-3 bg-panel p-5">
                  <div className="mb-2 font-mono text-sm text-ink-1">{c.name}</div>
                  <div className="text-sm leading-[1.55] text-ink-5">{c.desc}</div>
                </div>
              ))}
            </div>
            <p>
              The resolver is intentionally pluggable. A contract can't see real-world outcomes. Today a
              manual/mock resolver settles markets so the loop is demoable; a trustless oracle is the natural next
              layer, not a rewrite.
            </p>
          </Section>

          <Section id="status" label="Where this stands" title="Built for Zero Cup 2026">
            <p>
              The Oracle is built for{" "}
              <a href="#" className="text-ink-2 underline-offset-3">
                Zero Cup 2026
              </a>
              . The product loop above (agent creation, sparring, locking, and a live reputation leaderboard) is
              the buildable slice; everything past it is the "we're just getting started" plan.
            </p>
            <div className="mt-2 flex flex-col gap-3">
              {roadmap.map((r) => (
                <div key={r.phase} className="flex gap-4 border-b border-line-1 pb-3 last:border-0">
                  <span className="w-28 shrink-0 font-mono text-xs uppercase tracking-[0.08em] text-ink-7">
                    {r.phase}
                  </span>
                  <span className="text-sm leading-[1.55] text-ink-4">{r.desc}</span>
                </div>
              ))}
            </div>
          </Section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
