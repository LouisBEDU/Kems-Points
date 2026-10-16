import { useEffect, useState, useTransition } from "react";

const ACTION_ERROR = "L'action n'a pas abouti, réessaie.";
const ERROR_DURATION = 4000;

export function useGuardedAction() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), ERROR_DURATION);
    return () => clearTimeout(timer);
  }, [error]);

  const run = (action: () => Promise<unknown>) => {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch {
        setError(ACTION_ERROR);
      }
    });
  };

  return { pending, error, run };
}
