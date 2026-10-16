"use client";

import { useActionState, useEffect, useRef } from "react";
import { changeTeamCount, draftPlayer, startGame } from "../_lib/actions.ts";
import { MAX_TEAMS, MIN_TEAMS, TEAMS } from "../_lib/config.ts";
import {
  MAX_PLAYER_NAME_LENGTH,
  PLAYERS_PER_TEAM,
  TEAM_TEXT,
} from "../_lib/teams.ts";
import { useGuardedAction } from "../_lib/use-guarded-action.ts";
import { useGame } from "./game-scene.tsx";

const DRAFT_DELAY = 120;

export function TeamSetup() {
  const { gameId, game } = useGame();
  const [error, formAction, pending] = useActionState(
    startGame.bind(null, gameId),
    null,
  );
  const resizing = useGuardedAction();
  const draftTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const teams = game?.players.length ?? MIN_TEAMS;
  const message = error ?? resizing.error;

  useEffect(() => {
    const timers = draftTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const sendDraft = (team: number, slot: number, name: string) => {
    const key = `${team}-${slot}`;
    clearTimeout(draftTimers.current.get(key));
    draftTimers.current.set(
      key,
      setTimeout(() => draftPlayer(gameId, team, slot, name), DRAFT_DELAY),
    );
  };

  const resize = (count: number) =>
    resizing.run(() => changeTeamCount(gameId, count));

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-3xl bg-white p-6 text-left text-ink shadow-xl"
    >
      <h2 className="text-2xl font-bold">Composer les équipes</h2>
      {Array.from({ length: teams }, (_, i) => (
        <fieldset key={i} className="mt-6">
          <legend
            className={`flex w-full items-center justify-between text-sm font-semibold uppercase tracking-widest ${TEAM_TEXT[i]}`}
          >
            {TEAMS[i]}
            {i === teams - 1 && teams > MIN_TEAMS && (
              <button
                type="button"
                disabled={resizing.pending}
                onClick={() => resize(teams - 1)}
                className="rounded-full px-2 py-1 text-xs font-medium normal-case tracking-normal text-ink/50 transition enabled:hover:bg-ink/5 enabled:hover:text-ink disabled:opacity-60"
              >
                Retirer
              </button>
            )}
          </legend>
          {Array.from({ length: PLAYERS_PER_TEAM }, (_, slot) => (
            <input
              key={slot}
              name={`player-${i}-${slot}`}
              aria-label={`${TEAMS[i]}, joueur ${slot + 1}`}
              placeholder={`Joueur ${slot + 1}`}
              defaultValue={game?.players[i]?.[slot] ?? ""}
              required
              maxLength={MAX_PLAYER_NAME_LENGTH}
              autoComplete="off"
              onChange={(event) => sendDraft(i, slot, event.target.value)}
              className="mt-2 w-full rounded-xl border border-ink/20 px-4 py-3 text-base outline-none focus:border-ink"
            />
          ))}
        </fieldset>
      ))}
      {teams < MAX_TEAMS && (
        <button
          type="button"
          disabled={resizing.pending}
          onClick={() => resize(teams + 1)}
          className="mt-6 w-full rounded-xl border-2 border-dashed border-ink/20 py-3 text-sm font-semibold text-ink/60 transition enabled:hover:border-ink/40 enabled:hover:text-ink disabled:opacity-60"
        >
          + Ajouter une équipe
        </button>
      )}
      {message && (
        <p role="alert" className="mt-3 text-sm text-team-2">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-ink py-3 font-semibold text-paper transition disabled:opacity-60"
      >
        Lancer la partie
      </button>
    </form>
  );
}
