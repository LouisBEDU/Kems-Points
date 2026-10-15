"use client";

import { createContext, type ReactNode, use } from "react";
import { type LiveGame, useLiveGame } from "../_lib/use-live-game.ts";
import { WaveBackground } from "./wave-background.tsx";

const GameContext = createContext<LiveGame | null>(null);

export function useGame() {
  const game = use(GameContext);
  if (!game) {
    throw new Error("useGame doit être utilisé dans <GameScene>");
  }
  return game;
}

export function GameScene({
  gameId,
  children,
}: {
  gameId: string;
  children: ReactNode;
}) {
  const live = useLiveGame(gameId);

  return (
    <GameContext value={live}>
      <main>
        <WaveBackground
          started={live.game?.phase === "playing"}
          revealing={live.revealing}
          onRevealEnd={live.endReveal}
          takeover={live.claimView?.team ?? null}
        >
          {children}
        </WaveBackground>
      </main>
    </GameContext>
  );
}

export function SceneFallback() {
  return (
    <main>
      <WaveBackground />
    </main>
  );
}
