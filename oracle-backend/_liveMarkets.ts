import { fetchCryptoPrices, fetchEspnScoreboard, fetchTopAlbums } from "./_liveData";
import type { Market } from "../oracle-frontend/src/lib/types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: value < 100 ? 2 : 0 });
}

/** American moneyline odds -> implied win probability (still includes the book's vig). */
function impliedProb(americanOdds: number) {
  return americanOdds < 0 ? -americanOdds / (-americanOdds + 100) : 100 / (americanOdds + 100);
}

async function liveForCrypto(binding: Extract<Market["live"], { source: "coingecko" }>) {
  const prices = await fetchCryptoPrices();
  const coin = prices?.[binding.coinId];
  if (!coin) return null;

  const distance = (coin.usd - binding.targetPrice) / binding.targetPrice;
  const momentum = (coin.usd_24h_change ?? 0) / 100;
  const sentimentAbove = clamp(0.5 + distance * 4 + momentum * 0.6, 0.03, 0.97);
  const sentiment = binding.direction === "below" ? 1 - sentimentAbove : sentimentAbove;
  const sign = coin.usd_24h_change >= 0 ? "+" : "";

  return {
    sentiment,
    liveNote: `${binding.coinId} at $${formatUsd(coin.usd)} (${sign}${coin.usd_24h_change.toFixed(1)}% 24h)`,
  };
}

function findEspnTeamEvent(board: unknown, teamName: string) {
  type EspnCompetitor = {
    team?: { displayName?: string; shortDisplayName?: string };
    score?: string;
    homeAway?: "home" | "away";
    winner?: boolean;
  };
  type EspnEvent = {
    competitions?: Array<{
      status?: { type?: { state?: "pre" | "in" | "post" } };
      competitors?: EspnCompetitor[];
      odds?: Array<{
        moneyline?: { home?: { close?: { odds?: string } }; away?: { close?: { odds?: string } } };
      }>;
    }>;
  };

  const events = (board as { events?: EspnEvent[] } | null)?.events ?? [];
  const needle = teamName.toLowerCase();

  for (const event of events) {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors ?? [];
    const mine = competitors.find(
      (c) => c.team?.displayName?.toLowerCase().includes(needle) || c.team?.shortDisplayName?.toLowerCase().includes(needle),
    );
    if (!mine || !competition) continue;

    const opponent = competitors.find((c) => c !== mine);
    const oppName = opponent?.team?.displayName ?? "their opponent";
    const mineName = mine.team?.displayName ?? teamName;
    const state = competition.status?.type?.state;

    if (state === "post") {
      return { sentiment: mine.winner ? 0.97 : 0.03, liveNote: `${mineName} ${mine.score}-${opponent?.score} vs ${oppName} (final)` };
    }

    if (state === "in") {
      const diff = Number(mine.score ?? 0) - Number(opponent?.score ?? 0);
      return { sentiment: clamp(0.5 + diff * 0.04, 0.05, 0.95), liveNote: `${mineName} ${mine.score}-${opponent?.score} vs ${oppName}, live` };
    }

    const moneyline = competition.odds?.[0]?.moneyline;
    const mineOdds = mine.homeAway === "home" ? moneyline?.home?.close?.odds : moneyline?.away?.close?.odds;
    const oppOdds = mine.homeAway === "home" ? moneyline?.away?.close?.odds : moneyline?.home?.close?.odds;
    if (mineOdds && oppOdds) {
      const pMine = impliedProb(Number(mineOdds));
      const pOpp = impliedProb(Number(oppOdds));
      const sentiment = clamp(pMine / (pMine + pOpp), 0.04, 0.96);
      return { sentiment, liveNote: `${mineName} moneyline ${mineOdds} vs ${oppName} (${oppOdds})` };
    }

    return null; // matched today's game but no odds posted yet — don't fabricate a number
  }

  return null; // team isn't playing today
}

async function liveForEspn(binding: Extract<Market["live"], { source: "espn" }>) {
  const board = await fetchEspnScoreboard(binding.sportPath);
  if (!board) return null;
  return findEspnTeamEvent(board, binding.teamName);
}

async function liveForCharts(binding: Extract<Market["live"], { source: "applecharts" }>) {
  const albums = await fetchTopAlbums();
  if (!albums) return null;

  const rank = albums.findIndex(
    (a) => a.artistName.toLowerCase().includes(binding.artist.toLowerCase()) && a.name.toLowerCase().includes(binding.title.toLowerCase()),
  );

  if (rank === -1) {
    return { sentiment: 0.05, liveNote: `Not in Apple Music's current Top ${albums.length} Albums (US)` };
  }

  return {
    sentiment: clamp(1 - rank / albums.length, 0.05, 0.97),
    liveNote: `#${rank + 1} on Apple Music's Top Albums (US) right now`,
  };
}

/** Returns a copy of the market with live sentiment/note merged in. Never throws, never fakes a number when the source has nothing. */
export async function attachLiveData(market: Market): Promise<Market> {
  if (!market.live) return market;

  try {
    const result =
      market.live.source === "coingecko"
        ? await liveForCrypto(market.live)
        : market.live.source === "espn"
          ? await liveForEspn(market.live)
          : await liveForCharts(market.live);

    if (!result) return market;
    return { ...market, sentiment: result.sentiment, isLive: true, liveNote: result.liveNote };
  } catch {
    return market;
  }
}

export async function attachLiveDataToAll(markets: Market[]): Promise<Market[]> {
  return Promise.all(markets.map(attachLiveData));
}
