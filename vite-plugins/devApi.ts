import { fileURLToPath } from "node:url";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

const ROUTES = ["agent", "health", "leaderboard", "markets", "predictions", "profile", "resolve", "spar"];

/** Absolute, independent of Vite's configured `root` (oracle-frontend), so it always finds oracle-backend. */
const backendDir = fileURLToPath(new URL("../oracle-backend", import.meta.url));

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve(undefined);
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function createResAdapter(res: ServerResponse) {
  const adapter = {
    status(code: number) {
      res.statusCode = code;
      return adapter;
    },
    json(payload: unknown) {
      if (!res.getHeader("Content-Type")) res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(payload));
    },
    setHeader(name: string, value: string) {
      res.setHeader(name, value);
    },
    end() {
      res.end();
    },
  };
  return adapter;
}

/**
 * Vite has no built-in equivalent of Vercel's `api/` routing for local dev.
 * This mounts the same handler files Vercel would run in production (from
 * oracle-backend/) directly onto the Vite dev server's middleware stack, via
 * `ssrLoadModule` so the handlers' TS + relative imports into oracle-frontend/src
 * are transformed the same way the rest of the app is.
 */
export function devApiPlugin(): Plugin {
  let server: ViteDevServer;

  return {
    name: "oracle-dev-api",
    configureServer(devServer) {
      server = devServer;
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        const url = new URL(req.url, "http://localhost");
        const routeName = url.pathname.slice("/api/".length);
        if (!ROUTES.includes(routeName)) return next();

        try {
          const query: Record<string, string> = {};
          url.searchParams.forEach((value, key) => {
            query[key] = value;
          });

          const body =
            req.method === "POST" || req.method === "PUT" ? await readJsonBody(req) : undefined;

          const mod = await server.ssrLoadModule(path.join(backendDir, `${routeName}.ts`));
          const handler = mod.default as (
            req: { method?: string; query?: Record<string, string>; body?: unknown },
            res: ReturnType<typeof createResAdapter>,
          ) => Promise<void> | void;

          await handler({ method: req.method, query, body }, createResAdapter(res));
        } catch (error) {
          next(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
  };
}
