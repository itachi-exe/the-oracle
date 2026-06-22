import { handle, methodNotAllowed, sendJson } from "./_http";
import { hasComputeConfig } from "./_env";
import type { ApiRequest } from "./_http";

export default function handler(req: ApiRequest, res: Parameters<typeof sendJson>[0]) {
  return handle(async () => {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

    sendJson(res, 200, {
      ok: true,
      mode: hasComputeConfig() ? "0g-configured" : "mock-backed",
    });
  }, req, res);
}
