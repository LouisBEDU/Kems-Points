import { TEAMS } from "./config.ts";

export type Scores = number[];
type Listener = (scores: Scores) => void;
type Store = { scores: Scores; listeners: Set<Listener> };

const shared = globalThis as typeof globalThis & { kemsScores?: Store };
const store = (shared.kemsScores ??= {
  scores: TEAMS.map(() => 0),
  listeners: new Set(),
});

export function getScores(): Scores {
  return [...store.scores];
}

export function subscribe(listener: Listener) {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

export function updateScore(team: number, delta: number): Promise<Scores> {
  store.scores[team] = Math.max(0, store.scores[team] + delta);
  const scores = getScores();
  for (const listener of store.listeners) {
    try {
      listener(scores);
    } catch {
      store.listeners.delete(listener);
    }
  }
  return Promise.resolve(scores);
}
