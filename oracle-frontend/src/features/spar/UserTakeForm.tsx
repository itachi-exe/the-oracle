import { useState } from "react";

function outcomeClasses(o: string, selected: boolean) {
  if (o.toLowerCase() === "yes") {
    return selected
      ? "border-success bg-success text-app-canvas"
      : "border-success bg-panel-2 text-success hover:bg-panel-3";
  }
  if (o.toLowerCase() === "no") {
    return selected
      ? "border-danger bg-danger text-app-canvas"
      : "border-danger bg-panel-2 text-danger hover:bg-panel-3";
  }
  return selected ? "border-line-7 bg-panel-2 text-ink-1" : "border-line-4 text-ink-5 hover:text-ink-2";
}

export function UserTakeForm({
  outcomes,
  onSubmit,
  disabled,
}: {
  outcomes: string[];
  onSubmit: (input: { outcome: string; confidence: number; reasoning: string }) => void;
  disabled?: boolean;
}) {
  const [outcome, setOutcome] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(65);
  const [reasoning, setReasoning] = useState("");

  return (
    <div className="rounded-tl-[14px] rounded-tr-[14px] rounded-br-[4px] rounded-bl-[14px] border border-line-5 bg-panel-3 p-4">
      <div className="mb-3 text-[13px] text-ink-4">What's your take?</div>
      <div className="mb-3 flex gap-2">
        {outcomes.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOutcome(o)}
            className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-[13px] font-medium transition-colors duration-150 ${outcomeClasses(o, outcome === o)}`}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-xs text-ink-6">Confidence</span>
        <input
          type="range"
          min={1}
          max={99}
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="flex-1 accent-[var(--color-ink-1)]"
        />
        <span className="w-10 text-right font-mono text-xs text-ink-2">{confidence}%</span>
      </div>
      <textarea
        value={reasoning}
        onChange={(e) => setReasoning(e.target.value)}
        placeholder="Why? (optional, but your agent will push back harder without it)"
        rows={2}
        className="mb-3 w-full resize-none rounded-md border border-line-5 bg-panel-2 px-3 py-2 text-[13px] text-ink-1 placeholder:text-ink-7 focus:outline-none"
      />
      <button
        type="button"
        disabled={!outcome || disabled}
        onClick={() => outcome && onSubmit({ outcome, confidence: confidence / 100, reasoning })}
        className="w-full cursor-pointer rounded-md bg-primary py-2 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
      >
        Submit my take
      </button>
    </div>
  );
}
