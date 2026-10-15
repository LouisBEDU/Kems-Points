"use client";

import { createContext, type ReactNode, use } from "react";
import { winnersOf } from "../_lib/teams.ts";
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
  const finished = live.game?.phase === "finished";
  const winners = live.game && finished ? winnersOf(live.game.scores) : [];

  return (
    <GameContext value={live}>
      <main>
        <WaveBackground
          started={live.game?.phase === "playing" || finished}
          revealing={live.revealing}
          onRevealEnd={live.endReveal}
          takeover={
            live.claimView?.team ?? (winners.length === 1 ? winners[0] : null)
          }
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
