import { demoAddress, mockAgent, mockLeaderboard, mockMarkets, mockPredictions, mockProfile } from "./mockData";
import type {
  Agent,
  LeaderboardEntry,
  LockPredictionRequest,
  Market,
  Prediction,
  Profile,
  SparRequest,
  SparResponse,
} from "./types";

const jsonHeaders = { "Content-Type": "application/json" };

async function request<T>(path: string, init?: RequestInit, fallback?: () => T): Promise<T> {
  try {
    const response = await fetch(path, init);
    if (!response.ok) throw new Error(`API ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    if (fallback) return fallback();
    throw error;
  }
}

export function fetchProfile(address = demoAddress) {
  return request<Profile>(`/api/profile?address=${encodeURIComponent(address)}`, undefined, () => mockProfile);
}

export function updateProfile(profile: Profile) {
  return request<Profile>(
    "/api/profile",
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(profile),
    },
    () => profile,
  );
}

export function fetchAgent(address = demoAddress) {
  return request<{ exists: boolean; agent: Agent | null }>(
    `/api/agent?address=${encodeURIComponent(address)}`,
    undefined,
    () => ({ exists: address === demoAddress, agent: address === demoAddress ? mockAgent : null }),
  );
}

export function createAgent(input: { address: string; name: string }) {
  return request<Agent>(
    "/api/agent",
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(input),
    },
    () => ({
      owner: input.address,
      name: input.name,
      pairReputation: 0.5,
      agentSoloAccuracy: 0,
      agentSoloWins: 0,
      agentSoloResolved: 0,
      styleMemory: [],
      createdAt: Date.now(),
    }),
  );
}

export function spar(input: SparRequest) {
  return request<SparResponse>(
    "/api/spar",
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(input),
    },
    () => {
      const market = mockMarkets.find((candidate) => candidate.id === input.marketId) ?? mockMarkets[0];
      const opening = !input.userOutcome;
      const agentOutcome = market.outcomes[0];
      return {
        marketId: market.id,
        category: market.category,
        mode: input.mode,
        agentOutcome,
        agentConfidence: 0.6,
        outcome: opening ? agentOutcome : input.userOutcome!,
        confidence: opening ? 0.6 : input.userConfidence ?? 0.6,
        reasoning: opening
          ? input.mode === "companionship"
            ? "This one's yours to call. What's your read?"
            : `My opening read: ${agentOutcome}. What's your take?`
          : "Locking it in.",
        challengeIndex: input.challengeIndex + 1,
        concede: !opening,
        teeVerified: false,
        provider: "mock-agent",
      };
    },
  );
}

export function fetchMarkets() {
  return request<Market[]>("/api/markets", undefined, () => mockMarkets);
}

export function fetchLeaderboard() {
  return request<LeaderboardEntry[]>("/api/leaderboard", undefined, () => mockLeaderboard);
}

export function fetchPredictions(address = demoAddress) {
  return request<Prediction[]>(
    `/api/predictions?address=${encodeURIComponent(address)}`,
    undefined,
    () => mockPredictions,
  );
}

export function lockPrediction(input: LockPredictionRequest) {
  return request<Prediction>(
    "/api/predictions",
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(input),
    },
    () => {
      const market = mockMarkets.find((candidate) => candidate.id === input.marketId) ?? mockMarkets[0];

      return {
        id: crypto.randomUUID(),
        user: input.address,
        marketId: market.id,
        question: market.question,
        agentOutcome: input.agentOutcome,
        agentConfidence: input.agentConfidence,
        userOutcome: input.userOutcome,
        outcome: input.outcome,
        confidenceAtLock: input.confidenceAtLock,
        userOverrodeAgent: input.outcome !== input.agentOutcome,
        mode: input.mode,
        lockedAt: Date.now(),
        txHash: mockTxHash(),
        status: "pending",
      };
    },
  );
}

function mockTxHash() {
  const hex = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 64; i += 1) out += hex[Math.floor(Math.random() * hex.length)];
  return out;
}
