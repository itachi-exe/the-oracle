# The Oracle

An AI prediction agent you own, not one you share. Built on the 0G stack for **Zero Cup 2026**.

Every wallet mints its own personal agent. Before you lock a prediction, your agent gives its
own independent read (its own outcome, its own confidence, its own reasoning) and pushes back
on yours for up to three rounds before conceding. Whatever you settle on locks on-chain together
with the full disagreement record: your agent's call, your call, and the final agreed call. One
shared "pair reputation" tracks how good the two of you are together; a separate "agent solo
accuracy" tracks the agent's own track record independent of what you decided to lock.

## Quick start

```sh
npm install
npm run dev
```

The app and its API both run from `npm run dev` (see [BACKEND.md](BACKEND.md): a Vite plugin
mounts `oracle-backend/*.ts` on the dev server, so there's no second process). Open the printed
local URL, connect a wallet (a mock wallet works with no setup), and spar.

```sh
npm run build      # production build
npm run lint        # tsc --noEmit
```

## What's real right now

- **Markets**: 40+ live markets across crypto, sports, and culture, sourced from free, keyless
  public APIs (CoinGecko for prices, ESPN's public scoreboard for real sportsbook odds, Apple's
  Marketing Tools chart feed for culture). See [oracle-backend/_liveData.ts](oracle-backend/_liveData.ts),
  [oracle-backend/_liveMarkets.ts](oracle-backend/_liveMarkets.ts), and
  [oracle-backend/_dynamicMarkets.ts](oracle-backend/_dynamicMarkets.ts). A market only shows a
  `LIVE` badge when a real number actually backed it that request, nothing is padded with
  invented data.
- **Agent reasoning**: grounded in that same live data; the agent's opening read cites the real
  price/odds/chart position it just pulled.
- **Sparring loop, reputation math, and the on-chain disagreement record**: fully implemented
  end to end, demo-backed by default (see "What's still mocked" below).

## What's still mocked or pluggable by design

- **0G Compute**: the agent calls an OpenAI-compatible endpoint when `OG_COMPUTE_BASE_URL` /
  `OG_COMPUTE_MODEL` are set, with a deterministic local fallback (`provider: "mock-agent"`)
  otherwise. TEE verification is not faked: it stays `false` until the real
  `@0glabs/0g-serving-broker` flow is wired in.
- **0G Chain / contracts**: the three Solidity contracts (below) are written and compile cleanly,
  but predictions lock through a backend mirror (`/api/predictions`) unless real chain config and
  a real injected wallet are present, in which case `oracle-frontend/src/lib/chain/contracts.ts`
  writes on-chain first and mirrors after.
- **0G Storage**: profile/agent reads and writes go through the in-memory demo store
  (`oracle-backend/_state.ts`) until a confirmed KV endpoint/stream ID replace the TODOs in
  `oracle-backend/profile.ts` and `oracle-backend/agent.ts`.
- **Resolution**: `/api/resolve` and `Reputation.resolveMarket` are an intentionally manual/mock
  resolver so the loop is demoable without a trustless oracle. Swapping in a real oracle later
  doesn't require touching the scoring math.

None of the above chain IDs, RPC URLs, contract addresses, or storage endpoints are guessed.
They stay blank in [.env.example](.env.example) until confirmed from docs.0g.ai.

## Project layout

- `oracle-frontend/` — React 19 + Vite + Tailwind v4 frontend (Vite's `root`). `src/features/` is
  organized by product area (spar, logger, leaderboard, predictions, agent, wallet, landing, docs).
- `oracle-backend/` — Vercel-style serverless handlers, mock-backed by default. See
  [BACKEND.md](BACKEND.md).
- `oracle-ai-agent/` — the sparring agent's reasoning/prompting logic, called by
  `oracle-backend/spar.ts`.
- `oracle-smart-contract/` — Solidity devnet contracts, compile/deploy scripts, and build
  artifacts. See [oracle-smart-contract/README.md](oracle-smart-contract/README.md).
- `vite-plugins/` — the dev-only plugin that mounts `oracle-backend/*.ts` onto Vite's dev server
  so `/api/*` works locally with no second process.

## Smart contracts

```sh
npm run contracts:compile
DEVNET_RPC_URL="..." DEPLOYER_PRIVATE_KEY="0x..." npm run contracts:deploy:devnet
```

See [oracle-smart-contract/README.md](oracle-smart-contract/README.md) for the full devnet flow
and what each of `AgentRegistry.sol`, `PredictionLock.sol`, and `Reputation.sol` does.

## Docs

In-app product documentation lives at `/docs` (see
[oracle-frontend/src/features/docs/DocsPage.tsx](oracle-frontend/src/features/docs/DocsPage.tsx))
and covers the ownership model, the sparring loop, the confidence-weighted scoring math, and the
architecture in more depth than this file.
