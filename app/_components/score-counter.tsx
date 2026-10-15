import { CLAIM_KINDS, CLAIM_ORDER, type ClaimKind } from "../_lib/claims.ts";

const claimButtonClass =
  "flex items-center justify-between gap-2 rounded-2xl bg-white/15 px-3 py-3 text-sm font-semibold transition enabled:hover:bg-white/25 enabled:active:scale-95 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const adjustButtonClass =
  "size-9 rounded-full bg-white/10 text-lg font-semibold transition enabled:hover:bg-white/20 enabled:active:scale-95 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function ScoreCounter({
  team,
  score,
  onClaim,
  onAdjust,
  className = "",
}: {
  team: string;
  score: number | null;
  onClaim?: (kind: ClaimKind) => void;
  onAdjust?: (delta: 1 | -1) => void;
  className?: string;
}) {
  return (
    <section
      aria-label={team}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-white/80">
        {team}
      </h2>
      <output className="text-7xl font-bold tabular-nums sm:text-8xl">
        {score ?? "–"}
      </output>
      {onAdjust && (
        <div
          role="group"
          aria-label={`Corriger le score de ${team}`}
          className="flex gap-2"
        >
          <button
            type="button"
            className={adjustButtonClass}
            aria-label={`Retirer un point à ${team}`}
            disabled={!score}
            onClick={() => onAdjust(-1)}
          >
            −
          </button>
          <button
            type="button"
            className={adjustButtonClass}
            aria-label={`Ajouter un point à ${team}`}
            disabled={score === null}
            onClick={() => onAdjust(1)}
          >
            +
          </button>
        </div>
      )}
      {onClaim && (
        <div className="flex w-full max-w-48 flex-col gap-2">
          {CLAIM_ORDER.map((kind) => (
            <button
              key={kind}
              type="button"
              className={claimButtonClass}
              aria-label={`${CLAIM_KINDS[kind].label} pour ${team}`}
              disabled={score === null}
              onClick={() => onClaim(kind)}
            >
              <span>{CLAIM_KINDS[kind].label}</span>
              <span className="text-white/70">+{CLAIM_KINDS[kind].points}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
