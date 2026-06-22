# The Oracle Contracts

Devnet contract layer for The Oracle.

## Contracts

- `AgentRegistry.sol`: mints one agent per wallet on first connect. Holds the agent's name, the shared pair-reputation score (starts at the 50% coin-flip line, `pairReputationBps = 5000`), and the agent's own solo-accuracy counters. Reputation/solo-accuracy writes are restricted to the `Reputation` contract.
- `PredictionLock.sol`: append-only prediction registry. Locks one prediction per user per market, carrying the full disagreement record: the agent's own outcome and confidence, the user's own outcome, and the final agreed outcome/confidence that actually got locked. No edit/delete path exists. Requires `agentRegistry` to be wired and the caller to already have an agent there, this is what stops a prediction from a wallet with no agent from later bricking resolution for the whole market. Also refuses new predictions on a market once `Reputation` has locked it for resolution.
- `Reputation.sol`: manual/mock resolver and scorekeeper. Resolution is two-phase: `resolveMarket` cheaply decides the winning outcome and locks the market against new predictions, then `scoreNextBatch` scores a bounded batch of predictions at a time (applying the confidence-weighted reputation delta, amplified 1.5x on override, and the agent's solo-accuracy score) so a market can never become unresolvable from having too many predictions. This is intentionally not represented as trustless outcome resolution yet.

## Devnet Flow

1. Compile:

   ```sh
   npm run contracts:compile
   ```

2. Deploy to an EVM devnet:

   ```sh
   DEVNET_RPC_URL="..." DEPLOYER_PRIVATE_KEY="0x..." npm run contracts:deploy:devnet
   ```

   This deploys `AgentRegistry`, `PredictionLock`, and `Reputation`, then wires them together (`PredictionLock.setReputationContract`/`setAgentRegistry`, `Reputation.setPredictionLock`/`setAgentRegistry`, `AgentRegistry.setReputationContract`) when the owner is the deploying wallet.

3. Copy the resulting addresses from `oracle-smart-contract/deployments/devnet.json` into `.env`:

   ```sh
   VITE_AGENT_REGISTRY_ADDRESS=
   VITE_PREDICTION_LOCK_ADDRESS=
   VITE_REPUTATION_ADDRESS=
   ```

## Frontend Wiring

`oracle-frontend/src/lib/chain/contracts.ts` calls `createAgentOnChain`/`lockPredictionOnChain` directly through viem once `VITE_OG_CHAIN_ID`/`VITE_OG_RPC_URL`/`VITE_AGENT_REGISTRY_ADDRESS`/`VITE_PREDICTION_LOCK_ADDRESS`/`VITE_REPUTATION_ADDRESS` are set and the user connected through a real injected wallet (not the demo mock path). `oracle-frontend/src/features/predictions/useLockPrediction.ts` is the single call site every lock button goes through, it tries the on-chain path first and falls back to the `/api/predictions` backend mirror otherwise, so the UI flow is identical either way.

## Frontend Encoding

The frontend market id string, such as `btc-100k`, should be encoded as:

```ts
keccak256(toBytes(market.id))
```

`oracle-frontend/src/lib/chain/contracts.ts#marketIdToBytes32` does this. Outcome strings are passed as plain `string` params to `lockPrediction` and hashed on-chain with `keccak256(bytes(outcome))` for comparison against the resolved outcome.

## Resolution

For devnet, the resolver wallet decides the outcome:

```solidity
Reputation.resolveMarket(marketId, winningOutcome)
```

This is O(1): it hashes `winningOutcome`, marks the market resolved, and calls `PredictionLock.lockMarketForResolution(marketId)` in the same transaction so nobody can sneak in a "free win" prediction once the outcome is known.

Then anyone (no access control, the outcome is already fixed so this step is just deterministic bookkeeping) drives scoring forward in batches:

```solidity
Reputation.scoreNextBatch(marketId, maxCount)
```

Call it repeatedly with a safe `maxCount` until it stops advancing `scoredCount` — each call marks up to `maxCount` not-yet-scored predictions `Won`/`Lost` on `PredictionLock`, applies the confidence-weighted reputation delta on `AgentRegistry`, and scores each prediction's agent solo call independently. `Reputation.isFullyScored(marketId)` reports whether every prediction on the market has been processed. Replace `resolver` with a real oracle later, the scoring math and batching don't need to change.

## Known limitations (devnet-stage, by design)

- **No correction path for a wrong `resolveMarket` call.** `marketResolved[marketId]` is permanent once set. A resolver mistake (wrong `winningOutcome`) can't be undone on-chain. Acceptable since the resolver is explicitly a manual/mock stand-in for a future trustless oracle, not real outcome resolution.
- **Single EOA `owner`/`resolver`, no multi-sig or timelock.** Centralization is accepted at this stage; assigning a Safe/multi-sig address as `owner`/`resolver` at deploy time (rather than a code change) is the realistic next step before any real value is at stake.
