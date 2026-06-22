import { fetchEspnScoreboard, fetchTopAlbums } from "./_liveData";
import type { Market } from "../oracle-frontend/src/lib/types";

/** Fixed, sensible round-number targets — chosen relative to real prices, but static so sentiment genuinely tracks movement over time. */
const DYNAMIC_CRYPTO: Array<{ coinId: string; symbol: string; target: number; direction: "above" | "below" }> = [
  { coinId: "solana", symbol: "SOL", target: 150, direction: "above" },
  { coinId: "ripple", symbol: "XRP", target: 2, direction: "above" },
  { coinId: "cardano", symbol: "ADA", target: 0.5, direction: "above" },
  { coinId: "dogecoin", symbol: "DOGE", target: 0.1, direction: "above" },
  { coinId: "polkadot", symbol: "DOT", target: 5, direction: "above" },
  { coinId: "chainlink", symbol: "LINK", target: 15, direction: "above" },
  { coinId: "avalanche-2", symbol: "AVAX", target: 20, direction: "above" },
  { coinId: "litecoin", symbol: "LTC", target: 60, direction: "above" },
  { coinId: "uniswap", symbol: "UNI", target: 5, direction: "above" },
  { coinId: "stellar", symbol: "XLM", target: 0.5, direction: "above" },
  { coinId: "monero", symbol: "XMR", target: 250, direction: "below" },
  { coinId: "cosmos", symbol: "ATOM", target: 3, direction: "above" },
  { coinId: "near", symbol: "NEAR", target: 5, direction: "above" },
  { coinId: "aptos", symbol: "APT", target: 1.5, direction: "above" },
  { coinId: "bitcoin-cash", symbol: "BCH", target: 150, direction: "below" },
  { coinId: "shiba-inu", symbol: "SHIB", target: 0.00001, direction: "above" },
  { coinId: "binancecoin", symbol: "BNB", target: 700, direction: "above" },
  { coinId: "tron", symbol: "TRX", target: 0.25, direction: "above" },
];

function formatTarget(value: number) {
  return value < 1 ? value.toString() : value.toLocaleString("en-US");
}

function cryptoMarkets(): Market[] {
  const closesAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
  return DYNAMIC_CRYPTO.map((c) => ({
    id: `dyn-crypto-${c.coinId}`,
    category: "crypto",
    question: `${c.symbol} closes ${c.direction} $${formatTarget(c.target)} this week`,
    outcomes: ["Yes", "No"],
    closesAt,
    live: { source: "coingecko", coinId: c.coinId, targetPrice: c.target, direction: c.direction },
  }));
}

interface EspnEventLite {
  id: string;
  date: string;
  competitions?: Array<{
    status?: { type?: { state?: string } };
    competitors?: Array<{ team?: { displayName?: string }; homeAway?: "home" | "away" }>;
  }>;
}

/** One market per real game that hasn't started yet — never offers a bet on a game already underway or finished. */
async function sportsMarketsFor(sportPath: string, leagueTag: string): Promise<Market[]> {
  const board = await fetchEspnScoreboard(sportPath);
  const events = (board as { events?: EspnEventLite[] } | null)?.events ?? [];
  const markets: Market[] = [];

  for (const event of events) {
    const competition = event.competitions?.[0];
    if (competition?.status?.type?.state !== "pre") continue;

    const home = competition.competitors?.find((c) => c.homeAway === "home");
    const away = competition.competitors?.find((c) => c.homeAway === "away");
    if (!home?.team?.displayName || !away?.team?.displayName) continue;

    markets.push({
      id: `dyn-${leagueTag}-${event.id}`,
      category: "sports",
      question: `${home.team.displayName} beat ${away.team.displayName}`,
      outcomes: ["Yes", "No"],
      closesAt: new Date(event.date).getTime(),
      live: { source: "espn", sportPath, teamName: home.team.displayName },
    });
  }

  return markets;
}

async function allSportsMarkets(): Promise<Market[]> {
  const [mlb, nba, epl] = await Promise.all([
    sportsMarketsFor("baseball/mlb", "mlb"),
    sportsMarketsFor("basketball/nba", "nba"),
    sportsMarketsFor("soccer/eng.1", "epl"),
  ]);
  return [...mlb, ...nba, ...epl].slice(0, 14);
}

async function cultureMarkets(): Promise<Market[]> {
  const albums = await fetchTopAlbums();
  if (!albums) return [];

  const closesAt = Date.now() + 1000 * 60 * 60 * 24 * 5;
  return albums.slice(0, 10).map((album, rank) => {
    const question =
      rank === 0
        ? `${album.artistName}'s ${album.name} stays #1 through the next chart update`
        : rank <= 2
          ? `${album.artistName}'s ${album.name} reaches #1 by the next chart update`
          : `${album.artistName}'s ${album.name} cracks the Top 5 by the next chart update`;

    return {
      id: `dyn-album-${rank}`,
      category: "culture",
      question,
      outcomes: ["Yes", "No"],
      closesAt,
      live: { source: "applecharts", artist: album.artistName, title: album.name },
    } satisfies Market;
  });
}

let dynamicCache: { markets: Market[]; expiresAt: number } | null = null;

/** Crypto is always live (24/7 market); sports/culture ride on whatever's real today — never padded with invented entries. */
export async function getDynamicMarkets(): Promise<Market[]> {
  if (dynamicCache && dynamicCache.expiresAt > Date.now()) return dynamicCache.markets;

  const [sports, culture] = await Promise.all([allSportsMarkets(), cultureMarkets()]);
  const markets = [...cryptoMarkets(), ...sports, ...culture];

  dynamicCache = { markets, expiresAt: Date.now() + 60_000 };
  return markets;
}
