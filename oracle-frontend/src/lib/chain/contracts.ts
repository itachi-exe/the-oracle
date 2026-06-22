import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  http,
  keccak256,
  toBytes,
  toHex,
  type Address,
} from "viem";
import agentRegistryAbi from "./abis/AgentRegistry.json";
import predictionLockAbi from "./abis/PredictionLock.json";
import reputationAbi from "./abis/Reputation.json";
import { chainConfig, hasContractConfig } from "./config";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    };
  }
}

// TODO(confirm): replace with the real 0G chain id/name once confirmed at docs.0g.ai.
// This devnet definition only activates once VITE_OG_CHAIN_ID/VITE_OG_RPC_URL are set.
function getDevnetChain() {
  return defineChain({
    id: Number(chainConfig.chainId),
    name: "0G Devnet",
    nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
    rpcUrls: { default: { http: [chainConfig.rpcUrl as string] } },
  });
}

export function getPublicClient() {
  if (!hasContractConfig()) return null;
  return createPublicClient({ chain: getDevnetChain(), transport: http(chainConfig.rpcUrl as string) });
}

export function hasInjectedWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function getWalletClient() {
  if (!hasInjectedWallet()) return null;
  return createWalletClient({ chain: getDevnetChain(), transport: custom(window.ethereum!) });
}

export function marketIdToBytes32(marketId: string) {
  return keccak256(toBytes(marketId));
}

export async function requestAccount(): Promise<Address> {
  if (!window.ethereum) throw new Error("No injected wallet found");
  const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts[0]) throw new Error("No account returned by wallet");
  return accounts[0] as Address;
}

function confidenceToBps(confidence: number) {
  return Math.round(confidence * 10_000);
}

export async function hasAgentOnChain(address: Address) {
  const publicClient = getPublicClient();
  if (!publicClient || !chainConfig.agentRegistryAddress) return false;

  return publicClient.readContract({
    address: chainConfig.agentRegistryAddress as Address,
    abi: agentRegistryAbi,
    functionName: "hasAgent",
    args: [address],
  }) as Promise<boolean>;
}

export async function createAgentOnChain(name: string) {
  const walletClient = getWalletClient();
  const publicClient = getPublicClient();
  if (!walletClient || !publicClient) throw new Error("Wallet or chain config not available");
  if (!chainConfig.agentRegistryAddress) throw new Error("VITE_AGENT_REGISTRY_ADDRESS is not set");

  const [account] = await walletClient.getAddresses();
  const hash = await walletClient.writeContract({
    account,
    address: chainConfig.agentRegistryAddress as Address,
    abi: agentRegistryAbi,
    functionName: "createAgent",
    args: [name],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function lockPredictionOnChain(input: {
  marketId: string;
  agentOutcome: string;
  agentConfidence: number;
  userOutcome: string;
  finalOutcome: string;
  finalConfidence: number;
}) {
  const walletClient = getWalletClient();
  const publicClient = getPublicClient();
  if (!walletClient || !publicClient) throw new Error("Wallet or chain config not available");
  if (!chainConfig.predictionLockAddress) throw new Error("VITE_PREDICTION_LOCK_ADDRESS is not set");

  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    account,
    address: chainConfig.predictionLockAddress as Address,
    abi: predictionLockAbi,
    functionName: "lockPrediction",
    args: [
      marketIdToBytes32(input.marketId),
      input.agentOutcome,
      confidenceToBps(input.agentConfidence),
      input.userOutcome,
      input.finalOutcome,
      confidenceToBps(input.finalConfidence),
    ],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function readAgentOnChain(address: Address) {
  const publicClient = getPublicClient();
  if (!publicClient || !chainConfig.agentRegistryAddress) return null;

  return publicClient.readContract({
    address: chainConfig.agentRegistryAddress as Address,
    abi: agentRegistryAbi,
    functionName: "getAgent",
    args: [address],
  }) as Promise<{
    name: string;
    pairReputationBps: number;
    agentSoloWins: number;
    agentSoloResolved: number;
    createdAt: bigint;
    exists: boolean;
  }>;
}

export { toHex, reputationAbi };
