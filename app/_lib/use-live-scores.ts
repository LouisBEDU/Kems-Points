import { useEffect, useState } from "react";
import type { Scores } from "./scores.ts";

export function useLiveScores() {
  const [scores, setScores] = useState<Scores | null>(null);

  useEffect(() => {
    const source = new EventSource("/api/scores");
    source.onmessage = (event) => setScores(JSON.parse(event.data));
    return () => source.close();
  }, []);

  return scores;
}
