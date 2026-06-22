import { getProfile, upsertProfile } from "./_state";
import { getQueryValue, handle, methodNotAllowed, requireBody, sendJson } from "./_http";
import type { ApiRequest } from "./_http";
import type { Profile } from "../oracle-frontend/src/lib/types";

export default function handler(req: ApiRequest<Profile>, res: Parameters<typeof sendJson>[0]) {
  return handle(async () => {
    if (req.method === "GET") {
      const address = getQueryValue(req.query?.address);
      if (!address) throw new Error("address query param is required");

      // TODO(confirm): read profile:${address} from 0G Storage KV when endpoint and streamId are set.
      sendJson(res, 200, getProfile(address));
      return;
    }

    if (req.method === "POST" || req.method === "PUT") {
      const profile = requireBody<Profile>(req.body, ["address", "displayName", "categories"]);

      // TODO(confirm): write profile:${address} to 0G Storage KV when SDK version and signer flow are confirmed.
      sendJson(res, 200, upsertProfile(profile));
      return;
    }

    methodNotAllowed(res, ["GET", "POST", "PUT"]);
  }, req, res);
}
