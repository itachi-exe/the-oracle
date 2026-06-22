# The Oracle Backend

The backend is a Vercel-style serverless API under `oracle-backend/`. It is mock-backed by default so the frontend can exercise the product flow without inventing unconfirmed 0G constants.

## Local dev

Vite has no built-in equivalent of Vercel's `api/` routing. `vite-plugins/devApi.ts` mounts each handler in `oracle-backend/` onto the Vite dev server's middleware stack via `ssrLoadModule`, so `npm run dev` serves `/api/*` the same way Vercel would in production, no second process or port. The public URL prefix stays `/api/*` regardless of where the handler files physically live. The frontend (`oracle-frontend/src/lib/api.ts`) calls these routes directly with TanStack Query.

## Routes

- `POST /api/spar` runs one round of the sparring loop and returns a `SparResponse`: the agent's own genuine `agentOutcome`/`agentConfidence` for the round, plus the round's resulting `outcome`/`confidence` (equal to the agent's unless it's conceding to the user at the challenge cap), `reasoning`, `challengeIndex`, `concede`, `teeVerified`, and `provider`.
- `GET /api/agent?address=...` returns `{ exists, agent }` for the wallet's single agent.
- `POST /api/agent` creates the wallet's one agent (`{ address, name }`).
- `GET /api/profile?address=...` returns the wallet-bound profile.
- `POST /api/profile` upserts a profile.
- `GET /api/markets` returns the active market list, crypto/sports/culture, merged with live data (see below). `?category=` filters by category.
- `GET /api/predictions?address=...` returns locked predictions.
- `POST /api/predictions` mirrors the lock flow (full disagreement record + mode) and returns a mock `txHash` unless one was already produced on-chain.
- `GET /api/leaderboard` returns ranked entries by pair reputation, live off current agent state.
- `POST /api/resolve` is the manual/mock resolver for demo resolution (`{ predictionId, resolvedOutcome }`).
- `GET /api/health` reports mock-backed vs 0G-configured mode.

## Live market data

Markets are not static mocks. `oracle-backend/_liveData.ts` pulls from three free, keyless public sources, each cached server-side to stay well within free-tier limits:

- **CoinGecko** (crypto): real prices + 24h change for about 20 coins.
- **ESPN's public scoreboard JSON** (sports): real moneyline odds (de-vigged into an implied win probability) or live/final scores.
- **Apple's Marketing Tools chart feed** (culture): real current Top Albums chart position.

`oracle-backend/_liveMarkets.ts` turns a market's `live` binding into a `sentiment` value and a human-readable `liveNote`, only ever populated when the source actually answered. `oracle-backend/_dynamicMarkets.ts` additionally generates markets at request time: crypto coins beyond the two static ones, one market per real game that hasn't started yet, and one per real currently-charting album, so the catalog stays current without any invented entries. `oracle-backend/_state.ts#ensureDynamicMarkets` merges that batch into the in-memory store so locking and sparring can reference any of those market ids.

The agent's reasoning is grounded in this same data: `oracle-ai-agent/oracleAgent.ts` passes `liveNote` into both the LLM prompt and the local fallback reasoning, so an opening read can cite the real price/odds/chart position it just pulled.

## Real 0G Wiring

Do not guess chain IDs, RPC URLs, contract addresses, storage endpoints, stream IDs, model IDs, SDK versions, or broker APIs. Fill `.env` from `docs.0g.ai` and replace the TODO blocks in `oracle-backend/_state.ts`, `oracle-backend/profile.ts`, `oracle-backend/agent.ts`, and `oracle-backend/leaderboard.ts` as each integration is confirmed.

The browser should call `/api/spar`; it must not receive `OG_COMPUTE_BROKER_KEY` or any server-side signing material.

## Devnet Contracts

Contracts live in `oracle-smart-contract/`. See [oracle-smart-contract/README.md](oracle-smart-contract/README.md) for the full devnet flow.

- `AgentRegistry` mints one agent per wallet and holds pair reputation plus agent solo accuracy.
- `PredictionLock` records the append-only disagreement record per locked prediction.
- `Reputation` is the manual/mock resolver and scorekeeper.

Compile with:

```sh
npm run contracts:compile
```

Deploy to devnet with:

```sh
DEVNET_RPC_URL="..." DEPLOYER_PRIVATE_KEY="0x..." npm run contracts:deploy:devnet
```

The deployment script writes `oracle-smart-contract/deployments/devnet.json`. Copy those addresses into `VITE_AGENT_REGISTRY_ADDRESS`, `VITE_PREDICTION_LOCK_ADDRESS`, and `VITE_REPUTATION_ADDRESS`.

## Oracle Agent

The sparring agent lives in `oracle-ai-agent/oracleAgent.ts`, called from `oracle-backend/spar.ts`. Per round, it:

1. Matches the question to an active market (including dynamically generated ones) and attaches that market's live data.
2. Pulls the wallet's agent (name, style memory) when an address is provided.
3. In training mode, builds a strict prompt requiring JSON output (`outcome`, `confidence`, `reasoning`) with its own independent read, never a mirror of the user's stated take. In companionship mode, the agent doesn't contest; it just acknowledges the user's solo call.
4. Calls an OpenAI-compatible chat completions endpoint when `OG_COMPUTE_BASE_URL` and `OG_COMPUTE_MODEL` are configured. Right now that's DeepSeek (`https://api.deepseek.com`, model `deepseek-v4-flash`/`deepseek-v4-pro`), wired in as the live compute provider until 0G's real broker/TEE details are confirmed from docs.0g.ai. Any failure (non-2xx, empty content, a thrown network error) is logged to the server console and falls back to the local mock, so a misconfigured key or wrong model name is visible immediately rather than silently degrading.

`resolveRound()` is the single place that decides whether a round's resulting call holds the agent's stance or concedes to the user, separately from the agent's own genuine `agentOutcome`/`agentConfidence`, which are never overwritten by a forced concession.

If Compute is not configured or the provider fails, it returns a deterministic local fallback with `provider: "mock-agent"` and `teeVerified: false`. TEE verification is intentionally not faked, `provider: "deepseek"` only ever means "a real DeepSeek completion answered," never a 0G TEE attestation. The code has a TODO for routing through the confirmed `@0glabs/0g-serving-broker` flow and `processResponse(...)` once the exact SDK/API details are verified, at which point `teeVerified` can start reflecting a real attestation.
