"use client";

import { useActionState, useEffect, useRef } from "react";
import { draftPlayer, startGame } from "../_lib/actions.ts";
import { TEAMS } from "../_lib/config.ts";
import { MAX_PLAYER_NAME_LENGTH, PLAYERS_PER_TEAM } from "../_lib/teams.ts";
import { useGame } from "./game-scene.tsx";

const TEAM_COLORS = ["text-team-1", "text-team-2"];
const DRAFT_DELAY = 120;

export function TeamSetup() {
  const { gameId, game } = useGame();
  const [error, formAction, pending] = useActionState(
    startGame.bind(null, gameId),
    null,
  );
  const draftTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

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

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-3xl bg-white p-6 text-left text-ink shadow-xl"
    >
      <h2 className="text-2xl font-bold">Composer les équipes</h2>
      {TEAMS.map((team, i) => (
        <fieldset key={team} className="mt-6">
          <legend
            className={`text-sm font-semibold uppercase tracking-widest ${TEAM_COLORS[i]}`}
          >
            {team}
          </legend>
          {Array.from({ length: PLAYERS_PER_TEAM }, (_, slot) => (
            <input
              key={slot}
              name={`player-${i}-${slot}`}
              aria-label={`${team}, joueur ${slot + 1}`}
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
      {error && (
        <p role="alert" className="mt-3 text-sm text-team-2">
          {error}
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
