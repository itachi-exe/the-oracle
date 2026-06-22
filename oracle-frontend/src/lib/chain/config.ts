export const chainConfig = {
  chainId: import.meta.env.VITE_OG_CHAIN_ID,
  rpcUrl: import.meta.env.VITE_OG_RPC_URL,
  explorerUrl: import.meta.env.VITE_OG_EXPLORER_URL,
  agentRegistryAddress: import.meta.env.VITE_AGENT_REGISTRY_ADDRESS,
  predictionLockAddress: import.meta.env.VITE_PREDICTION_LOCK_ADDRESS,
  reputationAddress: import.meta.env.VITE_REPUTATION_ADDRESS,
};

export function txExplorerUrl(txHash: string) {
  if (!chainConfig.explorerUrl) return undefined;
  return `${chainConfig.explorerUrl.replace(/\/$/, "")}/tx/${txHash}`;
}

export function hasContractConfig() {
  return Boolean(
    chainConfig.chainId &&
      chainConfig.rpcUrl &&
      chainConfig.agentRegistryAddress &&
      chainConfig.predictionLockAddress &&
      chainConfig.reputationAddress,
  );
}
