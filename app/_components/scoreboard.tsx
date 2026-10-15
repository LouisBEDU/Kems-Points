"use client";

import { changeScore } from "../_lib/actions.ts";
import { TEAMS } from "../_lib/config.ts";
import { useLiveScores } from "../_lib/use-live-scores.ts";
import { ScoreCounter } from "./score-counter.tsx";

const PLACEMENTS = [
  "sm:col-start-1 sm:row-start-1",
  "sm:col-start-3 sm:row-start-1",
];

export function Scoreboard({ editable = false }: { editable?: boolean }) {
  const scores = useLiveScores();

  return (
    <>
      {TEAMS.map((team, i) => (
        <ScoreCounter
          key={team}
          team={team}
          score={scores?.[i] ?? null}
          onChange={editable ? (delta) => changeScore(i, delta) : undefined}
          className={PLACEMENTS[i]}
        />
      ))}
    </>
  );
}
