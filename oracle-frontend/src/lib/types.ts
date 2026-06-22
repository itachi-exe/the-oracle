export type Category = "sports" | "crypto" | "culture";
export type PredictionStatus = "pending" | "resolving" | "won" | "lost";
/** Companionship: stake on your own read, agent doesn't contest. Training: the full sparring loop — this is how the agent's solo accuracy gets exercised. */
export type SparMode = "companionship" | "training";

export interface Profile {
  address: string;
  displayName: string;
  categories: Category[];
  streak: number;
  accuracyByCategory: Record<Category, number>;
  globalRank: number;
  createdAt: number;
  avatar?: string;
}

/** One agent per wallet. Created at onboarding; lives on 0G Storage in production. */
export interface Agent {
  owner: string;
  name: string;
  /** Shared human+agent score, 0..1, starts at 0.5 — the ranked leaderboard number. */
  pairReputation: number;
  /** The agent's own track record on its initial calls, independent of what got locked. */
  agentSoloAccuracy: number;
  agentSoloWins: number;
  agentSoloResolved: number;
  /** Distilled cues learned from past sessions — in-context, not a fine-tune. */
  styleMemory: string[];
  createdAt: number;
}

/** Where a market's real-world sentiment comes from — all three sources are free, no API key required. */
export type LiveBinding =
  | { source: "coingecko"; coinId: string; targetPrice: number; direction: "above" | "below" }
  | { source: "espn"; sportPath: string; teamName: string }
  | { source: "applecharts"; artist: string; title: string };

export interface Market {
  id: string;
  category: Category;
  question: string;
  outcomes: string[];
  sentiment?: number;
  closesAt: number;
  resolvedOutcome?: string;
  /** Static config for where this market's live odds/price/chart position comes from. Absent = manually curated, no live feed. */
  live?: LiveBinding;
  /** Set per-request once the bound source above actually answered — never fabricated when the source has nothing. */
  isLive?: boolean;
  liveNote?: string;
}

/** One locked prediction, carrying the full disagreement record from the sparring loop. */
export interface Prediction {
  id: string;
  user?: string;
  marketId: string;
  question: string;
  agentOutcome: string;
  agentConfidence: number;
  userOutcome: string;
  /** The final agreed call that actually got locked. */
  outcome: string;
  confidenceAtLock?: number;
  userOverrodeAgent: boolean;
  mode: SparMode;
  lockedAt: number;
  txHash?: string;
  status: PredictionStatus;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  /** The agent's name, not the wallet owner's — the leaderboard ranks agents. */
  displayName: string;
  category: Category;
  pairReputation: number;
  agentSoloAccuracy: number;
  total: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface LockPredictionRequest {
  address: string;
  marketId: string;
  agentOutcome: string;
  agentConfidence: number;
  userOutcome: string;
  outcome: string;
  confidenceAtLock?: number;
  mode: SparMode;
  /** Set when the lock already happened on-chain; the backend mirror reuses it instead of inventing one. */
  txHash?: string;
}

/** One turn in the sparring exchange — ephemeral, drives the Spar chat UI. */
export interface SparringTurn {
  role: "user" | "agent";
  outcome?: string;
  confidence?: number;
  reasoning: string;
  /** 0..3 — how many agent challenges have happened so far. */
  challengeIndex: number;
  teeVerified?: boolean;
  /** True once the agent has hit the challenge cap and is going with the user's call. */
  concede?: boolean;
  /** True when nothing matched a real market — the agent is asking what you want to look at, not opining on anything. */
  clarifying?: boolean;
  /** Real, pickable markets shown alongside a clarifying turn — never an empty list when clarifying is true. */
  suggestedMarkets?: Array<{ id: string; question: string; category: Category }>;
}

export interface SparRequest {
  question: string;
  address: string;
  marketId?: string;
  mode: SparMode;
  /** How many agent challenges have already happened in this exchange. 0 = opening read. */
  challengeIndex: number;
  userOutcome?: string;
  userConfidence?: number;
  userReasoning?: string;
}

export interface SparResponse {
  marketId: string;
  category: Category;
  mode: SparMode;
  /** The agent's own genuine stance this round — never overwritten by a forced concession. */
  agentOutcome: string;
  agentConfidence: number;
  /** The resulting call for this round: equals agentOutcome unless conceding to the user at the cap. */
  outcome: string;
  confidence: number;
  reasoning: string;
  challengeIndex: number;
  concede: boolean;
  teeVerified: boolean;
  provider: "deepseek" | "mock-agent";
  /** True when nothing matched a real market — every other field above is a meaningless placeholder. */
  clarifying?: boolean;
  /** Real, pickable markets to suggest — never an empty list when clarifying is true. */
  suggestedMarkets?: Array<{ id: string; question: string; category: Category }>;
}
