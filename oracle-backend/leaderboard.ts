import { getLeaderboard } from "./_state";
import { handle, methodNotAllowed, sendJson } from "./_http";
import type { ApiRequest } from "./_http";

export default function handler(req: ApiRequest, res: Parameters<typeof sendJson>[0]) {
  return handle(async () => {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

    // TODO(confirm): replace with Reputation contract reads after address/ABI are confirmed.
    sendJson(res, 200, getLeaderboard());
  }, req, res);
}
