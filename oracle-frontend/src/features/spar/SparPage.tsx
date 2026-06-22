import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowUp, ShieldCheck } from "lucide-react";
import { ChallengeCounter } from "./ChallengeCounter";
import { UserTakeForm } from "./UserTakeForm";
import { spar, fetchMarkets, fetchProfile } from "@/lib/api";
import { demoAddress } from "@/lib/mockData";
import { useWalletStore } from "@/features/wallet/useWalletStore";
import { useAgent } from "@/features/agent/useAgent";
import { useLockPrediction } from "@/features/predictions/useLockPrediction";
import { saveSparSession, loadSparSession } from "./sparSession";
import type { SparMode, SparringTurn } from "@/lib/types";

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const modes: Array<{ value: SparMode; label: string; desc: string }> = [
  { value: "companionship", label: "Companionship", desc: "Stake on your own read. Your agent doesn't contest." },
  { value: "training", label: "Training", desc: "You and your agent both stake. It argues its own side." },
];

export function SparPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const address = useWalletStore((s) => s.address) ?? demoAddress;
  const agent = useAgent(address);
  const profile = useQuery({ queryKey: ["profile", address], queryFn: () => fetchProfile(address) });
  const markets = useQuery({ queryKey: ["markets"], queryFn: fetchMarkets });

  const [mode, setMode] = useState<SparMode>("training");
  const [question, setQuestion] = useState("Will BTC close above $100k this Friday?");
  const [draft, setDraft] = useState("");
  const [marketId, setMarketId] = useState<string | null>(null);
  const [turns, setTurns] = useState<SparringTurn[]>([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [latestAgent, setLatestAgent] = useState<{ outcome: string; confidence: number } | null>(null);
  const [latestUser, setLatestUser] = useState<{ outcome: string; confidence: number } | null>(null);
  const [concluded, setConcluded] = useState(false);
  const [final, setFinal] = useState<{ outcome: string; confidence: number } | null>(null);

  const turn = useMutation({
    mutationFn: spar,
    onSuccess: (response) => {
      if (response.clarifying) {
        setTurns((t) => [
          ...t,
          {
            role: "agent",
            reasoning: response.reasoning,
            challengeIndex: 0,
            clarifying: true,
            suggestedMarkets: response.suggestedMarkets,
          },
        ]);
        return;
      }

      setMarketId(response.marketId);
      setChallengeIndex(response.challengeIndex);
      setLatestAgent({ outcome: response.agentOutcome, confidence: response.agentConfidence });
      setTurns((t) => [
        ...t,
        {
          role: "agent",
          outcome: response.outcome,
          confidence: response.confidence,
          reasoning: response.reasoning,
          challengeIndex: response.challengeIndex,
          teeVerified: response.teeVerified,
          concede: response.concede,
        },
      ]);
      if (response.concede) {
        setConcluded(true);
        setFinal({ outcome: response.outcome, confidence: response.confidence });
      }
    },
  });

  const lock = useLockPrediction();

  const presetMarket = searchParams.get("market");
  const presetOutcome = searchParams.get("outcome");

  useEffect(() => {
    if (!presetMarket || !presetOutcome || !markets.data) return;
    const market = markets.data.find((m) => m.id === presetMarket);
    if (!market) return;

    setQuestion(market.question);
    setTurns([{ role: "user", outcome: presetOutcome, confidence: 0.65, reasoning: "", challengeIndex: 0 }]);
    setLatestUser({ outcome: presetOutcome, confidence: 0.65 });
    turn.mutate({
      question: market.question,
      address,
      mode,
      marketId: market.id,
      challengeIndex: 0,
      userOutcome: presetOutcome,
      userConfidence: 0.65,
      userReasoning: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetMarket, presetOutcome, markets.data]);

  const resumeRequested = searchParams.get("resume") === "1";

  useEffect(() => {
    if (presetMarket || !resumeRequested) return;
    const saved = loadSparSession(address);
    if (!saved) return;

    setQuestion(saved.question);
    setMode(saved.mode);
    setMarketId(saved.marketId);
    setTurns(saved.turns);
    setChallengeIndex(saved.challengeIndex);
    setLatestAgent(saved.latestAgent);
    setLatestUser(saved.latestUser);
    setConcluded(saved.concluded);
    setFinal(saved.final);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeRequested, presetMarket]);

  const newChatRequested = searchParams.get("new") === "1";

  useEffect(() => {
    if (!newChatRequested) return;
    setQuestion("Will BTC close above $100k this Friday?");
    setMarketId(null);
    setTurns([]);
    setChallengeIndex(0);
    setLatestAgent(null);
    setLatestUser(null);
    setConcluded(false);
    setFinal(null);
  }, [newChatRequested]);

  useEffect(() => {
    if (turns.length === 0) return;
    saveSparSession(address, { question, mode, marketId, turns, challengeIndex, latestAgent, latestUser, concluded, final });
  }, [address, question, mode, marketId, turns, challengeIndex, latestAgent, latestUser, concluded, final]);

  const market = markets.data?.find((m) => m.id === marketId);

  function startSpar() {
    const text = draft.trim();
    if (!text || turn.isPending) return;
    setQuestion(text);
    setTurns((t) => [...t, { role: "user", outcome: undefined, confidence: undefined, reasoning: text, challengeIndex: 0 }]);
    setDraft("");
    turn.mutate({ question: text, address, mode, marketId: marketId ?? undefined, challengeIndex: 0 });
  }

  function pickSuggested(suggestion: { id: string; question: string }) {
    if (turn.isPending) return;
    setQuestion(suggestion.question);
    setTurns((t) => [
      ...t,
      { role: "user", outcome: undefined, confidence: undefined, reasoning: suggestion.question, challengeIndex: 0 },
    ]);
    turn.mutate({ question: suggestion.question, address, mode, marketId: suggestion.id, challengeIndex: 0 });
  }

  function submitTake(input: { outcome: string; confidence: number; reasoning: string }) {
    setLatestUser(input);
    setTurns((t) => [...t, { role: "user", ...input, challengeIndex }]);
    turn.mutate({
      question,
      address,
      mode,
      marketId: marketId ?? undefined,
      challengeIndex,
      userOutcome: input.outcome,
      userConfidence: input.confidence,
      userReasoning: input.reasoning,
    });
  }

  function lockFinal() {
    if (!marketId || !final || !latestAgent || !latestUser) return;
    lock.mutate(
      {
        address,
        marketId,
        mode,
        agentOutcome: latestAgent.outcome,
        agentConfidence: latestAgent.confidence,
        userOutcome: latestUser.outcome,
        outcome: final.outcome,
        confidenceAtLock: final.confidence,
      },
      { onSuccess: () => navigate("/app/predictions") },
    );
  }

  const hasStarted = turns.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-[18px] overflow-y-auto px-7 py-6">
        {!hasStarted && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <img src="/oracle-logo.png" alt="" className="size-11 object-contain" />
            <h1 className="font-serif text-[26px] italic text-ink-1">
              {getTimeGreeting()}, {profile.data?.displayName ?? "…"}
            </h1>
            <p className="font-mono text-[12.5px] text-ink-6">
              {agent.data?.agent
                ? `${agent.data.agent.name} · ${Math.round(agent.data.agent.pairReputation * 100)}% shared reputation · ${agent.data.agent.agentSoloResolved} solo calls resolved`
                : "Loading your agent…"}
            </p>

            <div className="mt-4 flex gap-2">
              {modes.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={`rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                    mode === m.value ? "border-line-7 bg-panel-3 text-ink-1" : "border-line-4 text-ink-6 hover:text-ink-2"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="max-w-[360px] text-[12.5px] leading-[1.5] text-ink-7">
              {modes.find((m) => m.value === mode)?.desc}
            </p>
          </div>
        )}

        {turns.map((t, i) =>
          t.role === "user" ? (
            <div
              key={i}
              className="max-w-[70%] self-end rounded-tl-[14px] rounded-tr-[14px] rounded-br-[4px] rounded-bl-[14px] border border-line-5 bg-panel-3 px-[15px] py-[11px] text-sm text-ink-2"
            >
              {t.outcome ? (
                <>
                  <span className="font-medium">{t.outcome}</span>
                  {t.confidence !== undefined && <span className="text-ink-5"> · {Math.round(t.confidence * 100)}%</span>}
                  {t.reasoning && <div className="mt-1 text-ink-4">{t.reasoning}</div>}
                </>
              ) : (
                t.reasoning
              )}
            </div>
          ) : t.clarifying ? (
            <div
              key={i}
              className="max-w-[88%] rounded-tl-[14px] rounded-tr-[14px] rounded-br-[4px] rounded-bl-[14px] border border-line-6 bg-panel-2 p-5"
            >
              <span className="mb-3 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] text-ink-3">
                <ShieldCheck className="size-[13px]" aria-hidden="true" />
                {agent.data?.agent?.name ?? "Your agent"}
              </span>
              <p className="mt-3 text-sm leading-[1.6] text-ink-4">{t.reasoning}</p>
              {t.suggestedMarkets && t.suggestedMarkets.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.suggestedMarkets.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => pickSuggested(m)}
                      disabled={turn.isPending}
                      className="cursor-pointer rounded-md border border-line-5 bg-panel-3 px-3 py-1.5 text-left text-[12.5px] text-ink-2 transition-colors duration-150 hover:border-line-7 hover:text-ink-1 disabled:opacity-50"
                    >
                      {m.question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              key={i}
              className="max-w-[88%] rounded-tl-[14px] rounded-tr-[14px] rounded-br-[4px] rounded-bl-[14px] border border-line-6 bg-panel-2 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] text-ink-3">
                  <ShieldCheck className="size-[13px]" aria-hidden="true" />
                  {agent.data?.agent?.name ?? "Your agent"}
                </span>
                {mode === "training" ? (
                  <ChallengeCounter challengeIndex={t.challengeIndex} concede={Boolean(t.concede)} />
                ) : (
                  <span className="rounded-full border border-line-7 bg-panel-3 px-2 py-0.5 font-mono text-[11px] text-ink-3">
                    companionship
                  </span>
                )}
              </div>
              <div className="mb-3 font-serif text-[22px] italic text-ink-1">{t.outcome}</div>
              <p className="mb-[14px] text-sm leading-[1.6] text-ink-4">{t.reasoning}</p>
              {t.confidence !== undefined && (
                <div className="flex items-center gap-3">
                  <span className="w-20 font-mono text-xs text-ink-6">Confidence</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-[5px] bg-panel-3">
                    <div className="h-full rounded-[5px] bg-ink-1" style={{ width: `${Math.round(t.confidence * 100)}%` }} />
                  </div>
                  <span className="font-mono text-[15px] font-medium text-ink-1">{Math.round(t.confidence * 100)}%</span>
                </div>
              )}
            </div>
          ),
        )}

        {turn.isPending && (
          <div className="flex items-center gap-2.5 text-ink-6">
            <span className="block size-[18px] animate-spin rounded-full border-2 border-line-3 border-t-ink-5" />
            <span className="font-mono text-[13px]">Verifying in enclave…</span>
          </div>
        )}

        {!turn.isPending && !concluded && hasStarted && market && (
          <UserTakeForm outcomes={market.outcomes} onSubmit={submitTake} disabled={turn.isPending} />
        )}

        {concluded && final && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={lock.isPending || lock.isSuccess}
              onClick={lockFinal}
              className="cursor-pointer rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground disabled:opacity-60"
            >
              {lock.isPending ? "Locking…" : lock.isSuccess ? "Locked ✓" : `Lock ${final.outcome} →`}
            </button>
            <span className="font-mono text-xs text-ink-6">{Math.round(final.confidence * 100)}% agreed confidence</span>
          </div>
        )}
      </div>

      {(!hasStarted || !marketId) && (
        <div className="px-7 pb-[22px] pt-4">
          <div className="mx-auto flex max-w-[760px] items-center gap-2.5 rounded-[10px] border border-line-5 bg-panel-2 py-2 pl-4 pr-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startSpar()}
              placeholder="Ask your agent about a market…"
              className="flex-1 bg-transparent text-sm text-ink-1 placeholder:text-ink-7 focus:outline-none"
              aria-label="Ask your agent"
            />
            <button
              type="button"
              onClick={startSpar}
              disabled={!draft.trim() || turn.isPending}
              className="flex size-[34px] shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40"
              aria-label="Send"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
