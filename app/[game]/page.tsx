import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { FullscreenButton } from "../_components/fullscreen-button.tsx";
import { GameBoard } from "../_components/game-board.tsx";
import { GameScene, SceneFallback } from "../_components/game-scene.tsx";
import { getGameState } from "../_lib/games.ts";
import { publicOrigin } from "../_lib/network.ts";

async function GameScreen({ gameId }: { gameId: string }) {
  const requestHeaders = await headers();
  const game = getGameState(gameId);
  if (!game) notFound();
  if (game.phase === "finished") redirect("/");

  const origin = publicOrigin(
    requestHeaders.get("host") ?? "localhost:3000",
    requestHeaders.get("x-forwarded-proto") ?? "http",
  );
  return (
    <GameScene gameId={gameId}>
      <FullscreenButton />
      <GameBoard name={game.name} qrUrl={`${origin}/${gameId}/gestion`} />
    </GameScene>
  );
}

export default function GamePage({ params }: PageProps<"/[game]">) {
  return (
    <Suspense fallback={<SceneFallback />}>
      {params.then(({ game }) => (
        <GameScreen gameId={game} />
      ))}
    </Suspense>
  );
}
