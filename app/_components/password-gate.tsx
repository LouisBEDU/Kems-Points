"use client";

import { useActionState } from "react";
import { enterGame } from "../_lib/actions.ts";
import { useGame } from "./game-scene.tsx";

export function PasswordGate({
  name,
  started: initiallyStarted,
}: {
  name: string;
  started: boolean;
}) {
  const { gameId, game } = useGame();
  const started = game?.started ?? initiallyStarted;
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
          {started ? "Rejoindre la partie" : "Lancer la partie"}
        </h1>
        <p className="mt-1 text-sm text-ink/60">{name}</p>
        <label htmlFor="password" className="mt-6 block text-sm font-medium">
          {started
            ? "Mot de passe de la partie"
            : "Choisis le mot de passe de la partie"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={4}
          maxLength={128}
          autoComplete={started ? "current-password" : "new-password"}
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
          {started ? "Rejoindre" : "Lancer la partie"}
        </button>
      </form>
    </div>
  );
}
