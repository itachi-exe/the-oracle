import type { Agent, Market, LeaderboardEntry, Prediction, Profile } from "./types";

export const demoAddress = "0x7a2f0000000000000000000000000000000000b3e1";

export const mockProfile: Profile = {
  address: demoAddress,
  displayName: "sharp.0g",
  categories: ["sports", "crypto", "culture"],
  streak: 7,
  accuracyByCategory: {
    sports: 0.7,
    crypto: 0.71,
    culture: 0.68,
  },
  globalRank: 12,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 38,
};

export const mockAgent: Agent = {
  owner: demoAddress,
  name: "Cassowary",
  pairReputation: 0.58,
  agentSoloAccuracy: 0.61,
  agentSoloWins: 14,
  agentSoloResolved: 23,
  styleMemory: [
    "Fades the public when the line moves late",
    "Trusts on-chain flow data over social sentiment for crypto calls",
  ],
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 38,
};

export const mockMarkets: Market[] = [
  {
    id: "btc-100k",
    category: "crypto",
    question: "BTC closes above $100k this Friday",
    outcomes: ["Yes", "No"],
    closesAt: Date.now() + 1000 * 60 * 60 * 52,
    live: { source: "coingecko", coinId: "bitcoin", targetPrice: 100_000, direction: "above" },
  },
  {
    id: "lakers-celtics",
    category: "sports",
    question: "Lakers beat the Celtics tonight",
    outcomes: ["Yes", "No"],
    closesAt: Date.now() + 1000 * 60 * 60 * 6,
    live: { source: "espn", sportPath: "basketball/nba", teamName: "Lakers" },
  },
  {
    id: "yankees-win",
    category: "sports",
    question: "Yankees win their next game",
    outcomes: ["Yes", "No"],
    closesAt: Date.now() + 1000 * 60 * 60 * 10,
    live: { source: "espn", sportPath: "baseball/mlb", teamName: "Yankees" },
  },
  {
    id: "sequel-box-office",
    category: "culture",
    question: "Sequel tops the box office this weekend",
    outcomes: ["Yes", "No"],
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "eth-4k",
    category: "crypto",
    question: "ETH flips $4k before month-end",
    outcomes: ["Yes", "No"],
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 9,
    live: { source: "coingecko", coinId: "ethereum", targetPrice: 4_000, direction: "above" },
  },
  {
    id: "united-derby",
    category: "sports",
    question: "United wins the derby",
    outcomes: ["Yes", "No"],
    closesAt: Date.now() + 1000 * 60 * 60 * 26,
    live: { source: "espn", sportPath: "soccer/eng.1", teamName: "Manchester United" },
  },
  {
    id: "album-debut",
    category: "culture",
    question: "Drake's ICEMAN holds #1 on the albums chart",
    outcomes: ["Yes", "No"],
    closesAt: Date.now() + 1000 * 60 * 60 * 24 * 4,
    live: { source: "applecharts", artist: "Drake", title: "ICEMAN" },
  },
];

export const mockPredictions: Prediction[] = [
  {
    id: "p1",
    user: demoAddress,
    marketId: "btc-100k",
    question: "BTC > $100k this Friday",
    agentOutcome: "Yes",
    agentConfidence: 0.64,
    userOutcome: "Yes",
    outcome: "Yes",
    confidenceAtLock: 0.64,
    userOverrodeAgent: false,
    mode: "training",
    lockedAt: Date.now() - 1000 * 60 * 60 * 5,
    status: "pending",
  },
  {
    id: "p2",
    user: demoAddress,
    marketId: "lakers-celtics",
    question: "Lakers to win vs Celtics",
    agentOutcome: "No",
    agentConfidence: 0.55,
    userOutcome: "Yes",
    outcome: "Yes",
    confidenceAtLock: 0.55,
    userOverrodeAgent: true,
    mode: "training",
    lockedAt: Date.now() - 1000 * 60 * 60 * 24,
    status: "won",
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, address: "0xoracle0g0000000000000000000000000000001", displayName: "Oracle Prime", category: "crypto", pairReputation: 0.84, agentSoloAccuracy: 0.79, total: 142, streak: 22 },
  { rank: 2, address: "0xdelphi0g00000000000000000000000000000002", displayName: "Delphine", category: "sports", pairReputation: 0.81, agentSoloAccuracy: 0.74, total: 96, streak: 17 },
  { rank: 3, address: "0xpythia0g00000000000000000000000000000003", displayName: "Pythia", category: "culture", pairReputation: 0.79, agentSoloAccuracy: 0.7, total: 71, streak: 14 },
  { rank: 4, address: "0xsatoshi0g0000000000000000000000000000004", displayName: "Satovault", category: "crypto", pairReputation: 0.77, agentSoloAccuracy: 0.68, total: 64, streak: 11 },
  { rank: 5, address: "0xnostradamus000000000000000000000000005", displayName: "Nostro", category: "sports", pairReputation: 0.75, agentSoloAccuracy: 0.66, total: 58, streak: 9 },
  { rank: 6, address: "0xcassandra0g00000000000000000000000006", displayName: "Cassandra", category: "culture", pairReputation: 0.73, agentSoloAccuracy: 0.65, total: 52, streak: 8 },
  { rank: 7, address: "0xtycho0g000000000000000000000000000007", displayName: "Tycho", category: "crypto", pairReputation: 0.72, agentSoloAccuracy: 0.64, total: 49, streak: 6 },
  { rank: 12, address: demoAddress, displayName: mockAgent.name, category: "crypto", pairReputation: mockAgent.pairReputation, agentSoloAccuracy: mockAgent.agentSoloAccuracy, total: 41, streak: 7, isCurrentUser: true },
  { rank: 13, address: "0xaugur0g000000000000000000000000000013", displayName: "Augur", category: "sports", pairReputation: 0.7, agentSoloAccuracy: 0.6, total: 38, streak: 5 },
];
