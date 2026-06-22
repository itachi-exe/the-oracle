import { createAgent, getAgent } from "./_state";
import { getQueryValue, handle, methodNotAllowed, requireBody, sendJson } from "./_http";
import type { ApiRequest } from "./_http";

type CreateAgentRequest = { address: string; name: string };

export default function handler(req: ApiRequest<CreateAgentRequest>, res: Parameters<typeof sendJson>[0]) {
  return handle(async () => {
    if (req.method === "GET") {
      const address = getQueryValue(req.query?.address);
      if (!address) throw new Error("address query param is required");

      const agent = getAgent(address);
      // TODO(confirm): read agent:${address} from 0G Storage KV when endpoint and streamId are set.
      sendJson(res, 200, { exists: Boolean(agent), agent: agent ?? null });
      return;
    }

    if (req.method === "POST") {
      const body = requireBody<CreateAgentRequest>(req.body, ["address", "name"]);

      // TODO(confirm): call AgentRegistry.createAgent through the wallet client from the frontend,
      // then mirror here so the UI works before chain config is confirmed.
      sendJson(res, 201, createAgent(body.address, body.name));
      return;
    }

    methodNotAllowed(res, ["GET", "POST"]);
  }, req, res);
}
