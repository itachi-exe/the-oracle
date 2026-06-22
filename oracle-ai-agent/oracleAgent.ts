import { getComputeConfig, hasComputeConfig } from "../oracle-backend/_env";
import { ensureDynamicMarkets, findMarketForQuestion, getAgent, suggestMarkets } from "../oracle-backend/_state";
import { attachLiveData } from "../oracle-backend/_liveMarkets";
import type { Market, SparRequest, SparResponse } from "../oracle-frontend/src/lib/types";

/** Hard cap on agent pushbacks in training mode — see project knowledge §0.5 and §3. */
const CHALLENGE_CAP = 3;
/** Companionship mode never contests — it accepts your stated take on the first round. */
const COMPANIONSHIP_CAP = 1;

function capFor(mode: SparRequest["mode"]) {
  return mode === "companionship" ? COMPANIONSHIP_CAP : CHALLENGE_CAP;
}

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

const systemPrompt = `You are a user's personal AI prediction agent on the 0G stack, sparring with them before they lock a call together.

Rules:
- You ALWAYS take your own position first — outcome, confidence, reasoning. You are not a co-signer; mirroring the user's pick without your own independent read is exactly the decorative AI this product exists to avoid.
- Give YOUR OWN genuine read every round, even on your final round. The server — not you — decides whether your round's call holds or defers to the user once the 3-challenge cap is hit, using your stated outcome/confidence.
- Confidence is calibrated conviction from 0 to 1, never a guarantee.
- Never claim resolution is trustless unless the resolver data says so.
- Remind the user, when relevant, that they stake reputation, not capital.

Return only valid JSON with this shape:
{
  "outcome": "your own independent read — must exactly match one of the market's outcome strings",
  "confidence": 0.0,
  "reasoning": "2-4 sentences; engage with the user's stated take if they gave one"
}`;

export async function runSparringAgent(input: SparRequest): Promise<SparResponse> {
  await ensureDynamicMarkets();
  const matched = findMarketForQuestion(input.question, input.marketId);
  if (!matched) return clarifyingResponse(input);

  const market = await attachLiveData(matched);
  const agent = input.address ? getAgent(input.address) : undefined;

  if (hasComputeConfig()) {
    const response = await askComputeProvider(input, market, agent?.name);
    if (response) return response;
  }

  return localSparringTurn(input, market);
}

/**
 * Nothing matched a real market — never a dead end. Always hands back real, pickable markets
 * instead of just apologizing, so there's always a concrete next step.
 */
function clarifyingResponse(input: SparRequest): SparResponse {
  return {
    marketId: "",
    category: "crypto",
    mode: input.mode,
    agentOutcome: "",
    agentConfidence: 0,
    outcome: "",
    confidence: 0,
    reasoning: "I don't have a market for that yet. Pick one below, or ask about something specific.",
    challengeIndex: 0,
    concede: false,
    teeVerified: false,
    provider: "mock-agent",
    clarifying: true,
    suggestedMarkets: suggestMarkets(4),
  };
}

/**
 * Takes the agent's own genuine outcome/confidence for this round and decides the
 * resulting call: holds the agent's read unless the user already agrees, or the
 * 3-challenge cap forces a concession to the user's stated outcome.
 */
function resolveRound(
  agentOutcome: string,
  agentConfidence: number,
  input: SparRequest,
): { outcome: string; confidence: number; concede: boolean } {
  const atCap = input.challengeIndex >= capFor(input.mode) - 1;

  if (!input.userOutcome) {
    return { outcome: agentOutcome, confidence: agentConfidence, concede: false };
  }

  const aligned = input.userOutcome === agentOutcome;
  if (aligned || atCap) {
    return {
      outcome: aligned ? agentOutcome : input.userOutcome,
      confidence: aligned ? Math.max(agentConfidence, input.userConfidence ?? agentConfidence) : input.userConfidence ?? agentConfidence,
      concede: true,
    };
  }

  return { outcome: agentOutcome, confidence: agentConfidence, concede: false };
}

