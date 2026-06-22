import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore, truncateAddress } from "./useWalletStore";

export function WalletStatusButton({ className }: { className?: string }) {
  const { connected, address, openModal, disconnect } = useWalletStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  if (!connected || !address) {
    return (
      <button
        type="button"
        onClick={openModal}
        className={className ?? "flex cursor-pointer items-center gap-1.5 text-sm text-ink-4 hover:text-ink-1"}
      >
        Connect wallet
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className={
          className ?? "flex cursor-pointer items-center gap-1.5 font-mono text-xs text-ink-5 hover:text-ink-1"
        }
        aria-expanded={menuOpen}
      >
        <span className="size-1.5 rounded-full bg-success-dim" />
        {truncateAddress(address)}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[150px] rounded-md border border-line-3 bg-panel-2 p-1 shadow-xl">
          <button
            type="button"
            onClick={() => {
              disconnect();
              setMenuOpen(false);
              navigate("/");
            }}
            className="w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-danger hover:bg-panel-3"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
