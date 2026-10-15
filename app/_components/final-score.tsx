"use client";

import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../_lib/motion.ts";
import { winnersOf } from "../_lib/teams.ts";

const HOP = [
  { to: "-28%", duration: 320, ease: "outQuad" },
  { to: "0%", duration: 280, ease: "inQuad" },
  { to: "0%", duration: 200 },
];
const SQUASH = [
  { to: 1, duration: 600 },
  { to: 0.82, duration: 90, ease: "outQuad" },
  { to: 1, duration: 110, ease: "outQuad" },
];
const SWAY = [
  { to: -10, duration: 400, ease: "inOutSine" },
  { to: 10, duration: 800, ease: "inOutSine" },
  { to: 0, duration: 400, ease: "inOutSine" },
];

function DancingScore({ score }: { score: number }) {
  const digitsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const digits = digitsRef.current;
    if (!digits || prefersReducedMotion()) return;

    const dance = animate(digits.querySelectorAll("span"), {
      y: [...HOP, ...HOP],
      scaleY: [...SQUASH, ...SQUASH],
      rotate: SWAY,
      delay: stagger(120),
      loop: true,
    });

    return () => {
      dance.cancel();
    };
  }, [score]);

  return (
    <output className="block pt-8 text-[9rem] font-black leading-none tabular-nums sm:text-[14rem]">
      <span className="sr-only">{score}</span>
      <span ref={digitsRef} aria-hidden className="flex">
        {[...String(score)].map((digit, i) => (
          <span key={i} className="inline-block origin-bottom">
            {digit}
          </span>
        ))}
      </span>
    </output>
  );
}

export function FinalScore({
  scores,
  teamNames,
}: {
  scores: number[];
  teamNames: string[];
}) {
  const winners = winnersOf(scores);
  const losers = scores.flatMap((_, team) =>
    winners.includes(team) ? [] : [team],
  );
  const tie = winners.length > 1;

  return (
    <div className="flex min-h-dvh animate-fade-in flex-col items-center justify-center gap-10 px-4 py-10 text-center text-white">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          {tie ? "Fin de partie" : teamNames[winners[0]]}
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">
          {tie ? "Égalité !" : "Victoire !"}
        </h1>
      </div>
      <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
        {winners.map((team) => (
          <section
            key={team}
            aria-label={teamNames[team]}
            className="flex flex-col items-center"
          >
            {tie && (
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/80">
                {teamNames[team]}
              </h2>
            )}
            <DancingScore score={scores[team]} />
          </section>
        ))}
      </div>
      {losers.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {losers.map((team) => (
            <li key={team} className="flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-widest text-white/70">
                {teamNames[team]}
              </span>
              <span className="text-3xl font-bold tabular-nums">
                {scores[team]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