async function askComputeProvider(
  input: SparRequest,
  market: Market,
  agentName?: string,
): Promise<SparResponse | null> {
  const config = getComputeConfig();
  if (!config.baseUrl || !config.model) return null;

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.brokerKey ? { Authorization: `Bearer ${config.brokerKey}` } : {}),
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: buildSparPrompt(input, market, agentName) },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[oracle-ai-agent] compute provider returned ${response.status}: ${await response.text()}`);
      return null;
    }

    const completion = (await response.json()) as ChatCompletionResponse;
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      // DeepSeek's JSON mode documents this as a known, occasional failure mode — not a bug here.
      console.error("[oracle-ai-agent] compute provider returned no content, falling back to local reasoning");
      return null;
    }

    const object = JSON.parse(content) as Record<string, unknown>;
    const agentOutcome =
      typeof object.outcome === "string" && market.outcomes.includes(object.outcome)
        ? object.outcome
        : pickOutcome(input.question, market);
    const agentConfidence = normalizeConfidence(object.confidence);
    const reasoning = typeof object.reasoning === "string" ? object.reasoning : "The model returned an incomplete rationale.";
    const round = resolveRound(agentOutcome, agentConfidence, input);

    // TODO(confirm): once 0G Compute's broker/TEE details are confirmed from docs.0g.ai, route
    // through @0glabs/0g-serving-broker so teeVerified/provider can reflect a real attestation.
    // Today this calls DeepSeek's OpenAI-compatible API directly as the configured provider.
    return {
      marketId: market.id,
      category: market.category,
      mode: input.mode,
      agentOutcome,
      agentConfidence,
      outcome: round.outcome,
      confidence: round.confidence,
      reasoning,
      challengeIndex: input.challengeIndex + 1,
      concede: round.concede,
      teeVerified: false,
      provider: "deepseek",
    };
  } catch (error) {
    console.error("[oracle-ai-agent] compute provider call failed:", error);
    return null;
  }
}

function buildSparPrompt(input: SparRequest, market: Market, agentName?: string) {
  const sentiment = market.sentiment === undefined ? "unknown" : `${Math.round(market.sentiment * 100)}%`;
  const liveLine = market.isLive && market.liveNote ? `\nLive data right now: ${market.liveNote} (use this, it's real, not a guess).` : "";
  const userTake = input.userOutcome
    ? `The user's stated take: ${input.userOutcome} at ${Math.round((input.userConfidence ?? 0.5) * 100)}% confidence. Their reasoning: "${input.userReasoning ?? "(none given)"}"`
    : "The user hasn't stated their own take yet — this is your opening read.";
  const modeNote =
    input.mode === "companionship"
      ? "Mode: companionship. You don't contest the user here — this is their solo call. Keep your own read to yourself unless asked; just be supportive."
      : `Mode: training. This is challenge round ${input.challengeIndex + 1} of ${CHALLENGE_CAP}. Give your own independent read regardless of round number — the server decides whether it holds.`;

  return `You are named "${agentName ?? "the agent"}".

Question: ${input.question}

Matched market:
- id: ${market.id}
- category: ${market.category}
- outcomes: ${market.outcomes.join(" | ")}
- community sentiment: ${sentiment}
- closesAt: ${new Date(market.closesAt).toISOString()}${liveLine}

${userTake}

${modeNote}`;
}

function localSparringTurn(input: SparRequest, market: Market): SparResponse {
  const agentOutcome = pickOutcome(input.question, market);
  const agentConfidence = Math.min(0.85, agentBaseConfidence(market) + (input.challengeIndex > 0 ? 0.04 : 0));
  const round = resolveRound(agentOutcome, agentConfidence, input);

  return {
    marketId: market.id,
    category: market.category,
    mode: input.mode,
    agentOutcome,
    agentConfidence,
    outcome: round.outcome,
    confidence: round.confidence,
    reasoning: buildLocalReasoning(input, market, agentOutcome, round),
    challengeIndex: input.challengeIndex + 1,
    concede: round.concede,
    teeVerified: false,
    provider: "mock-agent",
  };
}

function buildLocalReasoning(
  input: SparRequest,
  market: Market,
  agentOutcome: string,
  round: { outcome: string; concede: boolean },
) {
  const liveTag = market.isLive && market.liveNote ? ` (live: ${market.liveNote})` : "";

  if (input.mode === "companionship") {
    if (!input.userOutcome) return `This one's yours to call${liveTag}. What's your read?`;
    return round.outcome === agentOutcome
      ? `Locking in ${round.outcome}. That lines up with how I'd have read it too.`
      : `Locking in ${round.outcome}, your call. I'd have leaned ${agentOutcome}, but this one's on your own read.`;
  }

  if (!input.userOutcome) {
    return `My opening read: ${agentOutcome}${liveTag}. ${market.outcomes.join(" vs ")} on ${Math.round((market.sentiment ?? 0.5) * 100)}% sentiment. What's your take?`;
  }

  const aligned = input.userOutcome === agentOutcome;
  if (aligned) {
    return `We're aligned on ${round.outcome}. Good, that's not always how this goes.`;
  }

  if (round.concede) {
    return `Three rounds is the cap, so I'm locking in your read of ${round.outcome} this time. Mine was still ${agentOutcome}, for the record.`;
  }

  return `I hear the case for ${input.userOutcome}, but I'm holding ${agentOutcome}. One more round before the cap. Convince me, or we go with your call.`;
}

function normalizeConfidence(value: unknown) {
  const confidence = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(confidence)) return 0.5;
  return Math.max(0, Math.min(1, confidence));
}

function pickOutcome(question: string, market: Market) {
  const lower = question.toLowerCase();
  const explicit = market.outcomes.find((outcome) => lower.includes(outcome.toLowerCase()));
  if (explicit) return explicit;
  if ((market.sentiment ?? 0.5) < 0.5 && market.outcomes[1]) return market.outcomes[1];
  return market.outcomes[0];
}

function agentBaseConfidence(market: Market) {
  const sentimentDistance = Math.abs((market.sentiment ?? 0.5) - 0.5);
  const base = market.category === "sports" ? 0.62 : market.category === "crypto" ? 0.56 : 0.52;
  return Math.min(0.82, Number((base + sentimentDistance * 0.45).toFixed(2)));
}
