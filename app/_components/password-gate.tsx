"use client";

import { useActionState } from "react";
import { enterGame } from "../_lib/actions.ts";
import type { GamePhase } from "../_lib/games.ts";
import { useGame } from "./game-scene.tsx";

export function PasswordGate({
  name,
  phase: initialPhase,
}: {
  name: string;
  phase: GamePhase;
}) {
  const { gameId, game } = useGame();
  const creating = (game?.phase ?? initialPhase) === "waiting";
  const [error, formAction, pending] = useActionState(
    enterGame.bind(null, gameId),
    null,
  );

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-ink shadow-xl"
      >
        <h1 className="text-2xl font-bold">
          {creating ? "Créer la partie" : "Rejoindre la partie"}
        </h1>
        <p className="mt-1 text-sm text-ink/60">{name}</p>
        <label htmlFor="password" className="mt-6 block text-sm font-medium">
          {creating
            ? "Choisis le mot de passe de la partie"
            : "Mot de passe de la partie"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={4}
          maxLength={128}
          autoComplete={creating ? "new-password" : "current-password"}
          className="mt-2 w-full rounded-xl border border-ink/20 px-4 py-3 text-base outline-none focus:border-ink"
        />
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
          {creating ? "Continuer" : "Rejoindre"}
        </button>
      </form>
    </div>
  );
}
