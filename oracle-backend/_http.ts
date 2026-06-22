type ApiResponse = {
  status(code: number): ApiResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
  end(): void;
};

export type ApiRequest<T = unknown> = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: T;
};

export type ApiHandler<T = unknown> = (req: ApiRequest<T>, res: ApiResponse) => void | Promise<void>;

export function sendJson(res: ApiResponse, status: number, body: unknown) {
  res.status(status).json(body);
}

export function methodNotAllowed(res: ApiResponse, allowed: string[]) {
  res.setHeader("Allow", allowed.join(", "));
  sendJson(res, 405, { error: "method_not_allowed", allowed });
}

export function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function requireBody<T extends object>(body: unknown, keys: (keyof T)[]) {
  if (!body || typeof body !== "object") {
    throw new Error("Request body is required");
  }

  for (const key of keys) {
    if (!(key in body)) throw new Error(`Missing field: ${String(key)}`);
  }

  return body as T;
}

export async function handle(handler: ApiHandler, req: ApiRequest, res: ApiResponse) {
  try {
    await handler(req, res);
  } catch (error) {
    sendJson(res, 400, {
      error: "bad_request",
      message: error instanceof Error ? error.message : "Unexpected request failure",
    });
  }
}
