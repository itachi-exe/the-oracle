/**
 * Free, keyless live-data sources backing market sentiment:
 * - CoinGecko public price API (crypto)
 * - ESPN's public scoreboard JSON, including real sportsbook odds (sports)
 * - Apple's official Marketing Tools chart feed (culture)
 * No signups, no API keys, no cost.
 */

type CacheEntry<T> = { data: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();

async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T | null> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  try {
    const data = await fetcher();
    cache.set(key, { data, expiresAt: Date.now() + ttlMs });
    return data;
  } catch {
    // Serve the last good snapshot rather than nothing if the upstream call fails.
    return hit?.data ?? null;
  }
}

export type CoinGeckoPrices = Record<string, { usd: number; usd_24h_change: number }>;

/** Every coin id referenced by any market binding, static or dynamically generated — one batched call covers all of them. */
const TRACKED_COIN_IDS = [
  "bitcoin",
  "ethereum",
  "solana",
  "ripple",
  "cardano",
  "dogecoin",
  "polkadot",
  "chainlink",
  "avalanche-2",
  "litecoin",
  "uniswap",
  "tron",
  "stellar",
  "monero",
  "cosmos",
  "near",
  "aptos",
  "bitcoin-cash",
  "shiba-inu",
  "binancecoin",
];

export async function fetchCryptoPrices(): Promise<CoinGeckoPrices | null> {
  return cached("coingecko", 45_000, async () => {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${TRACKED_COIN_IDS.join(",")}&vs_currencies=usd&include_24hr_change=true`,
    );
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    return (await res.json()) as CoinGeckoPrices;
  });
}

export async function fetchEspnScoreboard(sportPath: string): Promise<unknown | null> {
  return cached(`espn:${sportPath}`, 60_000, async () => {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard`);
    if (!res.ok) throw new Error(`espn ${res.status}`);
    return await res.json();
  });
}

export interface AppleChartEntry {
  artistName: string;
  name: string;
}

export async function fetchTopAlbums(): Promise<AppleChartEntry[] | null> {
  return cached("apple-albums", 6 * 60 * 60_000, async () => {
    const res = await fetch("https://rss.marketingtools.apple.com/api/v2/us/music/most-played/25/albums.json");
    if (!res.ok) throw new Error(`apple charts ${res.status}`);
    const json = (await res.json()) as { feed?: { results?: AppleChartEntry[] } };
    return json.feed?.results ?? [];
  });
}
