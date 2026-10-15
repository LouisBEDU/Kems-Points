"use client";

import { changeScore } from "../_lib/actions.ts";
import { APP_NAME, TEAMS } from "../_lib/config.ts";
import { useGame } from "./game-scene.tsx";
import { ManageQrCode } from "./manage-qr-code.tsx";
import { ScoreCounter } from "./score-counter.tsx";

const PLACEMENTS = [
  "sm:col-start-1 sm:row-start-1",
  "sm:col-start-3 sm:row-start-1",
];

export function GameBoard({
  name,
  qrUrl,
  editable = false,
}: {
  name: string;
  qrUrl?: string;
  editable?: boolean;
}) {
  const { gameId, game, revealing } = useGame();
  const waiting = game?.started === false;
  const playing = game?.started === true && !revealing;
  const contrast = game?.started ? "" : "mix-blend-difference";

  return (
    <div
      className={`grid min-h-dvh grid-cols-2 ${playing ? "grid-rows-[auto_1fr]" : "grid-rows-1"} items-center gap-x-8 gap-y-10 px-4 py-10 text-white sm:grid-cols-[1fr_auto_1fr] sm:grid-rows-1`}
    >
      <div className="col-span-2 flex flex-col items-center gap-6 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <div className={`text-center ${contrast}`}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-white/80">{name}</p>
        </div>
        {qrUrl && waiting && <ManageQrCode url={qrUrl} />}
        {waiting && (
          <p className={`animate-pulse text-white/80 ${contrast}`}>
            En attente du premier scan…
          </p>
        )}
      </div>
      {playing &&
        TEAMS.map((team, i) => (
          <ScoreCounter
            key={team}
            team={team}
            score={game.scores[i]}
            onChange={
              editable ? (delta) => changeScore(gameId, i, delta) : undefined
            }
            className={`animate-fade-in ${PLACEMENTS[i]}`}
          />
        ))}
    </div>
  );
}
