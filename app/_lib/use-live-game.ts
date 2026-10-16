import { useCallback, useEffect, useState } from "react";
import type { Claim } from "./claims.ts";
import { HEARTBEAT_INTERVAL } from "./config.ts";
import type { GameState } from "./games.ts";

const STALL_TIMEOUT = HEARTBEAT_INTERVAL * 3;
const RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30 * 1000;

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
    let source: EventSource | null = null;
    let stallTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = RETRY_DELAY;

    function receive(event: MessageEvent<string>) {
      watch();
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
              previous.game.phase === "waiting" &&
              game.phase !== "waiting"),
          claimView: followsClaim ? claim : previous.claimView,
        };
      });
    }

    function watch() {
      clearTimeout(stallTimer);
      stallTimer = setTimeout(reconnect, STALL_TIMEOUT);
    }

    function disconnect() {
      clearTimeout(stallTimer);
      clearTimeout(retryTimer);
      source?.close();
      source = null;
    }

    function connect() {
      disconnect();
      const current = new EventSource(`/api/games/${gameId}`);
      current.onopen = () => {
        retryDelay = RETRY_DELAY;
      };
      current.onmessage = receive;
      current.addEventListener("ping", watch);
      current.onerror = () => {
        if (current.readyState === EventSource.CLOSED) reconnect();
      };
      source = current;
      watch();
    }

    function reconnect() {
      disconnect();
      retryTimer = setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        disconnect();
      } else if (!source) {
        retryDelay = RETRY_DELAY;
        connect();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    if (!document.hidden) connect();
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      disconnect();
    };
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
