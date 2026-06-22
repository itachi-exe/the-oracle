const CAP = 3;

export function ChallengeCounter({ challengeIndex, concede }: { challengeIndex: number; concede: boolean }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-6">
      {Array.from({ length: CAP }).map((_, i) => {
        const round = i + 1;
        const reached = round <= challengeIndex;
        const isLast = reached && round === challengeIndex;
        return (
          <span
            key={round}
            className={
              reached
                ? isLast && concede
                  ? "rounded-full border border-success-border bg-success-bg px-2 py-0.5 text-success"
                  : "rounded-full border border-line-7 bg-panel-3 px-2 py-0.5 text-ink-2"
                : "rounded-full border border-line-4 px-2 py-0.5 text-ink-7"
            }
          >
            {round}/{CAP}
          </span>
        );
      })}
      {concede && <span className="ml-1 text-ink-5">agreed</span>}
    </div>
  );
}
