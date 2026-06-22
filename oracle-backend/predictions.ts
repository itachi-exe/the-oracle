import { ensureDynamicMarkets, lockPrediction, store } from "./_state";
import { getQueryValue, handle, methodNotAllowed, requireBody, sendJson } from "./_http";
import type { ApiRequest } from "./_http";
import type { LockPredictionRequest } from "../oracle-frontend/src/lib/types";

export default function handler(req: ApiRequest<LockPredictionRequest>, res: Parameters<typeof sendJson>[0]) {
  return handle(async () => {
    if (req.method === "GET") {
      const address = getQueryValue(req.query?.address);
      const predictions = address
        ? store.predictions.filter((prediction) => prediction.user?.toLowerCase() === address.toLowerCase())
        : store.predictions;

      sendJson(res, 200, predictions);
      return;
    }

    if (req.method === "POST") {
      const body = requireBody<LockPredictionRequest>(req.body, [
        "address",
        "marketId",
        "agentOutcome",
        "agentConfidence",
        "userOutcome",
        "outcome",
      ]);

      await ensureDynamicMarkets();
      // TODO(confirm): call PredictionLock.lockPrediction through the wallet client from the frontend.
      // This backend endpoint is a demo mirror so the UI can show tx/status flows without inventing chain constants.
      sendJson(res, 201, lockPrediction(body));
      return;
    }

    methodNotAllowed(res, ["GET", "POST"]);
  }, req, res);
}
