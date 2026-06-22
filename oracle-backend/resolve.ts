import { resolvePrediction } from "./_state";
import { handle, methodNotAllowed, requireBody, sendJson } from "./_http";
import type { ApiRequest } from "./_http";

type ResolveRequest = {
  predictionId: string;
  resolvedOutcome: string;
};

export default function handler(req: ApiRequest<ResolveRequest>, res: Parameters<typeof sendJson>[0]) {
  return handle(async () => {
    if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

    const body = requireBody<ResolveRequest>(req.body, ["predictionId", "resolvedOutcome"]);

    // TODO(decision): this is the manual/mock resolver. Replace only after the real outcome oracle is chosen.
    sendJson(res, 200, resolvePrediction(body.predictionId, body.resolvedOutcome));
  }, req, res);
}
