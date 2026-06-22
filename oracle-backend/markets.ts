import { ensureDynamicMarkets, store } from "./_state";
import { attachLiveDataToAll } from "./_liveMarkets";
import { getQueryValue, handle, methodNotAllowed, sendJson } from "./_http";
import type { ApiRequest } from "./_http";

export default function handler(req: ApiRequest, res: Parameters<typeof sendJson>[0]) {
  return handle(async () => {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

    await ensureDynamicMarkets();
    const category = getQueryValue(req.query?.category);
    const filtered = category ? store.markets.filter((market) => market.category === category) : store.markets;
    const markets = await attachLiveDataToAll(filtered);
    sendJson(res, 200, markets);
  }, req, res);
}
