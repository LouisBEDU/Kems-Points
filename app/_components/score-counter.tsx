const buttonClass =
  "size-16 rounded-full bg-white/15 text-3xl font-semibold transition enabled:hover:bg-white/25 enabled:active:scale-95 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function ScoreCounter({
  team,
  score,
  onChange,
  className = "",
}: {
  team: string;
  score: number | null;
  onChange?: (delta: 1 | -1) => void;
  className?: string;
}) {
  return (
    <section
      aria-label={team}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-widest text-white/80">
        {team}
      </h2>
      <output className="text-7xl font-bold tabular-nums sm:text-8xl">
        {score ?? "–"}
      </output>
      {onChange && (
        <div className="flex gap-3">
          <button
            type="button"
            className={buttonClass}
            aria-label={`Retirer un point à ${team}`}
            disabled={!score}
            onClick={() => onChange(-1)}
          >
            −
          </button>
          <button
            type="button"
            className={buttonClass}
            aria-label={`Ajouter un point à ${team}`}
            disabled={score === null}
            onClick={() => onChange(1)}
          >
            +
          </button>
        </div>
      )}
    </section>
  );
}
