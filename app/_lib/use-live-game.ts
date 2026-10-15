import { useCallback, useEffect, useState } from "react";
import type { Claim } from "./claims.ts";
import type { GameState } from "./games.ts";

type LiveState = {
  game: GameState | null;
  revealing: boolean;
  claimView: Claim | null;
};
export type LiveGame = LiveState & {
  gameId: string;
  endReveal: () => void;
  endClaim: () => void;
};

export function useLiveGame(gameId: string): LiveGame {
  const [state, setState] = useState<LiveState>({
    game: null,
    revealing: false,
    claimView: null,
  });

  useEffect(() => {
    const source = new EventSource(`/api/games/${gameId}`);
    source.onmessage = (event) => {
      const game: GameState = JSON.parse(event.data);
      setState((previous) => {
        const { claim } = game;
        const followsClaim =
          claim !== null &&
          (claim.status === "pending" || claim.id === previous.claimView?.id);
        return {
          game,
          revealing:
            previous.revealing ||
            (previous.game !== null &&
              previous.game.phase !== "playing" &&
              game.phase === "playing"),
          claimView: followsClaim ? claim : previous.claimView,
        };
      });
    };
    return () => source.close();
  }, [gameId]);

  const endReveal = useCallback(
    () => setState((previous) => ({ ...previous, revealing: false })),
    [],
  );

  const endClaim = useCallback(
    () =>
      setState((previous) => ({
        ...previous,
        claimView:
          previous.claimView?.status === "pending" ? previous.claimView : null,
      })),
    [],
  );

  return { ...state, gameId, endReveal, endClaim };
}
