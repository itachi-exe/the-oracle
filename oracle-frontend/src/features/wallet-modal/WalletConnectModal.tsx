import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TriangleAlert, Wallet, X } from "lucide-react";
import { useWalletStore } from "@/features/wallet/useWalletStore";

const wallets = [
  { name: "MetaMask", bg: "#F6851B" },
  { name: "WalletConnect", bg: "#3B99FC" },
  { name: "Coinbase Wallet", bg: "#0052FF" },
  { name: "0G Wallet", bg: "#000000" },
];

export function WalletConnectModal() {
  const { modalOpen, connecting, connected, connectError, connectReal, connectMock, closeModal } = useWalletStore();
  const navigate = useNavigate();
  const wasConnected = useRef(connected);

  // Redirect only on the false->true transition. This component stays mounted for the
  // app's whole lifetime, so a level-triggered "if (connected) navigate" here would hijack
  // every later in-app navigation back to /app any time this effect happens to re-run.
  useEffect(() => {
    if (connected && !wasConnected.current) navigate("/app");
    wasConnected.current = connected;
  }, [connected, navigate]);

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65" onClick={closeModal}>
      <div
        className="absolute left-0 right-0 top-16 mx-auto max-w-[1180px] border-b border-line-3 bg-panel-2 px-6 pb-6 pt-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[15px] font-medium text-ink-1">Connect a wallet</span>
          <button type="button" onClick={closeModal} className="cursor-pointer text-ink-6 hover:text-ink-1" aria-label="Close">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {connectError && !connecting && (
          <div className="mb-4 flex items-center gap-2 border border-danger-border bg-panel-3 px-3 py-2 text-[13px] text-danger">
            <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            {connectError}
          </div>
        )}

        {connecting ? (
          <div className="flex items-center gap-3.5 py-1">
            <span className="block size-[26px] animate-spin rounded-full border-2 border-line-3 border-t-ink-1" />
            <span className="font-mono text-sm text-ink-5">Connecting…</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {wallets.map((w) => (
              <button
                key={w.name}
                type="button"
                onClick={() => (w.name === "MetaMask" ? connectReal() : connectMock())}
                className="flex cursor-pointer items-center gap-3 border border-line-3 bg-panel px-4 py-3.5 transition-colors duration-150 hover:border-line-7 hover:bg-panel-3"
              >
                <span
                  className="flex size-[30px] shrink-0 items-center justify-center text-white"
                  style={{ background: w.bg }}
                >
                  <Wallet className="size-[17px]" aria-hidden="true" />
                </span>
                <span className="text-[13.5px] text-ink-2">{w.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
