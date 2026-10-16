"use client";

import { useState } from "react";
import { endGame } from "../_lib/actions.ts";
import { useGuardedAction } from "../_lib/use-guarded-action.ts";
import { ActionError } from "./action-error.tsx";

const buttonClass =
  "rounded-full px-4 py-2 text-sm font-semibold transition enabled:active:scale-95 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function EndGameButton({ gameId }: { gameId: string }) {
  const [confirming, setConfirming] = useState(false);
  const { pending: ending, error, run } = useGuardedAction();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`${buttonClass} bg-white/10 enabled:hover:bg-white/20`}
      >
        Fin de partie
      </button>
    );
  }

  return (
    <>
      <div
        role="group"
        aria-label="Terminer la partie"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <span className="text-sm font-semibold">Terminer la partie ?</span>
        <button
          type="button"
          disabled={ending}
          onClick={() => run(() => endGame(gameId))}
          className={`${buttonClass} bg-white text-ink`}
        >
          Terminer
        </button>
        <button
          type="button"
          disabled={ending}
          onClick={() => setConfirming(false)}
          className={`${buttonClass} bg-white/15 enabled:hover:bg-white/25`}
        >
          Annuler
        </button>
      </div>
      <ActionError message={error} />
    </>
  );
}
