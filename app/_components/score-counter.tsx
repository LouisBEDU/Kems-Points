import { CLAIM_KINDS, CLAIM_ORDER, type ClaimKind } from "../_lib/claims.ts";
import { LeaderCrown } from "./leader-crown.tsx";

const claimButtonClass =
  "flex items-center justify-between gap-2 rounded-2xl bg-white/15 px-3 py-3 text-sm font-semibold transition enabled:hover:bg-white/25 enabled:active:scale-95 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const adjustButtonClass =
  "size-9 rounded-full bg-white/10 text-lg font-semibold transition enabled:hover:bg-white/20 enabled:active:scale-95 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function ScoreCounter({
  team,
  score,
  leading = false,
  onClaim,
  onAdjust,
  className = "",
}: {
  team: string;
  score: number | null;
  leading?: boolean;
  onClaim?: (kind: ClaimKind) => void;
  onAdjust?: (delta: 1 | -1) => void;
  className?: string;
}) {
  const digits = score === null ? "–" : String(score);

  return (
    <section
      aria-label={team}
      className={`@container flex flex-col items-center gap-4 ${className}`}
    >
      <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-white/80">
        {team}
      </h2>
      <output className="relative mt-[0.3em] text-[clamp(4.5rem,55cqw,16rem)] font-bold leading-none tabular-nums [text-box:trim-both_cap_alphabetic]">
        {digits}
        {leading && score !== null && <LeaderCrown digit={digits.slice(-1)} />}
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
