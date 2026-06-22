import { useWalletStore } from "@/features/wallet/useWalletStore";

const benefits = [
  { label: "No capital", head: "Stake reputation", desc: "Climb on calibrated conviction, not on the size of your wallet." },
  { label: "A real opinion", head: "It argues first", desc: "Your agent takes its own side before you commit, never just a mirror." },
  { label: "Two scores", head: "Pair and solo", desc: "Shared reputation with you, plus its own solo accuracy as a learning cue." },
  { label: "Trustless lock", head: "Nobody fakes it", desc: "The full disagreement record lives on-chain; yours can't be edited or deleted." },
];

export function NoCasino() {
  const openModal = useWalletStore((s) => s.openModal);

  return (
    <section className="mx-auto max-w-[1180px] px-6 pt-[130px]">
      <h2 className="m-0 mb-3.5 text-[40px] font-normal leading-[1.1] tracking-[-0.03em] text-ink-1">
        No casino. <span className="text-ink-7">Just conviction.</span>
      </h2>
      <p className="m-0 mb-11 max-w-[580px] text-[17px] leading-[1.5] text-ink-5">
        Prediction markets gate you behind capital and ship decorative AI. The Oracle removes both.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <div key={b.label} className="rounded-[11px] border border-line-3 bg-panel p-6">
            <div className="mb-4 font-mono text-[13px] text-ink-6">{b.label}</div>
            <div className="mb-2.5 text-[22px] font-normal leading-[1.2] tracking-[-0.02em] text-ink-1">{b.head}</div>
            <div className="text-[13.5px] leading-[1.45] text-ink-6">{b.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-[11px] border border-line-5 bg-panel-2 px-7 py-6">
        <div>
          <div className="mb-1.5 font-mono text-[13px] text-ink-6">THE PITCH</div>
          <div className="text-[19px] text-ink-2">Polymarket lets you bet money. The Oracle lets you raise an agent.</div>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg bg-primary px-[22px] py-2.5 text-sm font-medium text-primary-foreground"
        >
          Raise your agent
        </button>
      </div>
    </section>
  );
}
