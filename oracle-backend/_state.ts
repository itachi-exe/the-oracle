import { mockAgent, mockLeaderboard, mockMarkets, mockPredictions, mockProfile } from "../oracle-frontend/src/lib/mockData";
import { getDynamicMarkets } from "./_dynamicMarkets";
import type { Agent, Category, LeaderboardEntry, LockPredictionRequest, Market, Prediction, Profile } from "../oracle-frontend/src/lib/types";

// TODO(decision): tune K — mirrors Reputation.sol's K_BPS=2000 (max swing at 100% confidence = 20pp).
const K = 0.2;
const OVERRIDE_MODIFIER = 1.5;

type Store = {
  profiles: Map<string, Profile>;
  agents: Map<string, Agent>;
  markets: Market[];
  predictions: Prediction[];
  leaderboard: LeaderboardEntry[];
};

const globalStore = globalThis as typeof globalThis & { __oracleStore?: Store };

export const store: Store =
  globalStore.__oracleStore ??
  (globalStore.__oracleStore = {
    profiles: new Map([[mockProfile.address.toLowerCase(), mockProfile]]),
    agents: new Map([[mockAgent.owner.toLowerCase(), { ...mockAgent }]]),
    markets: [...mockMarkets],
    predictions: [...mockPredictions],
    leaderboard: [...mockLeaderboard],
  });

/** Pulls fresh crypto/sports/culture markets into the store and replaces only the previous dynamic batch — static markets are untouched. */
export async function ensureDynamicMarkets() {
  const dynamic = await getDynamicMarkets();
  const staticOnes = store.markets.filter((market) => !market.id.startsWith("dyn-"));
  store.markets = [...staticOnes, ...dynamic];
}

export function getProfile(address: string) {
  const normalized = address.toLowerCase();
  const existing = store.profiles.get(normalized);
  if (existing) return existing;

  return {
    address,
    displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
    categories: ["sports", "crypto", "culture"],
    streak: 0,
    accuracyByCategory: {
      sports: 0,
      crypto: 0,
      culture: 0,
    },
    globalRank: store.leaderboard.length + 1,
    createdAt: Date.now(),
  } satisfies Profile;
}

export function upsertProfile(profile: Profile) {
  store.profiles.set(profile.address.toLowerCase(), profile);
  return profile;
}

export function getAgent(owner: string): Agent | undefined {
  return store.agents.get(owner.toLowerCase());
}

export function createAgent(owner: string, name: string): Agent {
  const normalized = owner.toLowerCase();
  if (store.agents.has(normalized)) throw new Error("Agent already exists for this wallet");

  const agent: Agent = {
    owner,
    name,
    pairReputation: 0.5,
    agentSoloAccuracy: 0,
    agentSoloWins: 0,
    agentSoloResolved: 0,
    styleMemory: [],
    createdAt: Date.now(),
  };

  store.agents.set(normalized, agent);
  return agent;
}

/**
 * Real questions name real things — "bitcoin", "yankees", "drake" — not the exact wording of a
 * templated market question. Matches against the actual entity behind the market (coin name/
 * symbol, team name, artist/title) before falling back to generic question-text overlap.
 */
function matchesDistinctiveTerm(candidate: Market, lower: string): boolean {
  const symbol = candidate.question.split(" ")[0]?.toLowerCase();
  if (symbol && symbol.length >= 3 && lower.includes(symbol)) return true;

  if (candidate.live?.source === "coingecko") {
    const name = candidate.live.coinId.replace(/-2$/, "").replace(/-/g, " ");
    if (lower.includes(name)) return true;
  }

  if (candidate.live?.source === "espn") {
    if (candidate.live.teamName.toLowerCase().split(" ").some((word) => word.length > 3 && lower.includes(word))) return true;
  }

  if (candidate.live?.source === "applecharts") {
    if (lower.includes(candidate.live.artist.toLowerCase()) || lower.includes(candidate.live.title.toLowerCase())) return true;
  }

  return false;
}

