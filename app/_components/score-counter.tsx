"use client";

import { useState } from "react";

const buttonClass =
  "size-12 rounded-full bg-white/15 text-2xl font-semibold transition enabled:hover:bg-white/25 enabled:active:scale-95 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function ScoreCounter({
  team,
  className = "",
}: {
  team: string;
  className?: string;
}) {
  const [score, setScore] = useState(0);

  return (
    <section
      aria-label={team}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-widest text-white/80">
        {team}
      </h2>
      <output className="text-7xl font-bold tabular-nums sm:text-8xl">
        {score}
      </output>
      <div className="flex gap-3">
        <button
          type="button"
          className={buttonClass}
          aria-label={`Retirer un point à ${team}`}
          disabled={score === 0}
          onClick={() => setScore((s) => Math.max(0, s - 1))}
        >
          −
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label={`Ajouter un point à ${team}`}
          onClick={() => setScore((s) => s + 1)}
        >
          +
        </button>
      </div>
    </section>
  );
}
