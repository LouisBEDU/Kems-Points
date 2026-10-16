"use client";

import { correctScore, declareKems, resolveKems } from "../_lib/actions.ts";
import { APP_NAME, MIN_TEAMS } from "../_lib/config.ts";
import { TEAM_BG, TEAM_ON, teamNames, winnersOf } from "../_lib/teams.ts";
import { useGuardedAction } from "../_lib/use-guarded-action.ts";
import { ZONE_CENTERS } from "../_lib/zones.ts";
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
const CARD_COLUMNS: Record<number, string> = {
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

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
  const leaders = game ? winnersOf(game.scores) : [];
  const leader = leaders.length === 1 ? leaders[0] : null;
  const teams = game?.players.length ?? MIN_TEAMS;
  const zoned = teams > MIN_TEAMS;
  const blended = phase === "waiting" || revealing;
  const contrast = blended
    ? "mix-blend-difference data-covered:mix-blend-normal"
    : "";
  const cards = zoned && editable && playing;

  const counter = (i: number, className = "") =>
    game && (
      <ScoreCounter
        key={i}
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
        className={`animate-fade-in [animation-delay:1s] ${className}`}
      />
    );

  return (
    <div
      className={
        cards
          ? "relative flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10 text-white"
          : `relative grid min-h-dvh grid-cols-2 ${playing ? "grid-rows-[auto_1fr]" : "grid-rows-1"} items-center gap-x-8 gap-y-10 px-4 py-10 text-white sm:grid-cols-[1fr_auto_1fr] sm:grid-rows-1`
      }
    >
      {!editable && phase === "setup" && game && (
        <PlayerNames gameId={gameId} players={game.players} />
      )}
      <div className="relative col-span-2 flex flex-col items-center gap-6 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <div data-reveal-cover className={`text-center ${contrast}`}>
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
          <p
            data-reveal-cover
            className={`animate-pulse text-white/80 ${contrast}`}
          >
            {phase === "setup"
              ? "Composition des équipes…"
              : "En attente du premier scan…"}
          </p>
        )}
      </div>
      {playing &&
        !zoned &&
        Array.from({ length: teams }, (_, i) => counter(i, PLACEMENTS[i]))}
      {cards && (
        <div
          className={`grid w-full max-w-5xl grid-cols-2 gap-4 ${CARD_COLUMNS[teams]}`}
        >
          {Array.from({ length: teams }, (_, i) =>
            counter(i, `rounded-3xl p-4 shadow-xl ${TEAM_BG[i]} ${TEAM_ON[i]}`),
          )}
        </div>
      )}
      {playing &&
        zoned &&
        !editable &&
        ZONE_CENTERS[teams].map(({ x, y }, i) => (
          <div
            key={i}
            className={`absolute w-[26vw] -translate-x-1/2 -translate-y-1/2 ${TEAM_ON[i]}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {counter(i)}
          </div>
        ))}
    </div>
  );
}
