import { useWalletStore } from "@/features/wallet/useWalletStore";
import { OracleAppPreview } from "./OracleAppPreview";

const layers = ["0G Compute · TEE", "0G Storage", "0G Chain", "0G DA"];

export function Hero() {
  const openModal = useWalletStore((s) => s.openModal);

  return (
    <section className="relative mx-auto max-w-[1180px] px-4 sm:px-6">
      <div className="relative mx-auto flex min-h-[60vh] max-w-[980px] flex-col items-center justify-center py-10 text-center sm:min-h-[74vh] sm:py-0">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-line-5 bg-panel-2 px-2.5 py-1 font-mono text-[9.5px] text-ink-4 sm:text-[10.5px]">
          <span className="size-[5px] shrink-0 rounded-full bg-success-dim" />
          Own an AI agent · verified on 0G
        </div>
        <h1 className="m-0 mb-3.5 text-[34px] font-normal leading-[1.08] tracking-[-0.02em] text-ink-1 sm:text-[48px] sm:leading-[1.07] md:text-[66px] md:leading-[1.06] md:tracking-[-0.03em]">
          Own your agent.<br />
          <span className="font-serif italic">Train</span> it to win.
        </h1>
        <p className="mx-auto mb-4.5 max-w-[340px] font-serif text-base italic leading-[1.5] text-ink-5 sm:max-w-[600px] sm:text-xl md:max-w-[820px] md:text-[28px]">
          One agent, minted to your wallet alone. It learns your style call after call and gets sharper with
          every disagreement, then locks your agreed call on 0G Chain, climbing one shared reputation together,
          starting at a coin flip.
        </p>
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={openModal}
            className="cursor-pointer rounded-md bg-primary px-[18px] py-2.5 text-[13px] font-medium text-primary-foreground"
          >
            Connect wallet to begin
          </button>
          <span className="font-mono text-[11px] text-ink-7">No capital · just conviction</span>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {layers.map((l) => (
            <span key={l} className="rounded-[5px] border border-line-4 px-2 py-1 font-mono text-[9.5px] text-ink-6 sm:text-[10.5px]">
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center sm:mt-13">
        <div className="w-full max-w-[940px] rounded-[16px] border border-[#2a2a2e] bg-[#0b0b0d] p-2 shadow-[0_44px_130px_rgba(0,0,0,0.7)] sm:rounded-[22px] sm:p-3">
          <div className="relative overflow-hidden rounded-lg border border-line-2 bg-panel sm:rounded-xl">
            <OracleAppPreview />
          </div>
        </div>
        <div className="h-2.5 w-full max-w-[1040px] rounded-b-[10px] bg-gradient-to-b from-[#d2d6dd] to-[#a4aab3] shadow-[0_18px_34px_rgba(0,0,0,0.45)] sm:h-3.5 sm:rounded-b-[13px]" />
      </div>
    </section>
  );
}
