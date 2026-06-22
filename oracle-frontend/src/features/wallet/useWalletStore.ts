import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hasInjectedWallet, requestAccount } from "@/lib/chain/contracts";

// TODO(confirm): WalletConnect/Coinbase Wallet still simulate a connection — wiring
// those needs their own connector SDKs, which is a separate decision from the
// 0G chain id/RPC values called out in project knowledge §13.
const MOCK_ADDRESS = "0x7a2f0000000000000000000000000000000000b3e1";

interface WalletState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  /** True only when connected through a real injected wallet (EIP-1193), not the demo mock path. */
  isReal: boolean;
  modalOpen: boolean;
  connectError: string | null;
  connectReal: () => Promise<void>;
  connectMock: () => void;
  disconnect: () => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      connected: false,
      connecting: false,
      address: null,
      isReal: false,
      modalOpen: false,
      connectError: null,
      connectReal: async () => {
        if (!hasInjectedWallet()) return get().connectMock();
        set({ connecting: true, connectError: null });
        try {
          const account = await requestAccount();
          set({ connected: true, connecting: false, address: account, isReal: true, modalOpen: false });
        } catch (error) {
          set({
            connecting: false,
            connectError: error instanceof Error ? error.message : "Wallet connection was rejected or failed.",
          });
        }
      },
      connectMock: () => {
        set({ connecting: true, connectError: null });
        setTimeout(
          () => set({ connected: true, connecting: false, address: MOCK_ADDRESS, isReal: false, modalOpen: false }),
          1300,
        );
      },
      disconnect: () => set({ connected: false, address: null, isReal: false }),
      openModal: () => set({ modalOpen: true, connectError: null }),
      closeModal: () => set({ modalOpen: false, connectError: null }),
    }),
    {
      name: "oracle-wallet",
      // Only the actual connection identity survives a reload — transient UI state (modal open,
      // an in-flight connect, a stale error) should never come back stale on next load.
      partialize: (state) => ({ connected: state.connected, address: state.address, isReal: state.isReal }),
    },
  ),
);

export function truncateAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
