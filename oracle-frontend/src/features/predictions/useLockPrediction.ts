import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lockPrediction as lockPredictionOnBackend } from "@/lib/api";
import { lockPredictionOnChain } from "@/lib/chain/contracts";
import { hasContractConfig } from "@/lib/chain/config";
import { useWalletStore } from "@/features/wallet/useWalletStore";
import type { SparMode } from "@/lib/types";

interface LockInput {
  address: string;
  marketId: string;
  agentOutcome: string;
  agentConfidence: number;
  userOutcome: string;
  outcome: string;
  confidenceAtLock?: number;
  mode: SparMode;
}

/**
 * Locks a prediction on-chain when a real wallet is connected and contract addresses
 * are configured; otherwise mirrors the lock through the backend's demo store so the
 * UI flow works the same either way. See contracts/README.md for the on-chain path.
 */
export function useLockPrediction() {
  const queryClient = useQueryClient();
  const isReal = useWalletStore((s) => s.isReal);

  return useMutation({
    mutationFn: async (input: LockInput) => {
      if (isReal && hasContractConfig()) {
        const txHash = await lockPredictionOnChain({
          marketId: input.marketId,
          agentOutcome: input.agentOutcome,
          agentConfidence: input.agentConfidence,
          userOutcome: input.userOutcome,
          finalOutcome: input.outcome,
          finalConfidence: input.confidenceAtLock ?? input.agentConfidence,
        });
        return lockPredictionOnBackend({ ...input, txHash });
      }

      return lockPredictionOnBackend(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["agent"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
