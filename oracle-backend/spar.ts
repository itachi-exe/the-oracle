import { runSparringAgent } from "../oracle-ai-agent/oracleAgent";
import { handle, methodNotAllowed, requireBody, sendJson } from "./_http";
import type { ApiRequest } from "./_http";
import type { SparRequest } from "../oracle-frontend/src/lib/types";

export default function handler(req: ApiRequest<SparRequest>, res: Parameters<typeof sendJson>[0]) {
  return handle(async () => {
    if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

    const body = requireBody<SparRequest>(req.body, ["question", "address", "challengeIndex"]);

    const turn = await runSparringAgent(body);
    sendJson(res, 200, turn);
  }, req, res);
}
