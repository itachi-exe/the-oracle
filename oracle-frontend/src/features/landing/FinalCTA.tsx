import { useWalletStore } from "@/features/wallet/useWalletStore";

export function FinalCTA() {
  const openModal = useWalletStore((s) => s.openModal);

  return (
    <section className="relative mx-auto max-w-[1180px] px-6 py-[130px] text-center">
      <img src="/oracle-logo.png" alt="" className="relative mx-auto mb-6.5 block size-16 object-contain" />
      <h2 className="relative m-0 mb-7 text-[58px] font-normal leading-[1.05] tracking-[-0.035em] text-ink-1">
        Trust your read.
        <br />
        <span className="font-serif italic text-ink-5">Prove it forever.</span>
      </h2>
      <div className="relative flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={openModal}
          className="cursor-pointer rounded-lg bg-primary px-[30px] py-3.5 text-[15px] font-medium text-primary-foreground"
        >
          Connect wallet to begin
        </button>
        <span className="font-mono text-[13px] text-ink-7">No capital · just conviction</span>
      </div>
    </section>
  );
}
