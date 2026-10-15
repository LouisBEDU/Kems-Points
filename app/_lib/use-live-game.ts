import { useCallback, useEffect, useState } from "react";
import type { GameState } from "./games.ts";

type LiveState = { game: GameState | null; revealing: boolean };
export type LiveGame = LiveState & { gameId: string; endReveal: () => void };

export function useLiveGame(gameId: string): LiveGame {
  const [state, setState] = useState<LiveState>({
    game: null,
    revealing: false,
  });

  useEffect(() => {
    const source = new EventSource(`/api/games/${gameId}`);
    source.onmessage = (event) => {
      const game: GameState = JSON.parse(event.data);
      setState((previous) => ({
        game,
        revealing:
          previous.revealing ||
          (previous.game?.started === false && game.started),
      }));
    };
    return () => source.close();
  }, [gameId]);

  const endReveal = useCallback(
    () => setState((previous) => ({ ...previous, revealing: false })),
    [],
  );

  return { ...state, gameId, endReveal };
}