/** Undefined means nothing genuinely matched — callers must not silently default to an arbitrary market. */
export function findMarketForQuestion(question: string, marketId?: string): Market | undefined {
  const lower = question.toLowerCase();

  return (
    store.markets.find((candidate) => candidate.id === marketId) ??
    store.markets.find((candidate) => matchesDistinctiveTerm(candidate, lower)) ??
    store.markets.find((candidate) => lower.includes(candidate.category)) ??
    store.markets.find((candidate) => candidate.question.toLowerCase().split(" ").some((word) => word.length > 5 && lower.includes(word)))
  );
}

/** A real, pickable spread of markets — never empty as long as the store has any markets at all. Spread across categories so there's always something to point at. */
export function suggestMarkets(limit = 4): Array<{ id: string; question: string; category: Category }> {
  const byCategory = new Map<Category, Market[]>();
  for (const market of store.markets) {
    const list = byCategory.get(market.category) ?? [];
    list.push(market);
    byCategory.set(market.category, list);
  }

  const categories: Category[] = ["crypto", "sports", "culture"];
  const picks: Market[] = [];
  for (let round = 0; picks.length < limit && round < limit; round++) {
    for (const category of categories) {
      if (picks.length >= limit) break;
      const list = byCategory.get(category);
      const next = list?.shift();
      if (next) picks.push(next);
    }
  }

  return picks.map((market) => ({ id: market.id, question: market.question, category: market.category }));
}

export function lockPrediction(input: LockPredictionRequest) {
  const market = store.markets.find((candidate) => candidate.id === input.marketId);
  if (!market) throw new Error("Market not found");
  if (!market.outcomes.includes(input.outcome)) throw new Error("Invalid outcome for market");
  if (market.closesAt <= Date.now()) throw new Error("Market is closed");

  const prediction: Prediction = {
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
    txHash: input.txHash ?? mockTxHash(),
    status: "pending",
  };

  store.predictions.unshift(prediction);
  return prediction;
}

/** Confidence-weighted delta, amplified when the user overrode their agent. Mirrors Reputation.sol. */
function reputationDelta(confidence: number, won: boolean, overrode: boolean) {
  const base = K * confidence;
  const result = won ? base : -base;
  return overrode ? result * OVERRIDE_MODIFIER : result;
}

export function resolvePrediction(id: string, resolvedOutcome: string) {
  const prediction = store.predictions.find((candidate) => candidate.id === id);
  if (!prediction) throw new Error("Prediction not found");

  const market = store.markets.find((candidate) => candidate.id === prediction.marketId);
  if (market) market.resolvedOutcome = resolvedOutcome;

  const won = prediction.outcome === resolvedOutcome;
  const agentWon = prediction.agentOutcome === resolvedOutcome;
  prediction.status = won ? "won" : "lost";

  const agent = prediction.user ? getAgent(prediction.user) : undefined;
  if (agent) {
    // Pair reputation reflects every locked call either way — it's still your record.
    const delta = reputationDelta(prediction.confidenceAtLock ?? 0.5, won, prediction.userOverrodeAgent);
    agent.pairReputation = Math.max(0, Math.min(1, agent.pairReputation + delta));

    // Solo accuracy is only exercised in training mode — companionship mode never had
    // the agent stake an independent, contested view worth scoring.
    if (prediction.mode === "training") {
      agent.agentSoloResolved += 1;
      if (agentWon) agent.agentSoloWins += 1;
      agent.agentSoloAccuracy = agent.agentSoloWins / agent.agentSoloResolved;
    }
  }

  return prediction;
}

/** Leaderboard ranked live off current agent state, not the static seed snapshot. */
export function getLeaderboard(): LeaderboardEntry[] {
  const merged = store.leaderboard.map((entry) => {
    const agent = getAgent(entry.address);
    if (!agent) return entry;
    return {
      ...entry,
      displayName: agent.name,
      pairReputation: agent.pairReputation,
      agentSoloAccuracy: agent.agentSoloAccuracy,
    };
  });

  return merged
    .sort((a, b) => b.pairReputation - a.pairReputation)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function mockTxHash() {
  const hex = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 64; i += 1) out += hex[Math.floor(Math.random() * hex.length)];
  return out;
}
