"use client";

import { correctScore, declareKems, resolveKems } from "../_lib/actions.ts";
import { APP_NAME, TEAMS } from "../_lib/config.ts";
import { teamNames, winnersOf } from "../_lib/teams.ts";
import { useGuardedAction } from "../_lib/use-guarded-action.ts";
import { ActionError } from "./action-error.tsx";
import { ClaimStage } from "./claim-stage.tsx";
import { EndGameButton } from "./end-game-button.tsx";
import { FinalScore } from "./final-score.tsx";
import { useGame } from "./game-scene.tsx";
import { ManageQrCode } from "./manage-qr-code.tsx";
import { PlayerNames } from "./player-names.tsx";
import { ScoreCounter } from "./score-counter.tsx";
import { TeamSetup } from "./team-setup.tsx";

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
  const { gameId, game, revealing, claimView, endClaim } = useGame();
  const scoring = useGuardedAction();
  const names = teamNames(game?.players ?? []);

  if (game && claimView) {
    return (
      <ClaimStage
        key={claimView.id}
        claim={claimView}
        score={game.scores[claimView.team]}
        teamNames={names}
        onResolve={
          editable ? (confirmed) => resolveKems(gameId, confirmed) : undefined
        }
        onDone={endClaim}
      />
    );
  }

  if (game?.phase === "finished") {
    return <FinalScore scores={game.scores} teamNames={names} />;
  }

  const phase = game?.phase;
  const preparing = phase === "waiting" || phase === "setup";
  const playing = phase === "playing" && !revealing;
  const contrast = phase === "playing" ? "" : "mix-blend-difference";
  const leaders = game ? winnersOf(game.scores) : [];
  const leader = leaders.length === 1 ? leaders[0] : null;

  return (
    <div
      className={`relative grid min-h-dvh grid-cols-2 ${playing ? "grid-rows-[auto_1fr]" : "grid-rows-1"} items-center gap-x-8 gap-y-10 px-4 py-10 text-white sm:grid-cols-[1fr_auto_1fr] sm:grid-rows-1`}
    >
      {!editable && phase === "setup" && game && (
        <PlayerNames gameId={gameId} players={game.players} />
      )}
      <div className="relative col-span-2 flex flex-col items-center gap-6 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <div className={`text-center ${contrast}`}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-white/80">{name}</p>
        </div>
        {editable && phase === "setup" && <TeamSetup />}
        {editable && playing && <EndGameButton gameId={gameId} />}
        {editable && <ActionError message={scoring.error} />}
        {!editable && qrUrl && preparing && (
          <ManageQrCode
            url={qrUrl}
            caption={
              phase === "setup"
                ? "Scanne pour rejoindre la partie"
                : "Scanne pour lancer la partie"
            }
          />
        )}
        {!editable && preparing && (
          <p className={`animate-pulse text-white/80 ${contrast}`}>
            {phase === "setup"
              ? "Composition des équipes…"
              : "En attente du premier scan…"}
          </p>
        )}
      </div>
      {playing &&
        game &&
        TEAMS.map((fallback, i) => (
          <ScoreCounter
            key={fallback}
            team={names[i]}
            score={game.scores[i]}
            leading={leader === i}
            onClaim={
              editable
                ? (kind) => scoring.run(() => declareKems(gameId, i, kind))
                : undefined
            }
            onAdjust={
              editable
                ? (delta) => scoring.run(() => correctScore(gameId, i, delta))
                : undefined
            }
            className={`animate-fade-in ${PLACEMENTS[i]}`}
          />
        ))}
    </div>
  );
}
