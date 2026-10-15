import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GameBoard } from "../../_components/game-board.tsx";
import { GameScene, SceneFallback } from "../../_components/game-scene.tsx";
import { PasswordGate } from "../../_components/password-gate.tsx";
import { getGameState, hasSession } from "../../_lib/games.ts";
import { sessionToken } from "../../_lib/session.ts";

export const metadata: Metadata = {
  title: "Gestion des points",
};

async function Manage({ gameId }: { gameId: string }) {
  const token = await sessionToken();
  const game = getGameState(gameId);
  if (!game) notFound();

  return (
    <GameScene gameId={gameId}>
      {hasSession(gameId, token) ? (
        <GameBoard name={game.name} editable />
      ) : (
        <PasswordGate name={game.name} phase={game.phase} />
      )}
    </GameScene>
  );
}

export default function ManagePage({ params }: PageProps<"/[game]/gestion">) {
  return (
    <Suspense fallback={<SceneFallback />}>
      {params.then(({ game }) => (
        <Manage gameId={game} />
      ))}
    </Suspense>
  );
}
